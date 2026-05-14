import { Users, GraduationCap, FileText, Activity } from 'lucide-react';
import { StatCard } from '@/components/atoms/stat-card';
import { Badge } from '@/components/atoms/badge';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const metadata = { title: 'Dashboard · SantriExam' };

const initBg = ['bg-primary/10 text-primary', 'bg-secondary-container/30 text-secondary', 'bg-tertiary-container/10 text-tertiary'];

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

function formatRelative(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  return `${Math.floor(hrs / 24)} hari lalu`;
}

export default async function SuperAdminPage() {
  const session = await auth();
  const name = session?.user?.fullName ?? 'Admin';

  const [santriCount, guruCount, examCount, activeSessions, recentAudit, roleDist] = await Promise.all([
    prisma.user.count({ where: { role: 'SANTRI' } }),
    prisma.user.count({ where: { role: 'GURU' } }),
    prisma.exam.count(),
    prisma.examSession.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { fullName: true } } },
    }),
    prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
  ]);

  const totalUsers = roleDist.reduce((s, r) => s + r._count._all, 0);

  const roleMap: Record<string, string> = {
    USER_CREATE: 'Membuat pengguna baru',
    USER_UPDATE: 'Memperbarui pengguna',
    EXAM_CREATE: 'Membuat ujian baru',
    EXAM_SUBMIT: 'Mengumpulkan ujian',
    EXAM_JOIN: 'Bergabung ke ujian',
    EXAM_GRADE: 'Menilai soal essay',
    VIOLATION: 'Pelanggaran dicatat',
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-on-surface">Dashboard Super Admin</h2>
        <p className="text-sm text-on-surface-variant">
          Assalamu&apos;alaikum, {name}. Berikut ringkasan SantriExam hari ini.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Santri" value={santriCount.toLocaleString('id')} icon={Users} iconVariant="primary" />
        <StatCard label="Total Guru" value={guruCount.toLocaleString('id')} icon={GraduationCap} iconVariant="secondary" />
        <StatCard label="Total Ujian" value={examCount.toLocaleString('id')} icon={FileText} iconVariant="tertiary" />
        <StatCard label="Sesi Aktif" value={String(activeSessions)} live icon={Activity} iconVariant="accent" />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/30">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-semibold text-on-surface">Aktivitas Terkini</h4>
          </div>
          {recentAudit.length === 0 ? (
            <p className="text-sm text-on-surface-variant text-center py-8">Belum ada aktivitas.</p>
          ) : (
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
                  {recentAudit.map((a, i) => (
                    <tr key={a.id}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${initBg[i % initBg.length]} flex items-center justify-center text-xs font-bold`}>
                            {getInitials(a.user?.fullName ?? '?')}
                          </div>
                          <span className="text-sm font-medium text-on-surface">{a.user?.fullName ?? '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-on-surface-variant">{roleMap[a.action] ?? a.action}</td>
                      <td className="px-4 py-4 text-sm text-on-surface-variant whitespace-nowrap">{formatRelative(a.createdAt)}</td>
                      <td className="px-4 py-4 text-right">
                        <Badge variant="default">SELESAI</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Role Distribution */}
        <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/30">
          <h4 className="text-lg font-semibold text-on-surface mb-1">Distribusi Pengguna</h4>
          <p className="text-xs text-on-surface-variant mb-6">Jumlah pengguna per kategori</p>
          <div className="flex justify-center mb-6 relative">
            {(() => {
              const r = 76;
              const circ = 2 * Math.PI * r;
              const santri = roleDist.find((x) => x.role === 'SANTRI')?._count._all ?? 0;
              const guru = roleDist.find((x) => x.role === 'GURU')?._count._all ?? 0;
              const others = totalUsers - santri - guru;
              const santriArc = totalUsers > 0 ? (santri / totalUsers) * circ : 0;
              const guruArc = totalUsers > 0 ? (guru / totalUsers) * circ : 0;
              const santriOffset = circ * 0.25;
              const guruOffset = santriOffset - santriArc;
              return (
                <svg className="w-44 h-44 -rotate-90">
                  <circle cx="88" cy="88" r={r} fill="none" stroke="#e6e8ea" strokeWidth="14" />
                  {santri > 0 && <circle cx="88" cy="88" r={r} fill="none" stroke="#006948" strokeWidth="14"
                    strokeDasharray={`${santriArc} ${circ - santriArc}`} strokeDashoffset={santriOffset} />}
                  {guru > 0 && <circle cx="88" cy="88" r={r} fill="none" stroke="#515f74" strokeWidth="14"
                    strokeDasharray={`${guruArc} ${circ - guruArc}`} strokeDashoffset={guruOffset} />}
                  {others > 0 && (() => {
                    const othersArc = (others / totalUsers) * circ;
                    const othersOffset = guruOffset - guruArc;
                    return <circle cx="88" cy="88" r={r} fill="none" stroke="#b8860b" strokeWidth="14"
                      strokeDasharray={`${othersArc} ${circ - othersArc}`} strokeDashoffset={othersOffset} />;
                  })()}
                </svg>
              );
            })()}
            <div className="absolute flex flex-col items-center justify-center" style={{ marginTop: '70px' }}>
              <span className="text-xl font-bold text-on-surface">{totalUsers.toLocaleString('id')}</span>
              <span className="text-[11px] text-on-surface-variant">Total</span>
            </div>
          </div>
          <div className="space-y-3 mt-8">
            {[
              { color: 'bg-primary', label: 'Santri', count: roleDist.find((x) => x.role === 'SANTRI')?._count._all ?? 0 },
              { color: 'bg-secondary', label: 'Guru', count: roleDist.find((x) => x.role === 'GURU')?._count._all ?? 0 },
              { color: 'bg-outline-variant', label: 'Admin & Pengawas', count: roleDist.filter((x) => x.role !== 'SANTRI' && x.role !== 'GURU').reduce((s, x) => s + x._count._all, 0) },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${r.color}`} />
                  <span className="text-on-surface-variant">{r.label}</span>
                </div>
                <span className="font-bold text-on-surface">{r.count.toLocaleString('id')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
