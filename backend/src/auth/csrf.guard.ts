import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method.toUpperCase();

    // Safe methods do not mutate state
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return true;
    }

    // Public auth routes are exempt (login/register establish the session)
    const url = request.originalUrl || request.url;
    if (
      url.includes('/api/auth/login') ||
      url.includes('/api/auth/register') ||
      url.includes('/api/auth/csrf-token')
    ) {
      return true;
    }

    // If request uses Authorization Bearer header, CSRF attacks cannot forge it
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return true;
    }

    // If request is authenticated via cookies, verify the CSRF token
    const cookieToken = request.cookies?.token;
    if (!cookieToken) {
      // Not authenticated via cookies; standard auth guards will handle authorization
      return true;
    }

    const clientCsrfToken =
      (request.headers['x-csrf-token'] as string) ||
      (request.headers['x-xsrf-token'] as string);
    const expectedCsrfToken = request.cookies?.['XSRF-TOKEN'];

    if (!clientCsrfToken || !expectedCsrfToken || clientCsrfToken !== expectedCsrfToken) {
      throw new ForbiddenException(
        'CSRF token validation failed. Please refresh the page and try again.',
      );
    }

    return true;
  }
}
