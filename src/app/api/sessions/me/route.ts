import { ok, fail } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user) return fail('Unauthorized', 403);

  const sessions = await prisma.examSession.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      exam: {
        select: {
          title: true,
          duration: true,
          subject: { select: { name: true } },
          _count: { select: { items: true } },
        },
      },
    },
  });

  return ok(sessions);
}
