import { NextRequest } from 'next/server';
import { ok, fail } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

const ALLOWED_ROLES = ['SUPER_ADMIN', 'GURU', 'PENGAWAS'] as const;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !ALLOWED_ROLES.includes(session.user.role as typeof ALLOWED_ROLES[number])) {
    return fail('Unauthorized', 403);
  }

  const { searchParams } = new URL(req.url);
  const examId = searchParams.get('examId') ?? undefined;
  const type = searchParams.get('type') ?? undefined;
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const limit = Math.min(100, Number(searchParams.get('limit') ?? '20'));
  const skip = (page - 1) * limit;

  const where = {
    violationCount: { gt: 0 },
    ...(examId ? { examId } : {}),
  };

  const [rawSessions, total] = await Promise.all([
    prisma.examSession.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        violationCount: true,
        violations: true,
        status: true,
        startedAt: true,
        user: {
          select: {
            fullName: true,
            nis: true,
            class: { select: { name: true } },
          },
        },
        exam: {
          select: {
            title: true,
            subject: { select: { name: true } },
          },
        },
      },
    }),
    prisma.examSession.count({ where }),
  ]);

  type ViolationEntry = { type: string; at: string; metadata?: Record<string, unknown> };

  const sessions = rawSessions
    .map((s) => {
      const allViolations = (Array.isArray(s.violations) ? s.violations : []) as ViolationEntry[];
      const filteredViolations = type
        ? allViolations.filter((v) => v.type === type)
        : allViolations;

      return {
        id: s.id,
        violationCount: s.violationCount,
        violations: filteredViolations.map((v) => ({ type: v.type, at: v.at })),
        status: s.status,
        startedAt: s.startedAt,
        user: s.user,
        exam: s.exam,
      };
    })
    .filter((s) => (type ? s.violations.length > 0 : true));

  return ok({ sessions, total, page, limit });
}
