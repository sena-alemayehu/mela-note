
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { ZodError } from 'zod';
import { AuthService } from './auth.service';
import {
  loginSchema,
  registerSchema,
} from './auth.schemas';

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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: unknown) {
    const validatedBody = validateRequest(registerSchema, body);

    return this.authService.register(validatedBody);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: unknown) {
    const validatedBody = validateRequest(loginSchema, body);

    return this.authService.login(validatedBody);
  }
}
