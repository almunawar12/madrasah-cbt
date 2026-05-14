import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import type { Role } from '@/constants/roles';

export interface AuthUser {
  id: string;
  email: string | null;
  nis: string | null;
  fullName: string;
  role: Role;
}

export async function verifyCredentials(
  identifier: string,
  password: string,
): Promise<AuthUser | null> {
  const isEmail = identifier.includes('@');

  const user = await prisma.user.findFirst({
    where: isEmail ? { email: identifier } : { nis: identifier },
  });

  if (!user || user.status !== 'ACTIVE') return null;

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;

  return {
    id: user.id,
    email: user.email,
    nis: user.nis,
    fullName: user.fullName,
    role: user.role as Role,
  };
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}
