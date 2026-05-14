'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { BookOpenCheck, LogOut, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  navItems: NavItem[];
  role: string;
}

export function Sidebar({ navItems, role }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] bg-surface-container-highest shadow-[4px_0_24px_rgba(0,105,72,0.08)] flex flex-col py-2 px-4 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 mt-4 px-2">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
          <BookOpenCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-primary leading-none">SantriExam</h1>
          <p className="text-[11px] text-on-surface-variant">Digital Madrasah</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200',
                active
                  ? 'border-l-4 border-tertiary-container bg-primary/8 text-primary font-bold pl-3'
                  : 'text-on-surface-variant hover:text-primary hover:bg-primary/5',
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* CTA */}
      <button className="w-full bg-primary text-white py-3 rounded-xl font-semibold mb-5 flex items-center justify-center gap-2 shadow-md hover:brightness-110 active:scale-95 transition-all text-sm">
        <Plus className="w-4 h-4" />
        Ujian Baru
      </button>

      {/* Logout */}
      <div className="border-t border-outline-variant pt-3 pb-2">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
