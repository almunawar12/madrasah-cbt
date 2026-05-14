import { NextRequest } from 'next/server';
import { ok, fail } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !['SUPER_ADMIN', 'GURU'].includes(session.user.role)) {
    return fail('Unauthorized', 403);
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') ?? 'overview';
  const examId = searchParams.get('examId') ?? undefined;

  if (type === 'overview') {
    const [totalExams, totalSessions, totalStudents, totalViolations] = await Promise.all([
      prisma.exam.count(),
      prisma.examSession.count({ where: { status: { in: ['SUBMITTED', 'FORCE_SUBMITTED'] } } }),
      prisma.user.count({ where: { role: 'SANTRI' } }),
      prisma.examSession.aggregate({ _sum: { violationCount: true } }),
    ]);

    const avgScore = await prisma.examSession.aggregate({
      _avg: { score: true },
      where: { score: { not: null } },
    });

    return ok({
      totalExams,
      totalSessions,
      totalStudents,
      totalViolations: totalViolations._sum.violationCount ?? 0,
      avgScore: Math.round(avgScore._avg.score ?? 0),
    });
  }

  if (type === 'by-exam' && examId) {
    const sessions = await prisma.examSession.findMany({
      where: { examId, status: { in: ['SUBMITTED', 'FORCE_SUBMITTED'] } },
      include: {
        user: { select: { fullName: true, nis: true, class: { select: { name: true } } } },
      },
      orderBy: { score: 'desc' },
    });

    const scores = sessions.map((s) => s.score ?? 0).filter((s) => s > 0);
    const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const highest = scores.length > 0 ? Math.max(...scores) : 0;
    const lowest = scores.length > 0 ? Math.min(...scores) : 0;
    const passing = scores.filter((s) => s >= 70).length;

    return ok({ sessions, stats: { avg, highest, lowest, passing, total: sessions.length } });
  }

  if (type === 'by-class') {
    const classes = await prisma.class.findMany({
      include: {
        students: {
          include: {
            examSessions: {
              where: { score: { not: null } },
              select: { score: true },
            },
          },
        },
      },
      orderBy: [{ academicYear: 'desc' }, { name: 'asc' }],
    });

    const result = classes.map((c) => {
      const scores = c.students.flatMap((s) => s.examSessions.map((es) => es.score ?? 0)).filter((s) => s > 0);
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      return { id: c.id, name: c.name, academicYear: c.academicYear, studentCount: c.students.length, avgScore: avg, examCount: scores.length };
    });

    return ok(result);
  }

  return fail('Tipe laporan tidak valid', 400);
}
