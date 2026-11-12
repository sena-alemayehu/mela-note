
import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required.')
    .max(120, 'Name must be 120 characters or fewer.'),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(191, 'Email must be 191 characters or fewer.')
    .email('Please provide a valid email address.'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .refine(
      (password: string) =>
        Buffer.byteLength(password, 'utf8') <= 72,
      'Password must not exceed 72 UTF-8 bytes.',
    ),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Email is required.')
    .max(191, 'Email must be 191 characters or fewer.'),

  password: z
    .string()
    .min(1, 'Password is required.'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
