export const ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  SUPER_ADMIN: '/super-admin',
  GURU: '/guru',
  PENGAWAS: '/pengawas',
  SANTRI: '/santri',
} as const;

export const PUBLIC_ROUTES = ['/login', '/forgot-password'];

export const ROLE_PREFIX = {
  SUPER_ADMIN: '/super-admin',
  GURU: '/guru',
  PENGAWAS: '/pengawas',
  SANTRI: '/santri',
} as const;
