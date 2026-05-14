import { NextRequest } from 'next/server';
import { ok, fail } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

// GET /api/users/[id]/subjects — list assigned subjects
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') return fail('Unauthorized', 403);

  const { id } = await params;
  const assignments = await prisma.userSubject.findMany({
    where: { userId: id },
    include: { subject: { select: { id: true, name: true } } },
  });

  return ok(assignments.map((a) => a.subject));
}

const putSchema = z.object({ subjectIds: z.array(z.string().uuid()) });

// PUT /api/users/[id]/subjects — replace all subject assignments
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') return fail('Unauthorized', 403);

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (!user) return fail('User tidak ditemukan', 404);
  if (user.role !== 'GURU') return fail('Hanya guru yang dapat di-assign mapel', 400);

  const body = await req.json();
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.issues[0].message, 400);

  // Replace: delete all then insert new
  await prisma.$transaction([
    prisma.userSubject.deleteMany({ where: { userId: id } }),
    ...parsed.data.subjectIds.map((subjectId) =>
      prisma.userSubject.create({ data: { userId: id, subjectId } }),
    ),
  ]);

  const updated = await prisma.userSubject.findMany({
    where: { userId: id },
    include: { subject: { select: { id: true, name: true } } },
  });

  return ok(updated.map((a) => a.subject), 'Mapel berhasil diperbarui');
}
