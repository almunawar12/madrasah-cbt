import { NextRequest } from 'next/server';
import { ok, fail } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(_: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const session = await auth();
  if (!session?.user) return fail('Unauthorized', 403);

  const { sessionId } = await params;

  const examSession = await prisma.examSession.findUnique({
    where: { id: sessionId },
    include: {
      exam: {
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
      },
      answers: {
        select: {
          questionId: true, optionId: true, essayText: true, isCorrect: true, score: true,
          question: { select: { type: true, text: true, score: true } },
        },
      },
    },
  });

  if (!examSession) return fail('Sesi tidak ditemukan', 404);
  if (examSession.userId !== session.user.id) return fail('Unauthorized', 403);

  return ok(examSession);
}
