import { NextRequest } from 'next/server';
import { ok, fail } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logAudit, getIp } from '@/lib/audit';
import { createUserSchema } from '@/features/users/validations/user.schema';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return fail('Unauthorized', 403);
  }

  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role') ?? undefined;
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const limit = Math.min(100, Number(searchParams.get('limit') ?? '20'));
  const skip = (page - 1) * limit;

  const where = role ? { role: role as never } : {};
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true, fullName: true, email: true, nis: true, role: true, status: true, classId: true, createdAt: true,
        class: { select: { name: true, academicYear: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return ok({ users, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return fail('Unauthorized', 403);
  }

  const body = await req.json();
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0].message, 400);
  }

  const { password, ...data } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await prisma.user.create({
      data: { ...data, passwordHash },
      select: { id: true, fullName: true, email: true, nis: true, role: true, status: true },
    });
    await logAudit(session.user.id, 'USER_CREATE', `user:${user.id}`, { role: user.role }, getIp(req));
    return ok(user, 'Pengguna berhasil dibuat', 201);
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === 'P2002') return fail('Email atau NIS sudah digunakan', 409);
    throw e;
  }
}
