import { prisma } from '@/lib/prisma';

export async function logAudit(
  userId: string,
  action: string,
  resource: string,
  metadata?: Record<string, unknown>,
  ipAddress?: string,
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        metadata: metadata as never,
        ipAddress,
      },
    });
  } catch {
    // Non-fatal — never let audit failure break the main flow
  }
}

export function getIp(req: Request): string | undefined {
  const fwd = (req.headers as Headers).get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return (req.headers as Headers).get('x-real-ip') ?? undefined;
}
