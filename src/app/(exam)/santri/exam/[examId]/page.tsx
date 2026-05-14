'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Flag, ChevronLeft, ChevronRight, Timer, Maximize } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAntiCheat } from '@/hooks/use-anti-cheat';

const TOTAL_QUESTIONS = 40;
const TOTAL_SECONDS = 6322; // 01:45:22

interface Question {
  id: number;
  text: string;
  options: { key: string; text: string }[];
}

const mockQuestion: Question = {
  id: 12,
  text: "Dalam konteks Fiqh Muamalah, manakah dari pilihan berikut yang paling tepat menjelaskan perbedaan mendasar antara akad Wadi'ah Yad Amanah dan Wadi'ah Yad Dhamanah?",
  options: [
    { key: 'A', text: "Amanah hanya untuk barang bergerak, sedangkan Dhamanah untuk aset tetap." },
    { key: 'B', text: "Pada Yad Amanah penerima titipan tidak boleh memanfaatkan barang, sedangkan Yad Dhamanah diperbolehkan dengan tanggung jawab penuh." },
    { key: 'C', text: "Yad Amanah memerlukan saksi, sedangkan Yad Dhamanah tidak memerlukan dokumentasi formal." },
    { key: 'D', text: "Yad Dhamanah hanya berlaku pada institusi perbankan syariah modern saja." },
    { key: 'E', text: "Tidak ada perbedaan signifikan dalam hal tanggung jawab atas kerusakan barang titipan." },
  ],
};

type QuestionState = 'unanswered' | 'answered' | 'flagged' | 'current';

function getQuestionState(q: number, current: number, answered: Set<number>, flagged: Set<number>): QuestionState {
  if (q === current) return 'current';
  if (flagged.has(q)) return 'flagged';
  if (answered.has(q)) return 'answered';
  return 'unanswered';
}

