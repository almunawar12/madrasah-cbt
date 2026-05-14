'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/components/organisms/sidebar';

interface BottomNavProps {
  navItems: NavItem[];
}

export function BottomNav({ navItems }: BottomNavProps) {
  const pathname = usePathname();
  // Show max 5 items on bottom nav
  const items = navItems.slice(0, 5);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest border-t border-outline-variant/50 flex safe-area-inset-bottom">
      {items.map((item) => {
        const isDashboard = item.label === 'Dashboard';
        const active = isDashboard
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-semibold transition-colors min-h-[56px]',
              active ? 'text-primary' : 'text-on-surface-variant',
            )}
          >
            <span className={cn(
              'p-1.5 rounded-full transition-colors',
              active ? 'bg-primary/10' : '',
            )}>
              {item.icon}
            </span>
            <span className="truncate max-w-[60px] text-center leading-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
