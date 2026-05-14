import { Users, GraduationCap, FileText, Activity } from 'lucide-react';
import { StatCard } from '@/components/atoms/stat-card';
import { Badge } from '@/components/atoms/badge';
import { auth } from '@/lib/auth';

export const metadata = { title: 'Dashboard · SantriExam' };

const recentActivities = [
  { initials: 'ZH', name: 'Zaid Hamdan', action: 'Mengumpulkan "Ujian Fiqh"', time: 'Hari ini, 10:45', status: 'completed' as const },
  { initials: 'UF', name: 'Ustadz Farhan', action: 'Membuat "Kuis Hadits"', time: 'Hari ini, 09:12', status: 'completed' as const },
  { initials: 'MY', name: 'Maryam Yusuf', action: 'Memulai "Dasar Nahwu"', time: 'Hari ini, 08:30', status: 'pending' as const },
];

const initBg = ['bg-primary/10 text-primary', 'bg-secondary-container/30 text-secondary', 'bg-tertiary-container/10 text-tertiary'];

export default async function SuperAdminPage() {
  const session = await auth();
  const name = session?.user?.fullName ?? 'Ustadz';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-on-surface mb-1">Dashboard Super Admin</h2>
        <p className="text-sm text-on-surface-variant">
          Assalamu&apos;alaikum, {name}. Berikut ringkasan SantriExam hari ini.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Santri" value="1.284" trend="+12%" trendUp icon={Users} iconVariant="primary" />
        <StatCard label="Total Guru" value="86" trend="0%" icon={GraduationCap} iconVariant="secondary" />
        <StatCard label="Total Ujian" value="432" trend="+5%" trendUp icon={FileText} iconVariant="tertiary" />
        <StatCard label="Sesi Aktif" value="12" live icon={Activity} iconVariant="accent" />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Bar Chart */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/30">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className="text-lg font-semibold text-on-surface">Aktivitas Ujian</h4>
              <p className="text-xs text-on-surface-variant">Volume ujian 7 hari terakhir</p>
            </div>
          </div>
          <div className="relative h-56">
            <div className="absolute inset-0 flex items-end justify-between px-2 gap-2">
              {[
                { day: 'SEN', pct: 40 }, { day: 'SEL', pct: 65 }, { day: 'RAB', pct: 35 },
                { day: 'KAM', pct: 85 }, { day: 'JUM', pct: 55 }, { day: 'SAB', pct: 75 }, { day: 'MIN', pct: 45 },
              ].map(({ day, pct }) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-lg bg-primary-container/50 hover:bg-primary-container/80 transition-colors cursor-pointer"
                    style={{ height: `${pct}%` }}
                  />
                  <span className="text-[10px] font-bold text-on-surface-variant">{day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Role Distribution */}
        <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/30">
          <h4 className="text-lg font-semibold text-on-surface mb-1">Distribusi Pengguna</h4>
          <p className="text-xs text-on-surface-variant mb-6">Jumlah pengguna per kategori</p>
          <div className="flex justify-center mb-6">
            <svg className="w-44 h-44 -rotate-90">
              <circle cx="88" cy="88" r="76" fill="none" stroke="#e6e8ea" strokeWidth="14" />
              <circle cx="88" cy="88" r="76" fill="none" stroke="#006948" strokeWidth="14"
                strokeDasharray="478" strokeDashoffset="115" />
              <circle cx="88" cy="88" r="76" fill="none" stroke="#515f74" strokeWidth="14"
                strokeDasharray="478" strokeDashoffset="418" />
            </svg>
            <div className="absolute flex flex-col items-center justify-center" style={{ marginTop: '70px' }}>
              <span className="text-xl font-bold text-on-surface">1.385</span>
              <span className="text-[11px] text-on-surface-variant">Total</span>
            </div>
          </div>
          <div className="space-y-3 mt-8">
            {[
              { color: 'bg-primary', label: 'Santri', count: '1.284' },
              { color: 'bg-secondary', label: 'Guru', count: '86' },
              { color: 'bg-outline-variant', label: 'Admin', count: '15' },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${r.color}`} />
                  <span className="text-on-surface-variant">{r.label}</span>
                </div>
                <span className="font-bold text-on-surface">{r.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/30">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-semibold text-on-surface">Aktivitas Terkini</h4>
            <button className="text-sm font-bold text-primary hover:underline">Lihat Semua</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left bg-surface-container-low">
                  {['Pengguna', 'Aksi', 'Waktu', 'Status'].map((h, i) => (
                    <th key={h} className={`px-4 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider ${i === 0 ? 'rounded-l-lg' : ''} ${i === 3 ? 'rounded-r-lg text-right' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {recentActivities.map((a, i) => (
                  <tr key={a.name}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${initBg[i % initBg.length]} flex items-center justify-center text-xs font-bold`}>
                          {a.initials}
                        </div>
                        <span className="text-sm font-medium text-on-surface">{a.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-on-surface-variant">{a.action}</td>
                    <td className="px-4 py-4 text-sm text-on-surface-variant">{a.time}</td>
                    <td className="px-4 py-4 text-right">
                      <Badge variant={a.status === 'completed' ? 'default' : 'secondary'}>
                        {a.status === 'completed' ? 'SELESAI' : 'PENDING'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col">
          <h4 className="text-lg font-semibold text-on-surface mb-6">Status Sistem</h4>
          <div className="space-y-5 flex-1">
            {[
              { label: 'Server Utama', status: 'ONLINE', bar: 94, info: 'Uptime: 99.98% · Latensi: 24ms' },
              { label: 'Database', status: 'STABIL', bar: 88, info: 'Kapasitas: 42% terpakai' },
              { label: 'CDN Edge', status: 'AKTIF', bar: 100, info: 'Regions: 12 Node Global' },
            ].map((s) => (
              <div key={s.label} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-on-surface">{s.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                    </span>
                    <span className="text-primary text-xs font-bold">{s.status}</span>
                  </div>
                </div>
                <div className="w-full bg-outline-variant/20 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${s.bar}%` }} />
                </div>
                <p className="text-[10px] text-on-surface-variant mt-1.5">{s.info}</p>
              </div>
            ))}
          </div>
          <button className="mt-6 w-full py-2 bg-surface-container-high rounded-lg text-sm font-bold text-secondary hover:bg-secondary hover:text-white transition-all">
            Lihat Log Sistem
          </button>
        </div>
      </div>
    </div>
  );
}
