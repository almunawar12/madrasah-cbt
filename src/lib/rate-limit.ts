import { NextRequest } from 'next/server';
import { fail } from '@/lib/api-response';

interface Window {
  count: number;
  resetAt: number;
}

const store = new Map<string, Window>();

function getKey(req: NextRequest, prefix: string): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';
  return `${prefix}:${ip}`;
}

export function rateLimit(
  req: NextRequest,
  prefix: string,
  limit: number,
  windowMs: number,
) {
  const key = getKey(req, prefix);
  const now = Date.now();

  const win = store.get(key);
  if (!win || now > win.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  win.count += 1;
  if (win.count > limit) {
    const retryAfter = Math.ceil((win.resetAt - now) / 1000);
    return fail(`Terlalu banyak permintaan. Coba lagi dalam ${retryAfter} detik.`, 429);
  }
  return null;
}

// Cleanup stale entries every 5 minutes
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, win] of store) {
      if (now > win.resetAt) store.delete(key);
    }
  }, 5 * 60 * 1000);
}
