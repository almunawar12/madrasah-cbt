import { NextRequest } from 'next/server';
import { ok, fail } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { createQuestionSchema } from '@/features/questions/validations/question.schema';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !['SUPER_ADMIN', 'GURU'].includes(session.user.role)) return fail('Unauthorized', 403);

  const { searchParams } = new URL(req.url);
  const subjectId = searchParams.get('subjectId') ?? undefined;
  const type = searchParams.get('type') ?? undefined;
  const difficulty = searchParams.get('difficulty') ?? undefined;
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const limit = Math.min(50, Number(searchParams.get('limit') ?? '20'));
  const skip = (page - 1) * limit;

  // GURU: restrict to assigned subjects only
  let subjectFilter: string[] | undefined;
  if (session.user.role === 'GURU') {
    const assignments = await prisma.userSubject.findMany({
      where: { userId: session.user.id },
      select: { subjectId: true },
    });
    subjectFilter = assignments.map((a) => a.subjectId);
  }

  const where = {
    ...(subjectId
      ? { subjectId }
      : subjectFilter
        ? { subjectId: { in: subjectFilter } }
        : {}),
    ...(type ? { type: type as never } : {}),
    ...(difficulty ? { difficulty: difficulty as never } : {}),
  };

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      skip,
      take: limit,
      include: { subject: { select: { name: true } }, options: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.question.count({ where }),
  ]);

  return ok({ questions, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !['SUPER_ADMIN', 'GURU'].includes(session.user.role)) return fail('Unauthorized', 403);

  const body = await req.json();
  const parsed = createQuestionSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.issues[0].message, 400);

  const { options, ...data } = parsed.data;
  const question = await prisma.question.create({
    data: {
      ...data,
      options: options ? { create: options.map((o, i) => ({ ...o, order: i })) } : undefined,
    },
    include: { subject: { select: { name: true } }, options: true },
  });

  return ok(question, 'Soal berhasil dibuat', 201);
}
