import { prisma } from '@/lib/prisma';

export function generateToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${seg(3)}-${seg(4)}-${seg(3)}`;
}

export async function getExamWithQuestions(examId: string) {
  return prisma.exam.findUnique({
    where: { id: examId },
    include: {
      subject: { select: { name: true } },
      items: {
        orderBy: { order: 'asc' },
        include: {
          question: {
            include: { options: { orderBy: { order: 'asc' } } },
          },
        },
      },
    },
  });
}

// Called at submit time — only MC (essay not yet graded)
export async function calculateScore(sessionId: string): Promise<number> {
  const answers = await prisma.answer.findMany({
    where: { sessionId },
    include: { question: true },
  });

  let total = 0;
  let earned = 0;
  for (const ans of answers) {
    if (ans.question.type === 'MULTIPLE_CHOICE') {
      total += ans.question.score;
      if (ans.isCorrect) earned += ans.question.score;
    }
  }
  return total > 0 ? Math.round((earned / total) * 100) : 0;
}

// Called after guru grades essay — recalculates including all graded answers
export async function recalculateSessionScore(sessionId: string): Promise<number> {
  const answers = await prisma.answer.findMany({
    where: { sessionId },
    include: { question: true },
  });

  // Total possible = all questions in the exam (MC + essay)
  const examSession = await prisma.examSession.findUnique({
    where: { id: sessionId },
    include: { exam: { include: { items: { include: { question: true } } } } },
  });
  if (!examSession) return 0;

  const totalPossible = examSession.exam.items.reduce((s, i) => s + i.question.score, 0);
  if (totalPossible === 0) return 0;

  let earned = 0;
  for (const ans of answers) {
    if (ans.question.type === 'MULTIPLE_CHOICE' && ans.isCorrect) {
      earned += ans.question.score;
    } else if (ans.question.type === 'ESSAY' && ans.score != null) {
      earned += ans.score;
    }
  }

  return Math.round((earned / totalPossible) * 100);
}
