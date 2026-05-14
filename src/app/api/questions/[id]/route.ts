import { NextRequest } from 'next/server';
import { ok, fail } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { updateQuestionSchema } from '@/features/questions/validations/question.schema';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !['SUPER_ADMIN', 'GURU'].includes(session.user.role)) return fail('Unauthorized', 403);

  const { id } = await params;
  const q = await prisma.question.findUnique({
    where: { id },
    include: { subject: { select: { name: true } }, options: { orderBy: { order: 'asc' } } },
  });
  if (!q) return fail('Soal tidak ditemukan', 404);
  return ok(q);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !['SUPER_ADMIN', 'GURU'].includes(session.user.role)) return fail('Unauthorized', 403);

  const { id } = await params;
  const body = await req.json();
  const parsed = updateQuestionSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.issues[0].message, 400);

  const { options, ...data } = parsed.data;
  const q = await prisma.question.update({
    where: { id },
    data: {
      ...data,
      ...(options ? {
        options: {
          deleteMany: {},
          create: options.map((o, i) => ({ ...o, order: i })),
        },
      } : {}),
    },
    include: { subject: { select: { name: true } }, options: true },
  });
  return ok(q, 'Soal diperbarui');
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !['SUPER_ADMIN', 'GURU'].includes(session.user.role)) return fail('Unauthorized', 403);

  const { id } = await params;
  try {
    await prisma.question.delete({ where: { id } });
    return ok(null, 'Soal dihapus');
  } catch {
    return fail('Soal tidak ditemukan', 404);
  }
}
