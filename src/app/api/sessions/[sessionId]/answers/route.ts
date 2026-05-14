import { NextRequest } from 'next/server';
import { ok, fail } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const saveAnswerSchema = z.object({
  questionId: z.string().uuid(),
  optionId: z.string().uuid().optional(),
  essayText: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const session = await auth();
  if (!session?.user) return fail('Unauthorized', 403);

  const { sessionId } = await params;
  const examSession = await prisma.examSession.findUnique({ where: { id: sessionId } });
  if (!examSession || examSession.userId !== session.user.id) return fail('Sesi tidak ditemukan', 404);
  if (examSession.status === 'SUBMITTED' || examSession.status === 'FORCE_SUBMITTED') {
    return fail('Ujian sudah dikumpulkan', 400);
  }

  const body = await req.json();
  const parsed = saveAnswerSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.issues[0].message, 400);

  const { questionId, optionId, essayText } = parsed.data;

  let isCorrect: boolean | null = null;
  if (optionId) {
    const option = await prisma.questionOption.findUnique({ where: { id: optionId } });
    isCorrect = option?.isCorrect ?? null;
  }

  const answer = await prisma.answer.upsert({
    where: { sessionId_questionId: { sessionId, questionId } },
    create: { sessionId, questionId, userId: session.user.id, optionId, essayText, isCorrect },
    update: { optionId, essayText, isCorrect },
  });

  if (examSession.status === 'WAITING') {
    await prisma.examSession.update({ where: { id: sessionId }, data: { status: 'IN_PROGRESS', startedAt: new Date() } });
  }

  return ok(answer, 'Jawaban tersimpan');
}
