import { DashboardShellClient } from '@/components/layouts/dashboard-shell-client';
import { NAV_ITEMS } from '@/constants/nav-items';
import type { Role } from '@/constants/roles';

interface DashboardLayoutProps {
  role: Role;
  fullName: string;
  children: React.ReactNode;
}

export function DashboardLayout({ role, fullName, children }: DashboardLayoutProps) {
  return (
    <DashboardShellClient navItems={NAV_ITEMS[role]} role={role} fullName={fullName}>
      {children}
    </DashboardShellClient>
  );
}
