import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../generated/prisma/client';
import { PasswordUtil } from './password.util';
import { AuditLogService } from '../audit/audit-log.service';

export interface AuthContext {
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly auditLog: AuditLogService,
  ) {}

  async register(body: Record<string, unknown>, ctx?: AuthContext) {
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const email =
      typeof body?.email === 'string'
        ? body.email.trim().toLowerCase()
        : '';
    const password =
      typeof body?.password === 'string' ? body.password : '';

    if (!name || !email || !password) {
      throw new BadRequestException(
        'Name, email, and password are required.',
      );
    }

    if (name.length > 120) {
      throw new BadRequestException('Name must be 120 characters or fewer.');
    }

    if (
      email.length > 191 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      throw new BadRequestException('Please provide a valid email address.');
    }

    if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
      throw new BadRequestException(
        'Password must be at least 8 characters and no more than 72 UTF-8 bytes.',
      );
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException(
        'An account with this email already exists.',
      );
    }

    // Password hashed with Argon2id
    const passwordHash = await PasswordUtil.hash(password);

    let user;

    try {
      user = await this.prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: Role.USER,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'An account with this email already exists.',
        );
      }

      throw error;
    }

    // Audit log registration
    await this.auditLog.logAction({
      userId: user.id,
      action: 'REGISTER',
      details: { email: user.email },
      ipAddress: ctx?.ipAddress,
      userAgent: ctx?.userAgent,
    });

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'Registration successful.',
      user,
      accessToken,
    };
  }

  async login(body: Record<string, unknown>, ctx?: AuthContext) {
    const email =
      typeof body?.email === 'string'
        ? body.email.trim().toLowerCase()
        : '';

    const password =
      typeof body?.password === 'string' ? body.password : '';

    if (!email || !password) {
      throw new BadRequestException(
        'Email and password are required.',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    const now = new Date();

    // Check account lockout
    if (user && user.lockedUntil && user.lockedUntil > now) {
      const remainingMinutes = Math.max(
        1,
        Math.ceil((user.lockedUntil.getTime() - now.getTime()) / (60 * 1000)),
      );

      await this.auditLog.logAction({
        userId: user.id,
        action: 'LOGIN_BLOCKED_LOCKED',
        details: { remainingMinutes },
        ipAddress: ctx?.ipAddress,
        userAgent: ctx?.userAgent,
      });

      throw new UnauthorizedException(
        `Account is temporarily locked due to repeated failed login attempts. Please try again in ${remainingMinutes} minute(s).`,
      );
    }

    if (!user) {
      await this.auditLog.logAction({
        action: 'LOGIN_FAILED',
        details: { email, reason: 'user_not_found' },
        ipAddress: ctx?.ipAddress,
        userAgent: ctx?.userAgent,
      });
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Verify password using Argon2id (with fallback to legacy bcrypt if needed)
    const { isValid, needsRehash } = await PasswordUtil.verify(
      user.passwordHash,
      password,
    );

    if (!isValid) {
      const newFailedCount = user.failedLoginAttempts + 1;

      if (newFailedCount >= this.MAX_FAILED_ATTEMPTS) {
        const lockoutUntil = new Date(Date.now() + this.LOCKOUT_DURATION_MS);
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: lockoutUntil,
          },
        });

        await this.auditLog.logAction({
          userId: user.id,
          action: 'LOGIN_LOCKOUT',
          details: { lockoutUntil, attempts: newFailedCount },
          ipAddress: ctx?.ipAddress,
          userAgent: ctx?.userAgent,
        });

        throw new UnauthorizedException(
          'Account is temporarily locked for 15 minutes due to 5 consecutive failed login attempts.',
        );
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: { increment: 1 },
        },
      });

      await this.auditLog.logAction({
        userId: user.id,
        action: 'LOGIN_FAILED',
        details: { attempts: newFailedCount },
        ipAddress: ctx?.ipAddress,
        userAgent: ctx?.userAgent,
      });

      throw new UnauthorizedException('Invalid email or password.');
    }

    // Login succeeded: Reset failed attempts & lockout
    const updateData: Record<string, unknown> = {
      failedLoginAttempts: 0,
      lockedUntil: null,
    };

    // Automatically upgrade legacy hash to Argon2id if needed
    if (needsRehash) {
      updateData.passwordHash = await PasswordUtil.hash(password);
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: updateData as any,
    });

    await this.auditLog.logAction({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      ipAddress: ctx?.ipAddress,
      userAgent: ctx?.userAgent,
    });

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'Login successful.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    };
  }

  async logout(userId: string, ctx?: AuthContext) {
    await this.auditLog.logAction({
      userId,
      action: 'LOGOUT',
      ipAddress: ctx?.ipAddress,
      userAgent: ctx?.userAgent,
    });
    return { message: 'Logged out successfully.' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    return user;
  }
}
