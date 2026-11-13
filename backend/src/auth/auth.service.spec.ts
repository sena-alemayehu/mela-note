import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PasswordUtil } from './password.util';
import { Role } from '../generated/prisma/client';

describe('AuthService', () => {
  let authService: AuthService;
  let mockPrisma: any;
  let mockJwtService: any;
  let mockAuditLog: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('test.jwt.token'),
    };

    mockAuditLog = {
      logAction: jest.fn().mockResolvedValue(undefined),
    };

    authService = new AuthService(mockPrisma, mockJwtService, mockAuditLog);
  });

  describe('register', () => {
    it('should register a new user with an Argon2id password hash', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-123',
        name: 'Abebe Bikila',
        email: 'abebe@example.com',
        role: Role.USER,
        createdAt: new Date(),
      });

      const result = await authService.register({
        name: 'Abebe Bikila',
        email: 'abebe@example.com',
        password: 'SecurePassword123',
      });

      expect(result.message).toBe('Registration successful.');
      expect(result.accessToken).toBe('test.jwt.token');
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            passwordHash: expect.stringMatching(/^\$argon2id\$/),
            role: Role.USER,
          }),
        }),
      );
      expect(mockAuditLog.logAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'REGISTER' }),
      );
    });

    it('should throw ConflictException if user already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing-id' });

      await expect(
        authService.register({
          name: 'Existing',
          email: 'existing@example.com',
          password: 'Password123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login & lockout', () => {
    it('should login successfully with valid Argon2 password and reset failed attempts', async () => {
      const password = 'CorrectPassword123';
      const passwordHash = await PasswordUtil.hash(password);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        name: 'Mela User',
        email: 'user@example.com',
        passwordHash,
        role: Role.USER,
        failedLoginAttempts: 2,
        lockedUntil: null,
      });

      mockPrisma.user.update.mockResolvedValue({});

      const result = await authService.login({
        email: 'user@example.com',
        password,
      });

      expect(result.message).toBe('Login successful.');
      expect(result.accessToken).toBe('test.jwt.token');
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            failedLoginAttempts: 0,
            lockedUntil: null,
          }),
        }),
      );
    });

    it('should increment failedLoginAttempts on invalid password', async () => {
      const passwordHash = await PasswordUtil.hash('RealPassword');

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        passwordHash,
        failedLoginAttempts: 1,
        lockedUntil: null,
      });

      await expect(
        authService.login({
          email: 'user@example.com',
          password: 'WrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { failedLoginAttempts: { increment: 1 } },
        }),
      );
    });

    it('should lock account after 5 consecutive failed attempts', async () => {
      const passwordHash = await PasswordUtil.hash('RealPassword');

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        passwordHash,
        failedLoginAttempts: 4, // 5th attempt
        lockedUntil: null,
      });

      await expect(
        authService.login({
          email: 'user@example.com',
          password: 'WrongPassword',
        }),
      ).rejects.toThrow(/temporarily locked for 15 minutes/);

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            failedLoginAttempts: 0,
            lockedUntil: expect.any(Date),
          }),
        }),
      );
    });

    it('should reject login if account is currently locked', async () => {
      const lockedUntil = new Date(Date.now() + 10 * 60 * 1000); // locked for 10 more minutes

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        lockedUntil,
      });

      await expect(
        authService.login({
          email: 'user@example.com',
          password: 'AnyPassword',
        }),
      ).rejects.toThrow(/Account is temporarily locked/);
    });
  });
});
