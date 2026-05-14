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
