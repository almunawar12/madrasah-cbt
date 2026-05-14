import { NextRequest } from 'next/server';
import { ok, fail } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const classSchema = z.object({
  name: z.string().min(1).max(50),
  academicYear: z.string().regex(/^\d{4}\/\d{4}$/, 'Format: 2024/2025'),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return fail('Unauthorized', 403);

  const classes = await prisma.class.findMany({
    orderBy: [{ academicYear: 'desc' }, { name: 'asc' }],
    include: { _count: { select: { students: true } } },
  });
  return ok(classes);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') return fail('Unauthorized', 403);

  const body = await req.json();
  const parsed = classSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.issues[0].message, 400);

  try {
    const kelas = await prisma.class.create({ data: parsed.data });
    return ok(kelas, 'Kelas berhasil dibuat', 201);
  } catch {
    return fail('Kelas dengan nama dan tahun ajaran tersebut sudah ada', 409);
  }
}
