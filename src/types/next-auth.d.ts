import type { DefaultSession } from 'next-auth';
import type { Role } from '@/constants/roles';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
      nis: string | null;
      fullName: string;
    } & DefaultSession['user'];
  }

  interface User {
    role: Role;
    nis: string | null;
    fullName: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
    nis: string | null;
    fullName: string;
  }
}
