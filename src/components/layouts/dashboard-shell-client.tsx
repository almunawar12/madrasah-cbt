'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar, type NavItem } from '@/components/organisms/sidebar';
import { Navbar } from '@/components/organisms/navbar';
import { BottomNav } from '@/components/organisms/bottom-nav';
import type { Role } from '@/constants/roles';

interface Props {
  navItems: NavItem[];
  role: Role;
  fullName: string;
  children: React.ReactNode;
}

export function DashboardShellClient({ navItems, role, fullName, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change (mobile nav)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close sidebar on lg breakpoint resize
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent) => { if (e.matches) setSidebarOpen(false); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div className="flex min-h-screen bg-background islamic-pattern">
      <Sidebar
        navItems={navItems}
        role={role}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content — offset only on desktop */}
      <div className="flex flex-col flex-1 min-h-screen lg:ml-[280px]">
        <Navbar
          fullName={fullName}
          role={role}
          onMenuClick={() => setSidebarOpen((o) => !o)}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 lg:pb-8">
          <div className="max-w-[1200px] mx-auto">{children}</div>
        </main>
      </div>

      {/* Bottom nav — mobile/tablet only */}
      <BottomNav navItems={navItems} />
    </div>
  );
}
