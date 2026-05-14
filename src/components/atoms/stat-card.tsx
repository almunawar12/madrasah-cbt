import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: LucideIcon;
  iconVariant?: 'primary' | 'secondary' | 'tertiary' | 'accent';
  live?: boolean;
}

const iconBg: Record<string, string> = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary-container/30 text-secondary',
  tertiary: 'bg-tertiary-container/10 text-tertiary',
  accent: 'bg-primary-container text-on-primary-container',
};

export function StatCard({ label, value, trend, trendUp, icon: Icon, iconVariant = 'primary', live }: StatCardProps) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <span className={cn('p-2 rounded-lg', iconBg[iconVariant])}>
          <Icon className="w-5 h-5" />
        </span>
        {live ? (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container" />
            </span>
            <span className="text-primary-container text-xs font-bold">LIVE</span>
          </div>
        ) : trend ? (
          <span className={cn('text-xs font-bold flex items-center gap-0.5', trendUp ? 'text-primary' : 'text-secondary')}>
            {trendUp ? '↑' : '→'} {trend}
          </span>
        ) : null}
      </div>
      <p className="text-sm text-on-surface-variant font-medium">{label}</p>
      <h3 className="text-2xl font-bold text-on-surface mt-1">{value}</h3>
    </div>
  );
}
