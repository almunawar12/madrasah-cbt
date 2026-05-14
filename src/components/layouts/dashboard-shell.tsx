import { signOut } from '@/lib/auth';
import { Button } from '@/components/atoms/button';
import type { Role } from '@/constants/roles';

const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: 'Super Admin',
  GURU: 'Guru',
  PENGAWAS: 'Pengawas',
  SANTRI: 'Santri',
};

interface Props {
  role: Role;
  fullName: string;
  children: React.ReactNode;
}

export function DashboardShell({ role, fullName, children }: Props) {
  async function handleSignOut() {
    'use server';
    await signOut({ redirectTo: '/login' });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wide text-emerald-600">
              {ROLE_LABEL[role]}
            </span>
            <span className="text-sm font-medium text-slate-900">{fullName}</span>
          </div>
          <form action={handleSignOut}>
            <Button type="submit" variant="outline" size="sm">
              Keluar
            </Button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
