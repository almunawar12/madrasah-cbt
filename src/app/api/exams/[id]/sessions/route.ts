import { NextRequest } from 'next/server';
import { ok, fail } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !['SUPER_ADMIN', 'GURU', 'PENGAWAS'].includes(session.user.role)) {
    return fail('Unauthorized', 403);
  }

  const { id } = await params;

  const sessions = await prisma.examSession.findMany({
    where: { examId: id },
    include: {
      user: { select: { id: true, fullName: true, nis: true, class: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return ok(sessions);
}
