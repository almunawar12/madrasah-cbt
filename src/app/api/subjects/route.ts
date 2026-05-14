import { NextRequest } from 'next/server';
import { ok, fail } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const subjectSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return fail('Unauthorized', 403);

  const subjects = await prisma.subject.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { questions: true, exams: true } } },
  });
  return ok(subjects);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !['SUPER_ADMIN', 'GURU'].includes(session.user.role)) return fail('Unauthorized', 403);

  const body = await req.json();
  const parsed = subjectSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.issues[0].message, 400);

  try {
    const subject = await prisma.subject.create({ data: parsed.data });
    return ok(subject, 'Mata pelajaran berhasil dibuat', 201);
  } catch {
    return fail('Nama mata pelajaran sudah ada', 409);
  }
}
