import { ForbiddenException, ExecutionContext } from '@nestjs/common';
import { CsrfGuard } from './csrf.guard';

describe('CsrfGuard', () => {
  let guard: CsrfGuard;

  beforeEach(() => {
    guard = new CsrfGuard();
  });

  function createMockContext(method: string, url: string, headers: any = {}, cookies: any = {}): ExecutionContext {
    const request = {
      method,
      url,
      originalUrl: url,
      headers,
      cookies,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  }

  it('should allow safe HTTP GET methods without CSRF token', () => {
    const ctx = createMockContext('GET', '/api/notes');
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow requests with Authorization Bearer header', () => {
    const ctx = createMockContext('POST', '/api/notes', {
      authorization: 'Bearer valid.jwt.token',
    });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow public login and register endpoints', () => {
    const ctx = createMockContext('POST', '/api/auth/login');
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should block cookie-authenticated state-changing requests missing CSRF token', () => {
    const ctx = createMockContext(
      'POST',
      '/api/notes',
      {},
      { token: 'cookie.jwt.token' },
    );
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should accept cookie-authenticated state-changing requests with matching CSRF token', () => {
    const ctx = createMockContext(
      'POST',
      '/api/notes',
      { 'x-csrf-token': 'secret-csrf-123' },
      { token: 'cookie.jwt.token', 'XSRF-TOKEN': 'secret-csrf-123' },
    );
    expect(guard.canActivate(ctx)).toBe(true);
  });
});
