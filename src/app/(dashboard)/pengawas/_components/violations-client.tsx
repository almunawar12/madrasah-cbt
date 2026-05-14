'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ShieldAlert, Users, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────────────

type ViolationType =
  | 'ALL'
  | 'TAB_SWITCH'
  | 'FULLSCREEN_EXIT'
  | 'COPY_PASTE'
  | 'RIGHT_CLICK'
  | 'MULTIPLE_LOGIN';

const VIOLATION_LABELS: Record<string, string> = {
  TAB_SWITCH: 'Pindah Tab',
  FULLSCREEN_EXIT: 'Keluar Fullscreen',
  COPY_PASTE: 'Copy/Paste',
  RIGHT_CLICK: 'Klik Kanan',
  MULTIPLE_LOGIN: 'Login Ganda',
};

const VIOLATION_BADGE_CLASSES: Record<string, string> = {
  TAB_SWITCH: 'bg-orange-100 text-orange-700 border-orange-200',
  FULLSCREEN_EXIT: 'bg-red-100 text-red-700 border-red-200',
  COPY_PASTE: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  RIGHT_CLICK: 'bg-gray-100 text-gray-700 border-gray-200',
  MULTIPLE_LOGIN: 'bg-red-100 text-red-700 border-red-200',
};

const SESSION_STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  WAITING: { label: 'Menunggu', cls: 'bg-gray-100 text-gray-600' },
  IN_PROGRESS: { label: 'Sedang Ujian', cls: 'bg-emerald-100 text-emerald-700' },
  SUBMITTED: { label: 'Selesai', cls: 'bg-blue-100 text-blue-700' },
  FORCE_SUBMITTED: { label: 'Dipaksa Selesai', cls: 'bg-orange-100 text-orange-700' },
  BLOCKED: { label: 'Diblokir', cls: 'bg-red-100 text-red-700' },
};

const VIOLATION_TYPE_OPTIONS: { value: ViolationType; label: string }[] = [
  { value: 'ALL', label: 'Semua Jenis' },
  { value: 'TAB_SWITCH', label: 'Pindah Tab' },
  { value: 'FULLSCREEN_EXIT', label: 'Keluar Fullscreen' },
  { value: 'COPY_PASTE', label: 'Copy/Paste' },
  { value: 'RIGHT_CLICK', label: 'Klik Kanan' },
  { value: 'MULTIPLE_LOGIN', label: 'Login Ganda' },
];

// ─── API Shape ───────────────────────────────────────────────────────────────

interface ViolationEntry {
  type: string;
  at: string;
}

interface SessionRow {
  id: string;
  violationCount: number;
  violations: ViolationEntry[];
  status: string;
  startedAt: string | null;
  user: {
    fullName: string;
    nis: string | null;
    class: { name: string } | null;
  };
  exam: {
    title: string;
    subject: { name: string };
  };
}

