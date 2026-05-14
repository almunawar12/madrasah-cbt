import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Email atau NIS wajib diisi')
    .max(100, 'Identifier terlalu panjang')
    .trim(),
  password: z
    .string()
    .min(6, 'Password minimal 6 karakter')
    .max(100, 'Password terlalu panjang'),
});

export type LoginInput = z.infer<typeof loginSchema>;
