import { NextRequest } from 'next/server';
import { ok, fail } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { updateUserSchema } from '@/features/users/validations/user.schema';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') return fail('Unauthorized', 403);

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, fullName: true, email: true, nis: true, role: true, status: true, classId: true, phone: true },
  });
  if (!user) return fail('Pengguna tidak ditemukan', 404);
  return ok(user);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') return fail('Unauthorized', 403);

  const { id } = await params;
  const body = await req.json();
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.issues[0].message, 400);

  try {
    const user = await prisma.user.update({
      where: { id },
      data: parsed.data,
      select: { id: true, fullName: true, email: true, nis: true, role: true, status: true },
    });
    return ok(user, 'Pengguna berhasil diperbarui');
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === 'P2025') return fail('Pengguna tidak ditemukan', 404);
    if (err.code === 'P2002') return fail('Email atau NIS sudah digunakan', 409);
    throw e;
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') return fail('Unauthorized', 403);

  const { id } = await params;
  try {
    await prisma.user.delete({ where: { id } });
    return ok(null, 'Pengguna berhasil dihapus');
  } catch {
    return fail('Pengguna tidak ditemukan', 404);
  }
}
