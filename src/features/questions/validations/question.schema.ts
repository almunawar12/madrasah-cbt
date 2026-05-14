import { z } from 'zod';

const optionSchema = z.object({
  label: z.string().max(5),
  text: z.string().min(1),
  isCorrect: z.boolean().default(false),
});

export const createQuestionSchema = z.object({
  subjectId: z.string().uuid(),
  type: z.enum(['MULTIPLE_CHOICE', 'ESSAY']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  text: z.string().min(5),
  imageUrl: z.string().url().optional(),
  score: z.number().int().min(1).max(100).default(1),
  options: z.array(optionSchema).min(2).max(10).optional(),
}).refine(
  (data) => data.type === 'ESSAY' || (data.options && data.options.length >= 2),
  { message: 'Pilihan ganda wajib memiliki minimal 2 opsi', path: ['options'] }
);

export const updateQuestionSchema = z.object({
  subjectId: z.string().uuid().optional(),
  type: z.enum(['MULTIPLE_CHOICE', 'ESSAY']).optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  text: z.string().min(5).optional(),
  imageUrl: z.string().url().optional(),
  score: z.number().int().min(1).max(100).optional(),
  options: z.array(optionSchema).min(2).max(10).optional(),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
