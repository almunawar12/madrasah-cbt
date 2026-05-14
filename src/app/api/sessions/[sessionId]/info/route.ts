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
    select: {
      id: true,
      status: true,
      userId: true,
      exam: {
        select: {
          id: true,
          title: true,
          duration: true,
          startTime: true,
          endTime: true,
          _count: { select: { items: true } },
          subject: { select: { name: true } },
        },
      },
    },
  });

  if (!examSession) return fail('Sesi tidak ditemukan', 404);
  if (examSession.userId !== session.user.id) return fail('Unauthorized', 403);
  if (examSession.status === 'SUBMITTED' || examSession.status === 'FORCE_SUBMITTED') {
    return fail('Ujian sudah dikumpulkan', 409);
  }
  if (examSession.status === 'BLOCKED') {
    return fail('Akses Anda diblokir untuk ujian ini', 403);
  }

  return ok(examSession);
}
