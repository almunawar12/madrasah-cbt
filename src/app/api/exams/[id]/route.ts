import { NextRequest } from 'next/server';
import { ok, fail } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { updateExamSchema } from '@/features/exams/validations/exam.schema';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return fail('Unauthorized', 403);

  const { id } = await params;
  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      subject: { select: { name: true } },
      items: { include: { question: { include: { options: { orderBy: { order: 'asc' } } } } }, orderBy: { order: 'asc' } },
      _count: { select: { sessions: true } },
    },
  });
  if (!exam) return fail('Ujian tidak ditemukan', 404);
  return ok(exam);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !['SUPER_ADMIN', 'GURU'].includes(session.user.role)) return fail('Unauthorized', 403);

  const { id } = await params;
  const body = await req.json();
  const parsed = updateExamSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.issues[0].message, 400);

  try {
    const exam = await prisma.exam.update({ where: { id }, data: parsed.data });
    return ok(exam, 'Ujian diperbarui');
  } catch {
    return fail('Ujian tidak ditemukan', 404);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !['SUPER_ADMIN', 'GURU'].includes(session.user.role)) return fail('Unauthorized', 403);

  const { id } = await params;
  try {
    await prisma.exam.delete({ where: { id } });
    return ok(null, 'Ujian dihapus');
  } catch {
    return fail('Ujian tidak ditemukan', 404);
  }
}
