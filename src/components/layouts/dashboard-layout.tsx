import { Sidebar } from '@/components/organisms/sidebar';
import { Navbar } from '@/components/organisms/navbar';
import { NAV_ITEMS } from '@/constants/nav-items';
import type { Role } from '@/constants/roles';

interface DashboardLayoutProps {
  role: Role;
  fullName: string;
  children: React.ReactNode;
}

export function DashboardLayout({ role, fullName, children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background islamic-pattern">
      <Sidebar navItems={NAV_ITEMS[role]} role={role} />
      <div className="ml-[280px] flex flex-col flex-1 min-h-screen">
        <Navbar fullName={fullName} role={role} />
        <main className="flex-1 p-8">
          <div className="max-w-[1200px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
