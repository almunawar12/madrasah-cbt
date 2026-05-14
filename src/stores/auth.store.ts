import { create } from 'zustand';
import type { Role } from '@/constants/roles';

interface AuthState {
  userId: string | null;
  role: Role | null;
  fullName: string | null;
  setUser: (u: { userId: string; role: Role; fullName: string } | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  role: null,
  fullName: null,
  setUser: (u) =>
    set(
      u
        ? { userId: u.userId, role: u.role, fullName: u.fullName }
        : { userId: null, role: null, fullName: null },
    ),
}));
