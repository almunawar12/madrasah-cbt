import Link from 'next/link';
import { ShieldCheck, Users, AlertTriangle, CheckCircle2, Radio } from 'lucide-react';
import { StatCard } from '@/components/atoms/stat-card';
import { Badge } from '@/components/atoms/badge';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const metadata = { title: 'Dashboard Pengawas · SantriExam' };

const VIOLATION_LABELS: Record<string, string> = {
  TAB_SWITCH: 'Pindah Tab',
  FULLSCREEN_EXIT: 'Keluar Fullscreen',
  COPY_PASTE: 'Copy/Paste',
  RIGHT_CLICK: 'Klik Kanan',
  MULTIPLE_LOGIN: 'Login Ganda',
  VIOLATION: 'Pelanggaran',
};

const INIT_BG = [
  'bg-primary/10 text-primary',
  'bg-orange-100 text-orange-700',
  'bg-red-100 text-red-700',
  'bg-yellow-100 text-yellow-700',
  'bg-purple-100 text-purple-700',
];

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

function getViolationBadge(action: string) {
  const map: Record<string, string> = {
    VIOLATION: 'border-red-200 bg-red-50 text-red-700',
    TAB_SWITCH: 'border-orange-200 bg-orange-50 text-orange-700',
    FULLSCREEN_EXIT: 'border-red-200 bg-red-50 text-red-700',
    COPY_PASTE: 'border-yellow-200 bg-yellow-50 text-yellow-700',
    RIGHT_CLICK: 'border-gray-200 bg-gray-50 text-gray-700',
    MULTIPLE_LOGIN: 'border-red-200 bg-red-50 text-red-700',
  };
  return map[action] ?? 'border-gray-200 bg-gray-50 text-gray-600';
}

export default async function PengawasPage() {
  const session = await auth();
  const name = session?.user?.fullName ?? 'Pengawas';

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    activeExams,
    activeParticipants,
    totalViolationAgg,
    finishedToday,
    recentViolations,
  ] = await Promise.all([
    // Ujian Aktif (PUBLISHED or ONGOING)
    prisma.exam.count({ where: { status: { in: ['PUBLISHED', 'ONGOING'] } } }),

    // Total Peserta sedang ujian
    prisma.examSession.count({ where: { status: 'IN_PROGRESS' } }),

    // Total Pelanggaran (sum of violationCount)
    prisma.examSession.aggregate({ _sum: { violationCount: true } }),

    // Selesai hari ini
    prisma.examSession.count({
      where: {
        status: { in: ['SUBMITTED', 'FORCE_SUBMITTED'] },
        submittedAt: { gte: todayStart },
      },
    }),

    // Recent violations from AuditLog
    prisma.auditLog.findMany({
      where: { action: 'VIOLATION' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { fullName: true } } },
    }),
  ]);

  const totalViolations = totalViolationAgg._sum.violationCount ?? 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">
            Ahlan, {name}
          </h2>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Selamat bertugas. Berikut ringkasan aktivitas ujian saat ini.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-high rounded-full text-sm text-on-surface-variant self-start">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>Mode Pengawas</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Ujian Aktif"
          value={activeExams.toLocaleString('id')}
          icon={Radio}
          iconVariant="primary"
          live={activeExams > 0}
        />
        <StatCard
          label="Peserta Ujian"
          value={activeParticipants.toLocaleString('id')}
          icon={Users}
          iconVariant="secondary"
          live={activeParticipants > 0}
        />
        <StatCard
          label="Total Pelanggaran"
          value={totalViolations.toLocaleString('id')}
          icon={AlertTriangle}
          iconVariant="tertiary"
        />
        <StatCard
          label="Selesai Hari Ini"
          value={finishedToday.toLocaleString('id')}
          icon={CheckCircle2}
          iconVariant="accent"
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/pengawas/monitoring"
          className="group bg-primary text-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all relative overflow-hidden"
        >
          <div className="relative z-10">
            <p className="text-xs uppercase font-semibold opacity-80 mb-1">Fitur Utama</p>
            <h3 className="text-xl font-bold mb-1">Monitoring Realtime</h3>
            <p className="text-sm opacity-90">Pantau peserta ujian secara langsung dan lihat pelanggaran saat itu juga.</p>
            <span className="inline-block mt-4 text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors">
              Buka Monitoring →
            </span>
          </div>
          <Radio className="absolute -right-4 -bottom-4 w-28 h-28 opacity-10 rotate-12 group-hover:opacity-20 transition-opacity" />
        </Link>

        <Link
          href="/pengawas/violations"
          className="group bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all relative overflow-hidden"
        >
          <div className="relative z-10">
            <p className="text-xs uppercase font-semibold text-on-surface-variant mb-1">Rekap Lengkap</p>
            <h3 className="text-xl font-bold text-on-surface mb-1">Daftar Pelanggaran</h3>
            <p className="text-sm text-on-surface-variant">Lihat rekap semua pelanggaran yang terdeteksi beserta detail santri.</p>
            <span className="inline-block mt-4 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1 rounded-full transition-colors">
              Lihat Pelanggaran →
            </span>
          </div>
          <AlertTriangle className="absolute -right-4 -bottom-4 w-28 h-28 opacity-5 rotate-12 group-hover:opacity-10 transition-opacity text-on-surface" />
        </Link>
      </div>

      {/* Recent Violations Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30">
        <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between">
          <h4 className="text-base font-semibold text-on-surface">Pelanggaran Terkini</h4>
          <Link
            href="/pengawas/violations"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Lihat semua →
          </Link>
        </div>

        {recentViolations.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-on-surface-variant">
            <ShieldCheck className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">Belum ada pelanggaran tercatat.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-container/50">
                  {['Pengguna', 'Aksi Pelanggaran', 'Waktu', 'Status'].map((h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-3 text-left text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider ${i === 0 ? '' : ''} ${i === 3 ? 'text-right' : ''}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {recentViolations.map((log, i) => {
                  const meta = log.metadata as Record<string, string> | null;
                  const violationType = meta?.type ?? log.action;
                  return (
                    <tr key={log.id} className="hover:bg-surface-container/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${INIT_BG[i % INIT_BG.length]} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                            {getInitials(log.user?.fullName ?? '?')}
                          </div>
                          <span className="text-sm font-medium text-on-surface">
                            {log.user?.fullName ?? '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getViolationBadge(violationType)}`}>
                          {VIOLATION_LABELS[violationType] ?? violationType}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-on-surface-variant whitespace-nowrap">
                        {formatRelative(log.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Badge variant="default">TERCATAT</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
