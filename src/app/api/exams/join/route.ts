import { NextRequest } from 'next/server';
import { ok, fail } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { logAudit, getIp } from '@/lib/audit';
import { pusherServer, examChannel } from '@/lib/pusher-server';
import { z } from 'zod';

const joinSchema = z.object({ token: z.string().min(1).max(30) });

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 'join-exam', 10, 60_000);
  if (limited) return limited;

  const session = await auth();
  if (!session?.user || session.user.role !== 'SANTRI') return fail('Unauthorized', 403);

  const body = await req.json();
  const parsed = joinSchema.safeParse(body);
  if (!parsed.success) return fail('Token tidak valid', 400);

  const exam = await prisma.exam.findUnique({
    where: { token: parsed.data.token },
    include: { subject: { select: { name: true } }, _count: { select: { items: true } } },
  });

  if (!exam) return fail('Token tidak ditemukan', 404);
  if (exam.status !== 'PUBLISHED' && exam.status !== 'ONGOING') {
    return fail('Ujian belum tersedia', 400);
  }

  const existing = await prisma.examSession.findUnique({
    where: { examId_userId: { examId: exam.id, userId: session.user.id } },
  });
  if (existing?.status === 'SUBMITTED' || existing?.status === 'FORCE_SUBMITTED') {
    return fail('Anda sudah mengumpulkan ujian ini', 409);
  }
  if (existing?.status === 'BLOCKED') {
    return fail('Akses Anda diblokir untuk ujian ini', 403);
  }

  const examSession = existing ?? await prisma.examSession.create({
    data: { examId: exam.id, userId: session.user.id, status: 'WAITING' },
  });

  await logAudit(session.user.id, 'EXAM_JOIN', `exam:${exam.id}`, { token: parsed.data.token, sessionId: examSession.id }, getIp(req));

  await pusherServer.trigger(examChannel(exam.id), 'session-joined', {
    sessionId: examSession.id,
    userId: session.user.id,
    userName: session.user.name,
    at: new Date().toISOString(),
  });

  return ok({ examId: exam.id, sessionId: examSession.id, examTitle: exam.title, subject: exam.subject.name, duration: exam.duration, totalQuestions: exam._count.items });
}
