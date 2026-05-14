import { z } from 'zod';

export const createExamSchema = z.object({
  title: z.string().min(3).max(200),
  subjectId: z.string().uuid(),
  duration: z.number().int().min(5).max(300),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  shuffleQ: z.boolean().default(false),
  shuffleOpts: z.boolean().default(false),
});

export const updateExamSchema = createExamSchema.partial().extend({
  status: z.enum(['DRAFT', 'PUBLISHED', 'ONGOING', 'FINISHED', 'ARCHIVED']).optional(),
});

export type CreateExamInput = z.infer<typeof createExamSchema>;
export type UpdateExamInput = z.infer<typeof updateExamSchema>;