interface ViolationsResponse {
  sessions: SessionRow[];
  total: number;
  page: number;
  limit: number;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

function useViolations(type: ViolationType, page: number, limit = 20) {
  return useQuery<ViolationsResponse>({
    queryKey: ['violations', type, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (type !== 'ALL') params.set('type', type);
      const res = await fetch(`/api/violations?${params.toString()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message ?? 'Gagal memuat data');
      return json.data as ViolationsResponse;
    },
    placeholderData: (prev) => prev,
  });
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ViolationBadge({ type }: { type: string }) {
  const cls = VIOLATION_BADGE_CLASSES[type] ?? 'bg-gray-100 text-gray-700 border-gray-200';
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border', cls)}>
      {VIOLATION_LABELS[type] ?? type}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-surface-container rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

// ─── Stats ───────────────────────────────────────────────────────────────────

function computeStats(sessions: SessionRow[]) {
  const totalViolations = sessions.reduce((acc, s) => acc + s.violationCount, 0);
  const uniqueSantri = new Set(sessions.map((s) => s.user.nis ?? s.id)).size;

  const typeCount: Record<string, number> = {};
  for (const s of sessions) {
    for (const v of s.violations) {
      typeCount[v.type] = (typeCount[v.type] ?? 0) + 1;
    }
  }

  let topType = '—';
  let topCount = 0;
  for (const [t, c] of Object.entries(typeCount)) {
    if (c > topCount) { topCount = c; topType = t; }
  }

  return { totalViolations, uniqueSantri, topType, topCount };
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function ViolationsClient() {
  const [typeFilter, setTypeFilter] = useState<ViolationType>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  const { data, isLoading, isError } = useViolations(typeFilter, page, LIMIT);

  const sessions = data?.sessions ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const filtered = search.trim()
    ? sessions.filter((s) =>
        s.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
        (s.user.nis ?? '').includes(search)
      )
    : sessions;

  const stats = computeStats(sessions);

  function handleTypeChange(val: ViolationType) {
    setTypeFilter(val);
    setPage(1);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-on-surface">Daftar Pelanggaran</h2>
        <p className="text-sm text-on-surface-variant mt-1">
          Rekap semua pelanggaran yang terdeteksi selama sesi ujian berlangsung.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Total Pelanggaran</p>
            <p className="text-2xl font-bold text-on-surface">{stats.totalViolations}</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Santri Terlibat</p>
            <p className="text-2xl font-bold text-on-surface">{stats.uniqueSantri}</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Tipe Paling Sering</p>
            <p className="text-base font-bold text-on-surface">
              {stats.topType === '—' ? '—' : (VIOLATION_LABELS[stats.topType] ?? stats.topType)}
            </p>
            {stats.topCount > 0 && (
              <p className="text-xs text-on-surface-variant">{stats.topCount}× terdeteksi</p>
            )}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={typeFilter}
          onChange={(e) => handleTypeChange(e.target.value as ViolationType)}
          className="h-10 px-4 rounded-lg border border-outline-variant bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        >
          {VIOLATION_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Cari nama santri atau NIS..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 px-4 rounded-lg border border-outline-variant bg-surface text-sm flex-1 max-w-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant/20">
                <th className="px-4 py-3 text-left font-semibold text-on-surface-variant text-xs uppercase tracking-wider">Santri</th>
                <th className="px-4 py-3 text-left font-semibold text-on-surface-variant text-xs uppercase tracking-wider">Ujian</th>
                <th className="px-4 py-3 text-left font-semibold text-on-surface-variant text-xs uppercase tracking-wider">Jenis Pelanggaran</th>
                <th className="px-4 py-3 text-center font-semibold text-on-surface-variant text-xs uppercase tracking-wider">Jumlah</th>
                <th className="px-4 py-3 text-left font-semibold text-on-surface-variant text-xs uppercase tracking-wider">Status Sesi</th>
                <th className="px-4 py-3 text-left font-semibold text-on-surface-variant text-xs uppercase tracking-wider">Pertama Terdeteksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {isLoading && [1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)}

              {isError && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-on-surface-variant">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-400" />
                    <p className="text-sm">Gagal memuat data pelanggaran.</p>
                  </td>
                </tr>
              )}

              {!isLoading && !isError && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-on-surface-variant">
                    <ShieldAlert className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">Tidak ada pelanggaran ditemukan.</p>
                    <p className="text-xs mt-1 opacity-70">
                      {search || typeFilter !== 'ALL'
                        ? 'Coba ubah filter atau kata kunci pencarian.'
                        : 'Belum ada sesi ujian dengan pelanggaran.'}
                    </p>
                  </td>
                </tr>
              )}

              {!isLoading && !isError && filtered.map((session) => {
                const uniqueTypes = [...new Set(session.violations.map((v) => v.type))];
                const firstAt = session.violations.length > 0
                  ? session.violations.reduce((a, b) => (a.at < b.at ? a : b)).at
                  : null;
                const statusMeta = SESSION_STATUS_LABELS[session.status] ?? { label: session.status, cls: 'bg-gray-100 text-gray-600' };

                return (
                  <tr key={session.id} className="hover:bg-surface-container/40 transition-colors">
                    {/* Santri */}
                    <td className="px-4 py-3">
                      <p className="font-semibold text-on-surface">{session.user.fullName}</p>
                      <p className="text-xs text-on-surface-variant">
                        {session.user.class?.name ?? '—'}
                        {session.user.nis ? ` · ${session.user.nis}` : ''}
                      </p>
                    </td>

                    {/* Ujian */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-on-surface">{session.exam.title}</p>
                      <p className="text-xs text-on-surface-variant">{session.exam.subject.name}</p>
                    </td>

                    {/* Jenis Pelanggaran */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {uniqueTypes.length > 0
                          ? uniqueTypes.map((t) => <ViolationBadge key={t} type={t} />)
                          : <span className="text-xs text-on-surface-variant">—</span>
                        }
                      </div>
                    </td>

                    {/* Jumlah */}
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        'inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold',
                        session.violationCount >= 5
                          ? 'bg-red-100 text-red-700'
                          : session.violationCount >= 3
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-yellow-100 text-yellow-700'
                      )}>
                        {session.violationCount}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-1 rounded text-xs font-semibold', statusMeta.cls)}>
                        {statusMeta.label}
                      </span>
                    </td>

                    {/* Waktu */}
                    <td className="px-4 py-3 text-xs text-on-surface-variant whitespace-nowrap">
                      {firstAt
                        ? new Date(firstAt).toLocaleString('id-ID', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })
                        : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && total > LIMIT && (
          <div className="px-4 py-3 border-t border-outline-variant/20 flex items-center justify-between bg-surface-container/30">
            <p className="text-xs text-on-surface-variant">
              Menampilkan {Math.min((page - 1) * LIMIT + 1, total)}–{Math.min(page * LIMIT, total)} dari {total} sesi
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs font-medium text-on-surface">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
