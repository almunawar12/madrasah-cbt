import { NextRequest } from 'next/server';
import { ok, fail } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !['SUPER_ADMIN', 'GURU'].includes(session.user.role)) return fail('Unauthorized', 403);

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.issues[0].message, 400);

  try {
    const subject = await prisma.subject.update({ where: { id }, data: parsed.data });
    return ok(subject, 'Mata pelajaran diperbarui');
  } catch {
    return fail('Mata pelajaran tidak ditemukan', 404);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') return fail('Unauthorized', 403);

  const { id } = await params;
  try {
    await prisma.subject.delete({ where: { id } });
    return ok(null, 'Mata pelajaran dihapus');
  } catch {
    return fail('Mata pelajaran tidak ditemukan atau masih digunakan', 400);
  }
}