function QuestionMapButton({ num, state, onClick }: { num: number; state: QuestionState; onClick: () => void }) {
  const cls = {
    current: 'bg-surface-container-high border-2 border-primary text-primary font-extrabold shadow-inner',
    answered: 'bg-primary text-white font-bold',
    flagged: 'bg-tertiary-container/30 border-2 border-tertiary text-tertiary font-bold',
    unanswered: 'bg-surface-container-low text-on-surface-variant font-medium hover:bg-surface-container-high',
  }[state];
  return (
    <button onClick={onClick} className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm transition-colors ${cls}`}>
      {num}
    </button>
  );
}

function formatTime(secs: number) {
  const h = Math.floor(secs / 3600).toString().padStart(2, '0');
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function ExamSessionPage() {
  const { examId } = useParams<{ examId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const autoSubmittedRef = useRef(false);

  const sessionId = searchParams.get('session') ?? examId;

  const { requestFullscreen } = useAntiCheat({
    sessionId,
    enabled: true,
    onViolation: (_, count) => {
      if (count >= 5) {
        toast.error('Terlalu banyak pelanggaran. Ujian dikumpulkan otomatis.', { duration: 5000 });
        handleSubmit();
      }
    },
  });

  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [current, setCurrent] = useState(12);
  const [answered, setAnswered] = useState<Set<number>>(new Set([1,2,3,4,5,7,8,9,10,13,14,15,16,17,18]));
  const [flagged, setFlagged] = useState<Set<number>>(new Set([6, 11]));
  const [selectedOption, setSelectedOption] = useState<string | null>('B');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1 && !autoSubmittedRef.current) {
          autoSubmittedRef.current = true;
          handleSubmit();
        }
        return Math.max(0, t - 1);
      });
    }, 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleFlag = useCallback(() => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(current)) next.delete(current);
      else next.add(current);
      return next;
    });
  }, [current]);

  const selectOption = (key: string) => {
    setSelectedOption(key);
    setAnswered((prev) => new Set(prev).add(current));
  };

  const goTo = (q: number) => {
    setCurrent(q);
    setSelectedOption(null);
  };

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/submit`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        toast.success(`Ujian dikumpulkan! Nilai: ${json.data?.score ?? '—'}`);
      } else {
        toast.success('Ujian dikumpulkan!');
      }
    } catch {
      toast.success('Ujian dikumpulkan!');
    }
    setTimeout(() => router.push('/santri'), 2000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, submitting]);

  const progress = Math.round((answered.size / TOTAL_QUESTIONS) * 100);
  const isLowTime = timeLeft < 300;

  return (
    <div className="min-h-screen bg-background flex flex-col -m-8">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-6 py-4 bg-surface border-b-2 border-primary/20 shadow-md bg-surface-container-lowest">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-primary">Sesi Ujian</h1>
          <div className="hidden md:flex h-8 w-px bg-outline-variant mx-2" />
          <div className="hidden md:flex flex-col">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Mata Pelajaran</span>
            <span className="text-sm font-bold text-on-surface">Fiqh &amp; Syariah II · {examId}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${isLowTime ? 'bg-tertiary-container/20 border-tertiary-container/30' : 'bg-tertiary-container/10 border-tertiary-container/20'}`}>
            <Timer className={`w-5 h-5 ${isLowTime ? 'text-tertiary-container animate-pulse' : 'text-tertiary'}`} />
            <span className={`text-lg font-bold tabular-nums ${isLowTime ? 'text-tertiary-container' : 'text-tertiary'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <button
            onClick={requestFullscreen}
            title="Fullscreen"
            className="p-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <Maximize className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleSubmit()}
            disabled={submitting}
            className="bg-primary hover:brightness-110 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-95 shadow-sm disabled:opacity-70"
          >
            {submitting ? 'Mengumpulkan…' : 'Kumpulkan Ujian'}
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-surface-container-high sticky top-[72px] z-40">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full px-4 md:px-8 py-6 gap-6">
        {/* Question Area */}
        <section className="flex-1 flex flex-col gap-6">
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/30">
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full mb-4 inline-block">
                  Soal {current} dari {TOTAL_QUESTIONS}
                </span>
                <h2 className="text-xl font-bold text-on-surface leading-snug mt-3">
                  {mockQuestion.text}
                </h2>
              </div>
              <button
                onClick={toggleFlag}
                className={`flex flex-col items-center gap-1 transition-colors ml-4 flex-shrink-0 ${flagged.has(current) ? 'text-tertiary' : 'text-on-surface-variant hover:text-tertiary'}`}
              >
                <Flag className={`w-6 h-6 ${flagged.has(current) ? 'fill-tertiary' : ''}`} />
                <span className="text-[10px] font-bold">Tandai</span>
              </button>
            </div>

            {/* Options */}
            <div className="space-y-4">
              {mockQuestion.options.map((opt) => {
                const selected = selectedOption === opt.key;
                return (
                  <label
                    key={opt.key}
                    className={`group flex items-center p-5 rounded-xl border-2 cursor-pointer transition-all ${
                      selected
                        ? 'border-primary bg-primary/5'
                        : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary/50 hover:bg-primary/5'
                    }`}
                  >
                    <input
                      type="radio"
                      name="exam-option"
                      checked={selected}
                      onChange={() => selectOption(opt.key)}
                      className="w-5 h-5 text-primary border-outline focus:ring-primary focus:ring-offset-2 accent-primary"
                    />
                    <span className={`ml-4 text-sm ${selected ? 'text-on-surface' : 'text-on-surface-variant group-hover:text-on-surface'}`}>
                      <span className="font-bold mr-2">{opt.key}.</span>
                      {opt.text}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </section>

        {/* Question Map Sidebar */}
        <aside className="w-full md:w-[300px] shrink-0">
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 sticky top-[100px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-on-surface">Peta Soal</h3>
              <span className="text-xs text-on-surface-variant">{answered.size}/{TOTAL_QUESTIONS} Dijawab</span>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-6">
              {Array.from({ length: TOTAL_QUESTIONS }, (_, i) => i + 1).map((q) => (
                <QuestionMapButton
                  key={q}
                  num={q}
                  state={getQuestionState(q, current, answered, flagged)}
                  onClick={() => goTo(q)}
                />
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-outline-variant/30">
              {[
                { color: 'bg-primary', label: 'Sudah Dijawab' },
                { color: 'bg-tertiary', label: 'Ditandai' },
                { color: 'bg-surface-container-low border border-outline-variant', label: 'Belum Dijawab' },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-sm ${l.color}`} />
                  <span className="text-xs text-on-surface-variant">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {/* Footer Controls */}
      <footer className="bg-surface border-t border-outline-variant/30 p-4 md:p-6 sticky bottom-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={() => goTo(Math.max(1, current - 1))}
            disabled={current === 1}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-secondary text-secondary hover:bg-secondary-container/20 transition-all text-sm font-semibold disabled:opacity-40"
          >
            <ChevronLeft className="w-5 h-5" /> Sebelumnya
          </button>

          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Autosave Aktif</span>
          </div>

          <button
            onClick={() => goTo(Math.min(TOTAL_QUESTIONS, current + 1))}
            disabled={current === TOTAL_QUESTIONS}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white hover:brightness-110 shadow-md transition-all text-sm font-semibold disabled:opacity-40"
          >
            Soal Berikutnya <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
}
