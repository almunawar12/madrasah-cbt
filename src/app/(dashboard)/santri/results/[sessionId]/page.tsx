'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2, Trophy, Clock, BookOpen, AlertTriangle,
  ChevronRight, BarChart3, Home,
} from 'lucide-react';

interface ResultSession {
  id: string;
  score: number | null;
  violationCount: number;
  startedAt: string | null;
  submittedAt: string | null;
  status: string;
  exam: {
    title: string;
    duration: number;
    subject: { name: string };
    items: { question: { type: string; score: number } }[];
  };
  answers: {
    questionId: string;
    isCorrect: boolean | null;
    score: number | null;
    essayText: string | null;
    optionId: string | null;
    question: { type: string; text: string; score: number };
  }[];
}

function useResult(sessionId: string) {
  return useQuery<ResultSession>({
    queryKey: ['result', sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    },
  });
}

function ScoreRing({ score }: { score: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 85 ? '#006948' : score >= 70 ? '#515f74' : '#9b3e3b';

  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="160" height="160">
        <circle cx="80" cy="80" r={r} fill="none" stroke="#e0e3e5" strokeWidth="10" />
        <circle
          cx="80" cy="80" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="text-center relative z-10">
        <p className="text-4xl font-extrabold" style={{ color }}>{score}</p>
        <p className="text-xs text-on-surface-variant font-semibold">/ 100</p>
      </div>
    </div>
  );
}

function formatDuration(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}m ${s}s`;
}

export default function ResultPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const { data: session, isLoading } = useResult(sessionId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-on-surface-variant">
        <BarChart3 className="w-12 h-12 animate-pulse" />
        <p className="text-sm">Memuat hasil ujian…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-on-surface-variant">
        <AlertTriangle className="w-10 h-10 opacity-40" />
        <p className="text-sm">Hasil tidak ditemukan.</p>
        <button onClick={() => router.push('/santri')} className="text-sm text-primary underline">Kembali</button>
      </div>
    );
  }

  const score = session.score ?? 0;
  const totalItems = session.exam.items.length;
  const mcAnswers = session.answers.filter((a) => a.question.type === 'MULTIPLE_CHOICE');
  const essayAnswers = session.answers.filter((a) => a.question.type === 'ESSAY');
  const correctCount = mcAnswers.filter((a) => a.isCorrect).length;
  const wrongCount = mcAnswers.filter((a) => a.isCorrect === false).length;
  const unanswered = totalItems - session.answers.length;
  const passed = score >= 70;
  const timeTaken = session.startedAt && session.submittedAt
    ? formatDuration(session.startedAt, session.submittedAt)
    : '—';

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Hero card */}
      <div className={`rounded-2xl p-8 text-center relative overflow-hidden ${passed ? 'bg-primary' : 'bg-tertiary-container'}`}>
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4z'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${passed ? 'bg-white/20' : 'bg-white/10'}`}>
            {passed ? <Trophy className="w-7 h-7 text-white" /> : <BookOpen className="w-7 h-7 text-white" />}
          </div>
          <div>
            <p className="text-white/80 text-sm font-semibold mb-1">
              {passed ? 'Selamat! Kamu Lulus' : 'Ujian Selesai'}
            </p>
            <h2 className="text-2xl font-bold text-white">{session.exam.title}</h2>
            <p className="text-white/70 text-sm mt-1">{session.exam.subject.name}</p>
          </div>
          <ScoreRing score={Math.round(score)} />
          <p className="text-white/80 text-sm">
            {passed ? '✓ Memenuhi KKM (70)' : '✗ Belum memenuhi KKM (70)'}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: <CheckCircle2 className="w-5 h-5 text-primary" />, label: 'Benar', value: correctCount, color: 'text-primary' },
          { icon: <AlertTriangle className="w-5 h-5 text-tertiary-container" />, label: 'Salah', value: wrongCount, color: 'text-tertiary-container' },
          { icon: <BookOpen className="w-5 h-5 text-on-surface-variant" />, label: 'Tdk Dijawab', value: unanswered, color: 'text-on-surface-variant' },
          { icon: <Clock className="w-5 h-5 text-secondary" />, label: 'Waktu', value: timeTaken, color: 'text-secondary' },
        ].map(({ icon, label, value, color }) => (
          <div key={label} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-4 flex flex-col items-center gap-2 text-center">
            {icon}
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-on-surface-variant">{label}</p>
          </div>
        ))}
      </div>

      {/* Violation warning */}
      {session.violationCount > 0 && (
        <div className="flex items-center gap-3 bg-tertiary-container/10 border border-tertiary-container/30 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-tertiary-container flex-shrink-0" />
          <p className="text-sm text-tertiary-container font-medium">
            Terdeteksi <span className="font-bold">{session.violationCount} pelanggaran</span> selama ujian berlangsung.
          </p>
        </div>
      )}

      {/* Essay note */}
      {essayAnswers.length > 0 && (
        <div className="flex items-start gap-3 bg-secondary-container/20 border border-secondary-container rounded-xl p-4">
          <BookOpen className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-on-surface">Soal Esai Menunggu Penilaian</p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {essayAnswers.length} soal esai akan dinilai oleh guru. Nilai akhir mungkin akan berubah.
            </p>
          </div>
        </div>
      )}

      {/* MC breakdown */}
      {mcAnswers.length > 0 && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
          <div className="px-5 py-4 border-b border-outline-variant/20 bg-surface-container-low/50">
            <h3 className="text-sm font-bold text-on-surface">Rincian Jawaban Pilihan Ganda</h3>
          </div>
          <div className="divide-y divide-outline-variant/20">
            {mcAnswers.map((a, i) => (
              <div key={a.questionId} className="flex items-start gap-4 px-5 py-4">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 ${
                  a.isCorrect ? 'bg-primary/10 text-primary' : 'bg-tertiary-container/10 text-tertiary-container'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-on-surface line-clamp-2">{a.question.text}</p>
                </div>
                <div className="flex-shrink-0">
                  {a.isCorrect
                    ? <CheckCircle2 className="w-5 h-5 text-primary" />
                    : <span className="text-xs font-bold text-tertiary-container bg-tertiary-container/10 px-2 py-0.5 rounded-full">Salah</span>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pb-4">
        <button onClick={() => router.push('/santri')}
          className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-all">
          <Home className="w-4 h-4" /> Dashboard
        </button>
        <button onClick={() => router.push('/santri')}
          className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-white text-sm font-semibold hover:brightness-110 transition-all shadow-md">
          Selesai <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
