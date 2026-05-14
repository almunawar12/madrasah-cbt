import { Bell, HelpCircle } from 'lucide-react';
import { SearchInput } from '@/components/molecules/search-input';
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
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export function Navbar({ fullName, role }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 h-16 w-full flex justify-between items-center px-8 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant">
      <div className="flex items-center gap-6 flex-1">
        <SearchInput className="max-w-md" placeholder="Cari data, ujian, atau santri…" />
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
        </button>
        <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>

        <div className="h-8 w-px bg-outline-variant mx-1" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-on-surface leading-none">{fullName}</p>
            <p className="text-xs text-on-surface-variant">{ROLE_LABEL[role]}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary-container/20 flex items-center justify-center text-sm font-bold text-primary">
            {getInitials(fullName)}
          </div>
        </div>
      </div>
    </header>
  );
}
