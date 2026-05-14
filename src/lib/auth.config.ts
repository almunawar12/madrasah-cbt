import type { NextAuthConfig } from 'next-auth';
import { ROLE_PREFIX, PUBLIC_ROUTES } from '@/constants/routes';
import type { Role } from '@/constants/roles';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = Boolean(auth?.user);
      const role = auth?.user?.role as Role | undefined;

      if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
        if (isLoggedIn && role) {
          return Response.redirect(new URL(ROLE_PREFIX[role], request.nextUrl));
        }
        return true;
      }

      if (!isLoggedIn) return false;

      const allowedPrefix = role ? ROLE_PREFIX[role] : null;
      const protectedPrefixes = Object.values(ROLE_PREFIX);
      const matched = protectedPrefixes.find((p) => pathname.startsWith(p));

      if (matched && matched !== allowedPrefix) {
        return Response.redirect(new URL(allowedPrefix ?? '/login', request.nextUrl));
      }

      if (pathname === '/' && allowedPrefix) {
        return Response.redirect(new URL(allowedPrefix, request.nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.nis = user.nis;
        token.fullName = user.fullName;
      }
      return token;
    },
    session({ session, token }) {
      const t = token as { id: string; role: Role; nis: string | null; fullName: string };
      session.user.id = t.id;
      session.user.role = t.role;
      session.user.nis = t.nis;
      session.user.fullName = t.fullName;
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
