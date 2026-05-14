import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from '@/lib/auth.config';
import { loginSchema } from '@/features/auth/validations/login.schema';
import { verifyCredentials } from '@/features/auth/services/auth.service';

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        identifier: {},
        password: {},
      },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;

        const user = await verifyCredentials(
          parsed.data.identifier,
          parsed.data.password,
        );
        if (!user) return null;

        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.fullName,
          fullName: user.fullName,
          nis: user.nis,
          role: user.role,
        };
      },
    }),
  ],
});
