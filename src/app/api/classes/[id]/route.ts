import { NextRequest } from 'next/server';
import { ok, fail } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  academicYear: z.string().regex(/^\d{4}\/\d{4}$/).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') return fail('Unauthorized', 403);

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.issues[0].message, 400);

  try {
    const kelas = await prisma.class.update({ where: { id }, data: parsed.data });
    return ok(kelas, 'Kelas diperbarui');
  } catch {
    return fail('Kelas tidak ditemukan', 404);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') return fail('Unauthorized', 403);

  const { id } = await params;
  try {
    await prisma.class.delete({ where: { id } });
    return ok(null, 'Kelas dihapus');
  } catch {
    return fail('Kelas tidak ditemukan atau masih memiliki santri', 400);
  }
}
