import { Bell, Menu } from 'lucide-react';
import type { Role } from '@/constants/roles';

const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: 'Super Admin',
  GURU: 'Guru',
  PENGAWAS: 'Pengawas',
  SANTRI: 'Santri',
};

interface NavbarProps {
  fullName: string;
  role: Role;
  onMenuClick?: () => void;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export function Navbar({ fullName, role, onMenuClick }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 h-16 w-full flex justify-between items-center px-4 md:px-8 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile/tablet only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
          aria-label="Buka menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand on mobile when sidebar is hidden */}
        <span className="lg:hidden text-base font-bold text-primary">SantriExam</span>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <button className="relative p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
        </button>

        <div className="h-8 w-px bg-outline-variant mx-1 hidden sm:block" />

        <div className="flex items-center gap-2 md:gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-on-surface leading-none">{fullName}</p>
            <p className="text-xs text-on-surface-variant">{ROLE_LABEL[role]}</p>
          </div>
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/10 border-2 border-primary-container/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
            {getInitials(fullName)}
          </div>
        </div>
      </div>
    </header>
  );
}
