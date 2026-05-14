import { z } from 'zod';

export const createUserSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email().optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  nis: z.string().min(5).max(20).optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  phone: z.string().optional(),
  role: z.enum(['SUPER_ADMIN', 'GURU', 'PENGAWAS', 'SANTRI']),
  classId: z.string().uuid().optional(),
  password: z.string().min(8).max(100),
});

export const updateUserSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  nis: z.string().min(5).max(20).optional(),
  phone: z.string().optional(),
  classId: z.string().uuid().nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
