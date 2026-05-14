'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Trophy, TrendingUp, Users, AlertTriangle, BookOpen, Download } from 'lucide-react';
import type { ExamRow } from '@/features/exams/hooks/use-exams';

interface OverviewStats {
  totalExams: number;
  totalSessions: number;
  totalStudents: number;
  totalViolations: number;
  avgScore: number;
}

interface SessionRow {
  id: string;
  score: number | null;
  violationCount: number;
  submittedAt: string | null;
  user: { fullName: string; nis: string | null; class: { name: string } | null };
}

interface ExamReport {
  sessions: SessionRow[];
  stats: { avg: number; highest: number; lowest: number; passing: number; total: number };
}

interface ClassReport {
  id: string;
  name: string;
  academicYear: string;
  studentCount: number;
  avgScore: number;
  examCount: number;
}

function useOverview() {
  return useQuery<OverviewStats>({
    queryKey: ['reports-overview'],
    queryFn: async () => {
      const res = await fetch('/api/reports?type=overview');
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    },
  });
}

function useExamReport(examId: string) {
  return useQuery<ExamReport>({
    queryKey: ['reports-exam', examId],
    queryFn: async () => {
      const res = await fetch(`/api/reports?type=by-exam&examId=${examId}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    },
    enabled: !!examId,
  });
}

function useClassReport() {
  return useQuery<ClassReport[]>({
    queryKey: ['reports-class'],
    queryFn: async () => {
      const res = await fetch('/api/reports?type=by-class');
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    },
  });
}

function useAllExams() {
  return useQuery<ExamRow[]>({
    queryKey: ['exams-all-reports'],
    queryFn: async () => {
      const res = await fetch('/api/exams');
      const json = await res.json();
      return json.data?.exams ?? [];
    },
  });
}

function ScoreBadge({ score }: { score: number }) {
  const cls = score >= 85 ? 'bg-primary/10 text-primary' : score >= 70 ? 'bg-secondary-container text-secondary' : 'bg-tertiary-container/10 text-tertiary-container';
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cls}`}>{score}</span>;
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">{icon}</div>
        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{label}</p>
      </div>
      <h3 className="text-3xl font-bold text-on-surface">{value}</h3>
      {sub && <p className="text-xs text-on-surface-variant mt-1">{sub}</p>}
    </div>
  );
}

export function ReportsClient() {
  const [tab, setTab] = useState<'overview' | 'exam' | 'class'>('overview');
  const [selectedExamId, setSelectedExamId] = useState('');

  const { data: overview, isLoading: overviewLoading } = useOverview();
  const { data: exams } = useAllExams();
  const { data: examReport, isLoading: examLoading } = useExamReport(selectedExamId);
  const { data: classReport, isLoading: classLoading } = useClassReport();

  const exportCsv = () => {
    if (!examReport) return;
    const rows = [
      ['Nama', 'NIS', 'Kelas', 'Nilai', 'Pelanggaran', 'Waktu Kumpul'],
      ...examReport.sessions.map((s) => [
        s.user.fullName,
        s.user.nis ?? '—',
        s.user.class?.name ?? '—',
        s.score?.toString() ?? '—',
        s.violationCount.toString(),
        s.submittedAt ? new Date(s.submittedAt).toLocaleString('id-ID') : '—',
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-ujian-${selectedExamId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-on-surface">Laporan & Analitik</h2>
        <p className="text-sm text-on-surface-variant mt-1">Rekap nilai, progress, dan statistik ujian.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'overview', label: 'Ringkasan' },
          { key: 'exam', label: 'Per Ujian' },
          { key: 'class', label: 'Per Kelas' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key as typeof tab)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${tab === key ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        overviewLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-36 bg-surface-container rounded-xl animate-pulse" />)}
          </div>
        ) : !overview ? null : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard icon={<BookOpen className="w-4 h-4" />} label="Total Ujian" value={overview.totalExams} />
            <StatCard icon={<Users className="w-4 h-4" />} label="Total Santri" value={overview.totalStudents} />
            <StatCard icon={<BarChart3 className="w-4 h-4" />} label="Ujian Dikumpulkan" value={overview.totalSessions} />
            <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Rata-rata Nilai" value={overview.avgScore} sub="Dari seluruh ujian selesai" />
            <StatCard icon={<AlertTriangle className="w-4 h-4" />} label="Total Pelanggaran" value={overview.totalViolations} />
            <StatCard icon={<Trophy className="w-4 h-4" />} label="Tingkat Kelulusan" value={`${overview.totalSessions > 0 ? Math.round((overview.totalSessions / Math.max(1, overview.totalStudents)) * 100) : 0}%`} sub="Persentase ujian selesai" />
          </div>
        )
      )}

      {/* Per Exam */}
      {tab === 'exam' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="h-11 px-4 rounded-lg border border-outline-variant bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            >
              <option value="">— Pilih Ujian —</option>
              {exams?.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
            {examReport && (
              <button onClick={exportCsv} className="flex items-center gap-2 h-11 px-4 rounded-lg border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            )}
          </div>

          {selectedExamId && examLoading && (
            <div className="h-48 bg-surface-container rounded-xl animate-pulse" />
          )}

          {examReport && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Rata-rata', value: examReport.stats.avg },
                  { label: 'Tertinggi', value: examReport.stats.highest },
                  { label: 'Terendah', value: examReport.stats.lowest },
                  { label: 'Lulus (≥70)', value: `${examReport.stats.passing}/${examReport.stats.total}` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 text-center">
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-2xl font-bold text-on-surface">{value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-container text-on-surface-variant text-xs uppercase tracking-wider">
                      <th className="text-left px-4 py-3">Nama</th>
                      <th className="text-left px-4 py-3">Kelas</th>
                      <th className="text-left px-4 py-3">NIS</th>
                      <th className="text-center px-4 py-3">Nilai</th>
                      <th className="text-center px-4 py-3">Pelanggaran</th>
                      <th className="text-left px-4 py-3">Waktu Kumpul</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {examReport.sessions.map((s, i) => (
                      <tr key={s.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-4 py-3 font-medium text-on-surface">
                          <div className="flex items-center gap-2">
                            {i === 0 && <Trophy className="w-4 h-4 text-primary" />}
                            {s.user.fullName}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant">{s.user.class?.name ?? '—'}</td>
                        <td className="px-4 py-3 text-on-surface-variant font-mono">{s.user.nis ?? '—'}</td>
                        <td className="px-4 py-3 text-center">
                          {s.score !== null ? <ScoreBadge score={s.score} /> : <span className="text-on-surface-variant">—</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {s.violationCount > 0 ? (
                            <span className="text-xs font-bold text-tertiary-container">{s.violationCount}×</span>
                          ) : (
                            <span className="text-xs text-on-surface-variant">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-on-surface-variant">
                          {s.submittedAt ? new Date(s.submittedAt).toLocaleString('id-ID') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {!selectedExamId && (
            <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant/30">
              <BarChart3 className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm">Pilih ujian untuk melihat laporan nilai.</p>
            </div>
          )}
        </div>
      )}

      {/* Per Class */}
      {tab === 'class' && (
        classLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-surface-container rounded-xl animate-pulse" />)}
          </div>
        ) : !classReport || classReport.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant/30">
            <Users className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-sm">Belum ada data kelas.</p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Kelas</th>
                  <th className="text-left px-4 py-3">Tahun Ajaran</th>
                  <th className="text-center px-4 py-3">Jumlah Santri</th>
                  <th className="text-center px-4 py-3">Rata-rata Nilai</th>
                  <th className="text-center px-4 py-3">Ujian Diselesaikan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {classReport.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3 font-semibold text-on-surface">{c.name}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{c.academicYear}</td>
                    <td className="px-4 py-3 text-center font-medium text-on-surface">{c.studentCount}</td>
                    <td className="px-4 py-3 text-center">
                      {c.avgScore > 0 ? <ScoreBadge score={c.avgScore} /> : <span className="text-on-surface-variant text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center text-on-surface-variant">{c.examCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
