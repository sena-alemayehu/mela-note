import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { randomBytes } from 'crypto';
import { ZodError } from 'zod';
import { AuthService } from './auth.service';
import { loginSchema, registerSchema } from './auth.schemas';
import { JwtAuthGuard, AuthenticatedRequest } from './jwt-auth.guard';

function validateRequest<T>(
  schema: {
    safeParse: (data: unknown) =>
      | { success: true; data: T }
      | { success: false; error: ZodError };
  },
  body: unknown,
): T {
  const result = schema.safeParse(body);

  if (!result.success) {
    throw new BadRequestException({
      message: 'Validation failed.',
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  return result.data;
}

function setAuthCookies(res: Response, accessToken: string): string {
  const isProduction = process.env.NODE_ENV === 'production';

  // Secure HttpOnly cookie for JWT authentication (Task 1)
  res.cookie('token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });

  // CSRF token cookie readable by frontend (Task 2)
  const csrfToken = randomBytes(24).toString('hex');
  res.cookie('XSRF-TOKEN', csrfToken, {
    httpOnly: false,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  });

  return csrfToken;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('csrf-token')
  getCsrfToken(@Res({ passthrough: true }) res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';
    const csrfToken = randomBytes(24).toString('hex');

    res.cookie('XSRF-TOKEN', csrfToken, {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return { csrfToken };
  }

  @Post('register')
  async register(
    @Body() body: unknown,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const validatedBody = validateRequest(registerSchema, body);
    const result = await this.authService.register(validatedBody, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const csrfToken = setAuthCookies(res, result.accessToken);

    return {
      ...result,
      csrfToken,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Max 5 login attempts per minute (Task 3)
  async login(
    @Body() body: unknown,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const validatedBody = validateRequest(loginSchema, body);
    const result = await this.authService.login(validatedBody, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const csrfToken = setAuthCookies(res, result.accessToken);

    return {
      ...result,
      csrfToken,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const isProduction = process.env.NODE_ENV === 'production';

    res.clearCookie('token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });

    res.clearCookie('XSRF-TOKEN', {
      path: '/',
    });

    return this.authService.logout(req.user.sub, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: AuthenticatedRequest) {
    return this.authService.getProfile(req.user.sub);
  }
}
