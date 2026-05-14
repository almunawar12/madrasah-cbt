import { NextRequest } from 'next/server';
import { ok, fail } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logAudit, getIp } from '@/lib/audit';
import { z } from 'zod';

// GET /api/exams/[id]/grade — list all essay answers for this exam
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !['SUPER_ADMIN', 'GURU'].includes(session.user.role)) {
    return fail('Unauthorized', 403);
  }

  const { id } = await params;

  const answers = await prisma.answer.findMany({
    where: {
      session: { examId: id },
      question: { type: 'ESSAY' },
    },
    include: {
      question: { select: { id: true, text: true, score: true } },
      session: {
        select: {
          id: true,
          status: true,
          user: { select: { id: true, fullName: true, nis: true, class: { select: { name: true } } } },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return ok(answers);
}

const gradeSchema = z.object({
  answerId: z.string().uuid(),
  score: z.number().min(0).max(100),
});

// PATCH /api/exams/[id]/grade — grade one essay answer
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !['SUPER_ADMIN', 'GURU'].includes(session.user.role)) {
    return fail('Unauthorized', 403);
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = gradeSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.issues[0].message, 400);

  const { answerId, score } = parsed.data;

  const answer = await prisma.answer.findUnique({
    where: { id: answerId },
    include: { question: true, session: true },
  });
  if (!answer || answer.session.examId !== id) return fail('Jawaban tidak ditemukan', 404);
  if (score > answer.question.score) return fail(`Nilai maks ${answer.question.score}`, 400);

  const updated = await prisma.answer.update({
    where: { id: answerId },
    data: { score, isCorrect: score > 0, gradedAt: new Date() },
  });

  await logAudit(session.user.id, 'ESSAY_GRADE', `answer:${answerId}`, { score, examId: id }, getIp(req));

  return ok(updated, 'Jawaban dinilai');
}
