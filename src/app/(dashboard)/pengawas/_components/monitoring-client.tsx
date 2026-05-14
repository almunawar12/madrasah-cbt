'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, AlertCircle, ShieldCheck, TrendingUp, RefreshCw, Radio } from 'lucide-react';
import { useMonitoringSessions, type SessionParticipant, type ViolationEvent } from '@/features/monitoring/hooks/use-monitoring';
import type { ExamRow } from '@/features/exams/hooks/use-exams';

function useOngoingExams() {
  return useQuery<ExamRow[]>({
    queryKey: ['exams-ongoing'],
    queryFn: async () => {
      const res = await fetch('/api/exams?status=PUBLISHED');
      const json = await res.json();
      return json.data?.exams ?? [];
    },
  });
}

const VIOLATION_LABEL: Record<string, string> = {
  TAB_SWITCH: 'Pindah Tab',
  FULLSCREEN_EXIT: 'Keluar Fullscreen',
  COPY_PASTE: 'Copy/Paste',
  RIGHT_CLICK: 'Klik Kanan',
  MULTIPLE_LOGIN: 'Login Ganda',
};

type CardStatus = 'online' | 'warning' | 'offline' | 'submitted';

function getCardStatus(s: SessionParticipant): CardStatus {
  if (s.status === 'SUBMITTED' || s.status === 'FORCE_SUBMITTED') return 'submitted';
  if (s.violationCount >= 3) return 'warning';
  if (s.status === 'IN_PROGRESS') return 'online';
  return 'offline';
}

function statusDotCls(status: CardStatus) {
  return {
    online: 'bg-primary',
    warning: 'bg-tertiary-container',
    offline: 'bg-surface-dim',
    submitted: 'bg-secondary',
  }[status];
}

function statusBorderCls(status: CardStatus) {
  return {
    online: 'border border-outline-variant/30',
    warning: 'border-2 border-tertiary-container',
    offline: 'border border-outline-variant/30 opacity-60',
    submitted: 'border border-secondary/30',
  }[status];
}

