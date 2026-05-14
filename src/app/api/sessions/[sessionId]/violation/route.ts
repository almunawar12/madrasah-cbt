import { NextRequest } from 'next/server';
import { ok, fail } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { logAudit, getIp } from '@/lib/audit';
import { pusherServer, examChannel } from '@/lib/pusher-server';
import { z } from 'zod';

const violationSchema = z.object({
  type: z.enum(['TAB_SWITCH', 'FULLSCREEN_EXIT', 'COPY_PASTE', 'RIGHT_CLICK', 'MULTIPLE_LOGIN']),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const limited = rateLimit(req, 'violation', 30, 60_000);
  if (limited) return limited;

  const session = await auth();
  if (!session?.user) return fail('Unauthorized', 403);

  const { sessionId } = await params;
  const examSession = await prisma.examSession.findUnique({ where: { id: sessionId } });
  if (!examSession || examSession.userId !== session.user.id) return fail('Sesi tidak ditemukan', 404);

  const body = await req.json();
  const parsed = violationSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.issues[0].message, 400);

  const existing = Array.isArray(examSession.violations) ? examSession.violations as Array<Record<string, unknown>> : [];
  const entry: Record<string, unknown> = { type: parsed.data.type, at: new Date().toISOString() };
  if (parsed.data.metadata) entry.metadata = parsed.data.metadata;
  const violations = [...existing, entry];

  const updated = await prisma.examSession.update({
    where: { id: sessionId },
    data: { violationCount: { increment: 1 }, violations: violations as never },
  });

  await logAudit(session.user.id, 'VIOLATION', `session:${sessionId}`, { type: parsed.data.type, count: updated.violationCount }, getIp(req));

  pusherServer.trigger(examChannel(examSession.examId), 'violation', {
    sessionId,
    userId: session.user.id,
    userName: session.user.name,
    type: parsed.data.type,
    violationCount: updated.violationCount,
    at: new Date().toISOString(),
  }).catch(() => {});

  return ok({ violationCount: updated.violationCount }, 'Pelanggaran dicatat');
}
