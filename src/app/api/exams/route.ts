import { NextRequest } from 'next/server';
import { ok, fail } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logAudit, getIp } from '@/lib/audit';
import { createExamSchema } from '@/features/exams/validations/exam.schema';
import { generateToken } from '@/features/exams/services/exam.service';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return fail('Unauthorized', 403);

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') ?? undefined;
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const limit = Math.min(50, Number(searchParams.get('limit') ?? '20'));
  const skip = (page - 1) * limit;

  const where = status ? { status: status as never } : {};
  const [exams, total] = await Promise.all([
    prisma.exam.findMany({
      where,
      skip,
      take: limit,
      include: { subject: { select: { name: true } }, _count: { select: { items: true, sessions: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.exam.count({ where }),
  ]);

  return ok({ exams, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !['SUPER_ADMIN', 'GURU'].includes(session.user.role)) {
    return fail('Unauthorized', 403);
  }

  const body = await req.json();
  const parsed = createExamSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.issues[0].message, 400);

  const token = generateToken();
  const exam = await prisma.exam.create({
    data: { ...parsed.data, token },
    include: { subject: { select: { name: true } } },
  });

  await logAudit(session.user.id, 'EXAM_CREATE', `exam:${exam.id}`, { title: exam.title, token }, getIp(req));
  return ok(exam, 'Ujian berhasil dibuat', 201);
}
