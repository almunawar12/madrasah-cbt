import { NextRequest } from 'next/server';
import { ok, fail } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logAudit, getIp } from '@/lib/audit';
import { pusherServer, examChannel } from '@/lib/pusher-server';
import { calculateScore } from '@/features/exams/services/exam.service';

export async function POST(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const session = await auth();
  if (!session?.user) return fail('Unauthorized', 403);

  const { sessionId } = await params;
  const examSession = await prisma.examSession.findUnique({ where: { id: sessionId } });
  if (!examSession || examSession.userId !== session.user.id) return fail('Sesi tidak ditemukan', 404);
  if (examSession.status === 'SUBMITTED' || examSession.status === 'FORCE_SUBMITTED') {
    return fail('Ujian sudah dikumpulkan', 400);
  }

  const score = await calculateScore(sessionId);
  const updated = await prisma.examSession.update({
    where: { id: sessionId },
    data: { status: 'SUBMITTED', submittedAt: new Date(), score },
  });

  await logAudit(session.user.id, 'EXAM_SUBMIT', `session:${sessionId}`, { score: updated.score, examId: examSession.examId }, getIp(req));

  await pusherServer.trigger(examChannel(examSession.examId), 'session-submitted', {
    sessionId,
    userId: session.user.id,
    userName: session.user.name,
    score: updated.score,
    at: updated.submittedAt?.toISOString(),
  });

  return ok({ score: updated.score, submittedAt: updated.submittedAt }, 'Ujian berhasil dikumpulkan');
}
