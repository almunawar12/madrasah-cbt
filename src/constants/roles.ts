export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  GURU: 'GURU',
  PENGAWAS: 'PENGAWAS',
  SANTRI: 'SANTRI',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_HOME: Record<Role, string> = {
  SUPER_ADMIN: '/super-admin',
  GURU: '/guru',
  PENGAWAS: '/pengawas',
  SANTRI: '/santri',
};