function ParticipantCard({ session }: { session: SessionParticipant }) {
  const status = getCardStatus(session);
  const initials = session.user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className={`bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col gap-3 ${statusBorderCls(status)}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
              {initials}
            </div>
            <div className={`absolute bottom-0 right-0 w-3 h-3 ${statusDotCls(status)} border-2 border-white rounded-full`} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-on-surface leading-tight">{session.user.fullName}</h4>
            <p className="text-xs text-on-surface-variant">
              {session.user.class?.name ?? '—'} {session.user.nis ? `· ${session.user.nis}` : ''}
            </p>
          </div>
        </div>
        {status === 'warning' ? (
          <AlertTriangle className="w-5 h-5 text-tertiary-container" />
        ) : status === 'submitted' ? (
          <CheckCircle2 className="w-5 h-5 text-secondary" />
        ) : status === 'online' ? (
          <CheckCircle2 className="w-5 h-5 text-primary" />
        ) : (
          <AlertCircle className="w-5 h-5 text-on-surface-variant" />
        )}
      </div>

      {session.violationCount > 0 && (
        <div className="bg-tertiary-container/5 px-2 py-1.5 rounded border border-tertiary-container/20">
          <p className="text-[10px] text-tertiary-container font-bold">{session.violationCount}× PELANGGARAN</p>
        </div>
      )}

      {status === 'submitted' && (
        <div className="text-xs text-secondary font-semibold text-center py-1 bg-secondary/5 rounded">
          Selesai {session.score !== null ? `· Nilai: ${session.score}` : ''}
        </div>
      )}
      {status === 'offline' && (
        <div className="text-xs text-on-surface-variant text-center py-1 bg-surface-container-high rounded">
          Belum mulai / Offline
        </div>
      )}
    </div>
  );
}

function AlertFeed({ violations }: { violations: ViolationEvent[] }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant/30 flex flex-col h-[500px]">
      <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/50">
        <span className="text-xs font-semibold text-on-surface-variant uppercase">Log Aktivitas</span>
        <span className="text-[10px] font-bold px-2 py-0.5 bg-primary text-white rounded-full">REALTIME</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {violations.length === 0 ? (
          <p className="text-xs text-on-surface-variant text-center mt-8">Belum ada pelanggaran</p>
        ) : violations.map((v, i) => (
          <div key={i} className="flex gap-3">
            <div className="mt-1 w-2 h-2 rounded-full bg-tertiary-container flex-shrink-0" />
            <div>
              <p className="text-sm text-on-surface">
                <span className="font-bold">{VIOLATION_LABEL[v.type] ?? v.type}</span> — {v.userName ?? 'Santri'}
              </p>
              <p className="text-[10px] text-on-surface-variant">
                {new Date(v.at).toLocaleTimeString('id-ID')} · Pelanggaran ke-{v.violationCount}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-surface-container-low border-t border-outline-variant/20">
        <p className="text-xs text-on-surface-variant">Log diarsipkan otomatis setelah 24 jam.</p>
      </div>
    </div>
  );
}

export function MonitoringClient() {
  const [selectedExamId, setSelectedExamId] = useState('');
  const { data: exams, isLoading: examsLoading } = useOngoingExams();
  const { sessions, isLoading: sessionsLoading, violationsRef } = useMonitoringSessions(selectedExamId);
  const [, forceUpdate] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (exams && exams.length > 0 && !selectedExamId) {
      setSelectedExamId(exams[0].id);
    }
  }, [exams, selectedExamId]);

  // Rerender every 3s to refresh violation feed display
  useEffect(() => {
    tickRef.current = setInterval(() => forceUpdate((n) => n + 1), 3000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, []);

  const active = sessions.filter((s) => s.status === 'IN_PROGRESS').length;
  const submitted = sessions.filter((s) => s.status === 'SUBMITTED' || s.status === 'FORCE_SUBMITTED').length;
  const warnings = sessions.filter((s) => s.violationCount >= 3).length;
  const avgProgress = sessions.length > 0
    ? Math.round(submitted / sessions.length * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Monitoring Realtime</h2>
          <p className="text-sm text-on-surface-variant">Pantau peserta ujian secara langsung</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-high rounded-full text-sm text-on-surface-variant">
            <Radio className="w-4 h-4 text-primary animate-pulse" />
            <span>Live</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-high rounded-full text-sm text-on-surface-variant">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Mode Pengawas</span>
          </div>
        </div>
      </div>

      {/* Exam Selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-on-surface-variant whitespace-nowrap">Pilih Ujian:</label>
        {examsLoading ? (
          <div className="h-10 w-64 bg-surface-container animate-pulse rounded-lg" />
        ) : (
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="h-10 px-4 rounded-lg border border-outline-variant bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          >
            <option value="">— Pilih Ujian —</option>
            {exams?.map((e) => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        )}
        {selectedExamId && (
          <button
            onClick={() => forceUpdate((n) => n + 1)}
            className="p-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30">
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Peserta Aktif</p>
          <div className="flex justify-between items-end">
            <h3 className="text-3xl font-bold text-primary">{active}</h3>
            <div className="flex items-center text-primary font-bold text-sm gap-1">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30">
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Selesai</p>
          <div className="flex justify-between items-end">
            <h3 className="text-3xl font-bold text-on-surface">{submitted}</h3>
            <span className="text-sm text-on-surface-variant">dari {sessions.length}</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 border-l-4 border-l-tertiary-container">
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Peringatan</p>
          <div className="flex justify-between items-end">
            <h3 className="text-3xl font-bold text-tertiary-container">{warnings}</h3>
            {warnings > 0 && (
              <span className="bg-tertiary-container/10 text-tertiary-container px-2 py-0.5 rounded text-xs font-bold">KRITIS</span>
            )}
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30">
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Progress Selesai</p>
          <div className="flex justify-between items-end">
            <h3 className="text-3xl font-bold text-on-surface">{avgProgress}%</h3>
            <div className="w-20 h-2 bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${avgProgress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Live Grid */}
        <section className="col-span-12 lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-on-surface">Grid Monitoring Live</h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 bg-surface-container-high px-3 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs text-on-surface">{active} Online</span>
              </div>
              {warnings > 0 && (
                <div className="flex items-center gap-2 bg-tertiary-container/10 px-3 py-1 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-tertiary-container" />
                  <span className="text-xs text-tertiary-container">{warnings} Mencurigakan</span>
                </div>
              )}
            </div>
          </div>

          {!selectedExamId ? (
            <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant/30">
              <Radio className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm">Pilih ujian untuk memantau peserta.</p>
            </div>
          ) : sessionsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-40 bg-surface-container rounded-xl animate-pulse" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant/30">
              <AlertCircle className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm">Belum ada peserta yang bergabung.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {sessions.map((s) => (
                <ParticipantCard key={s.id} session={s} />
              ))}
            </div>
          )}
        </section>

        {/* Alerts Feed */}
        <aside className="col-span-12 lg:col-span-4 space-y-4">
          <h3 className="text-lg font-semibold text-on-surface">Alert Langsung</h3>
          <AlertFeed violations={violationsRef.current} />
          <div className="bg-primary text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-xs uppercase mb-1 opacity-80">Status Koneksi</p>
              <h4 className="text-xl font-bold mb-2">{selectedExamId ? 'Terhubung' : 'Tidak Aktif'}</h4>
              <p className="text-sm opacity-90">
                {selectedExamId
                  ? 'Pusher realtime aktif. Pelanggaran dan submit masuk otomatis.'
                  : 'Pilih ujian untuk mengaktifkan monitoring realtime.'}
              </p>
            </div>
            <ShieldCheck className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 rotate-12" />
          </div>
        </aside>
      </div>
    </div>
  );
}
