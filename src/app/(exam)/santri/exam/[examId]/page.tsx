'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Flag, ChevronLeft, ChevronRight, Timer, Maximize,
  BookOpen, AlertTriangle, X, Map, CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAntiCheat } from '@/hooks/use-anti-cheat';

interface QuestionOption { id: string; label: string; text: string }
interface ExamQuestion {
  id: string; text: string;
  type: 'MULTIPLE_CHOICE' | 'ESSAY';
  options: QuestionOption[];
}
interface ExamSessionData {
  id: string; status: string; startedAt: string | null;
  exam: {
    title: string; duration: number;
    subject: { name: string };
    items: { question: ExamQuestion }[];
  };
  answers: { questionId: string; optionId: string | null; essayText: string | null }[];
}

type QuestionState = 'unanswered' | 'answered' | 'flagged' | 'current';

function getQuestionState(idx: number, cur: number, answered: Set<number>, flagged: Set<number>): QuestionState {
  if (idx === cur) return 'current';
  if (flagged.has(idx)) return 'flagged';
  if (answered.has(idx)) return 'answered';
  return 'unanswered';
}

function QuestionMapButton({ num, state, onClick }: { num: number; state: QuestionState; onClick: () => void }) {
  const cls = {
    current: 'bg-surface-container-high border-2 border-primary text-primary font-extrabold shadow-inner',
    answered: 'bg-primary text-white font-bold',
    flagged: 'bg-tertiary-container/30 border-2 border-tertiary text-tertiary font-bold',
    unanswered: 'bg-surface-container-low text-on-surface-variant font-medium hover:bg-surface-container',
  }[state];
  return (
    <button onClick={onClick} className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-lg text-xs md:text-sm transition-colors ${cls}`}>
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

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-on-surface-variant">
        <BookOpen className="w-12 h-12 animate-pulse text-primary" />
        <p className="text-sm font-medium">Memuat soal ujian…</p>
      </div>
    </div>
  );
}

// ─── Question Map Panel (Desktop sidebar / Mobile bottom sheet) ─────────────
function QuestionMap({
  totalQuestions, answered, flagged, current, onGoTo, onClose, mobile,
}: {
  totalQuestions: number; answered: Set<number>; flagged: Set<number>;
  current: number; onGoTo: (i: number) => void; onClose?: () => void; mobile?: boolean;
}) {
  return (
    <div className={mobile ? 'p-4' : 'bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant/30 sticky top-[88px]'}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-on-surface">Peta Soal</h3>
          <p className="text-xs text-on-surface-variant">{answered.size}/{totalQuestions} dijawab</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-surface-container transition-colors">
            <X className="w-4 h-4 text-on-surface-variant" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-5 gap-1.5 mb-4">
        {Array.from({ length: totalQuestions }, (_, i) => i).map((i) => (
          <QuestionMapButton key={i} num={i + 1}
            state={getQuestionState(i, current, answered, flagged)}
            onClick={() => { onGoTo(i); onClose?.(); }} />
        ))}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 pt-3 border-t border-outline-variant/30">
        {[
          { color: 'bg-primary', label: 'Dijawab' },
          { color: 'bg-tertiary border border-tertiary', label: 'Ditandai' },
          { color: 'bg-surface-container-low border border-outline-variant', label: 'Belum' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${l.color}`} />
            <span className="text-[10px] text-on-surface-variant">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ExamSessionPage() {
  const { examId } = useParams<{ examId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const autoSubmittedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sessionId = searchParams.get('session') ?? examId;

  const [sessionData, setSessionData] = useState<ExamSessionData | null>(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) { setLoadError(json.message); return; }
        setSessionData(json.data);
      })
      .catch(() => setLoadError('Gagal memuat sesi ujian.'));
  }, [sessionId]);

  const questions: ExamQuestion[] = sessionData?.exam.items.map((i) => i.question) ?? [];
  const totalQuestions = questions.length;
  const durationSeconds = (sessionData?.exam.duration ?? 90) * 60;

  const [initialized, setInitialized] = useState(false);
  const [answered, setAnswered] = useState<Set<number>>(new Set());
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [current, setCurrent] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [essayTexts, setEssayTexts] = useState<Record<string, string>>({});
  const [mapOpen, setMapOpen] = useState(false);      // mobile bottom sheet
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!sessionData || initialized) return;
    const answeredIdx = new Set<number>();
    const opts: Record<string, string> = {};
    const essays: Record<string, string> = {};
    sessionData.answers.forEach((a) => {
      const idx = questions.findIndex((q) => q.id === a.questionId);
      if (idx !== -1) {
        answeredIdx.add(idx);
        if (a.optionId) opts[a.questionId] = a.optionId;
        if (a.essayText) essays[a.questionId] = a.essayText;
      }
    });
    setAnswered(answeredIdx);
    setSelectedOptions(opts);
    setEssayTexts(essays);
    setInitialized(true);
  }, [sessionData, initialized, questions]);

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!sessionData) return;
    if (sessionData.startedAt) {
      const elapsed = Math.floor((Date.now() - new Date(sessionData.startedAt).getTime()) / 1000);
      setTimeLeft(Math.max(0, durationSeconds - elapsed));
    } else {
      setTimeLeft(durationSeconds);
    }
  }, [sessionData, durationSeconds]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setConfirmOpen(false);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/submit`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        toast.success('Ujian berhasil dikumpulkan!');
        router.push(`/santri/results/${sessionId}`);
      } else {
        toast.error(json.message ?? 'Gagal mengumpulkan ujian');
        setSubmitting(false);
      }
    } catch {
      toast.error('Terjadi kesalahan. Coba lagi.');
      setSubmitting(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, submitting]);

  useEffect(() => {
    if (timeLeft === null) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t === null) return t;
        if (t <= 1 && !autoSubmittedRef.current) {
          autoSubmittedRef.current = true;
          handleSubmit();
        }
        return Math.max(0, t - 1);
      });
    }, 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft !== null]);

  const { requestFullscreen } = useAntiCheat({
    sessionId,
    enabled: !!sessionData,
    onViolation: (_, count) => {
      if (count >= 5) {
        toast.error('Terlalu banyak pelanggaran. Ujian dikumpulkan otomatis.', { duration: 5000 });
        handleSubmit();
      }
    },
  });

  const saveAnswer = useCallback((questionId: string, optionId?: string, essayText?: string) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await fetch(`/api/sessions/${sessionId}/answers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionId, optionId, essayText }),
        });
      } catch { /* silent */ }
    }, 600);
  }, [sessionId]);

  const selectOption = (questionId: string, optionId: string, idx: number) => {
    setSelectedOptions((p) => ({ ...p, [questionId]: optionId }));
    setAnswered((p) => new Set(p).add(idx));
    saveAnswer(questionId, optionId);
  };

  const updateEssay = (questionId: string, text: string, idx: number) => {
    setEssayTexts((p) => ({ ...p, [questionId]: text }));
    if (text.trim()) setAnswered((p) => new Set(p).add(idx));
    else setAnswered((p) => { const n = new Set(p); n.delete(idx); return n; });
    saveAnswer(questionId, undefined, text);
  };

  const toggleFlag = useCallback(() => {
    setFlagged((p) => {
      const n = new Set(p);
      if (n.has(current)) n.delete(current); else n.add(current);
      return n;
    });
  }, [current]);

  const goTo = (idx: number) => { setCurrent(idx); setMapOpen(false); };

  if (loadError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <p className="text-error font-semibold">{loadError}</p>
          <button onClick={() => router.push('/santri')} className="text-sm text-primary underline">Kembali ke Dashboard</button>
        </div>
      </div>
    );
  }

  if (!sessionData || !initialized || timeLeft === null || totalQuestions === 0) return <LoadingScreen />;

  const currentQuestion = questions[current];
  const progress = Math.round((answered.size / totalQuestions) * 100);
  const isLowTime = timeLeft < 300;
  const unansweredCount = totalQuestions - answered.size;

  return (
    <div className="min-h-screen bg-background flex flex-col -m-4 md:-m-6 lg:-m-8">

      {/* ── Confirm Modal ──────────────────────────────────────────────────── */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md p-6 sm:p-8">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-bold text-on-surface">Kumpulkan Ujian?</h3>
              </div>
              <button onClick={() => setConfirmOpen(false)} className="p-1.5 rounded-full hover:bg-surface-container transition-colors">
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>
            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Sudah dijawab</span>
                <span className="font-bold text-primary">{answered.size} / {totalQuestions}</span>
              </div>
              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
              </div>
              {unansweredCount > 0 && (
                <p className="text-sm text-tertiary-container font-medium">
                  ⚠ {unansweredCount} soal belum dijawab.
                </p>
              )}
              <p className="text-xs text-on-surface-variant">Jawaban tidak dapat diubah setelah dikumpulkan.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmOpen(false)}
                className="flex-1 h-11 rounded-xl border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-all">
                Kembali
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 h-11 bg-primary text-white rounded-xl text-sm font-bold hover:brightness-110 disabled:opacity-70">
                {submitting ? 'Mengumpulkan…' : 'Ya, Kumpulkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile: Question Map Bottom Sheet ─────────────────────────────── */}
      {mapOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-sm"
          onClick={() => setMapOpen(false)}>
          <div className="bg-surface-container-lowest rounded-t-2xl shadow-2xl max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-outline-variant" />
            </div>
            <QuestionMap
              totalQuestions={totalQuestions} answered={answered} flagged={flagged}
              current={current} onGoTo={goTo} onClose={() => setMapOpen(false)} mobile
            />
          </div>
        </div>
      )}

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 flex items-center justify-between w-full px-3 sm:px-5 py-3 bg-surface-container-lowest border-b-2 border-primary/20 shadow-sm gap-2">
        {/* Left: title */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="min-w-0">
            <p className="text-xs font-bold text-primary truncate leading-none">Sesi Ujian</p>
            <p className="text-[11px] text-on-surface-variant truncate hidden sm:block">{sessionData.exam.title}</p>
          </div>
        </div>

        {/* Right: timer + actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {/* Timer */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${
            isLowTime ? 'bg-error/10 border-error/30' : 'bg-primary/5 border-primary/20'
          }`}>
            <Timer className={`w-4 h-4 ${isLowTime ? 'text-error animate-pulse' : 'text-primary'}`} />
            <span className={`text-sm font-bold tabular-nums ${isLowTime ? 'text-error' : 'text-primary'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Fullscreen — hidden on very small screens */}
          <button onClick={requestFullscreen} title="Fullscreen"
            className="hidden sm:flex p-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors">
            <Maximize className="w-4 h-4" />
          </button>

          {/* Submit */}
          <button onClick={() => setConfirmOpen(true)} disabled={submitting}
            className="h-9 px-3 sm:px-5 bg-primary text-white rounded-lg text-xs sm:text-sm font-semibold hover:brightness-110 active:scale-95 shadow-sm disabled:opacity-70 whitespace-nowrap">
            {submitting ? 'Mengumpulkan…' : <><span className="hidden sm:inline">Kumpulkan Ujian</span><span className="sm:hidden">Kumpulkan</span></>}
          </button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="w-full h-1 bg-surface-container-high">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full px-3 sm:px-5 md:px-8 py-4 md:py-6 gap-4 md:gap-6">

        {/* Question area */}
        <section className="flex-1 flex flex-col gap-4">
          <div className="bg-surface-container-lowest p-4 sm:p-6 md:p-8 rounded-xl shadow-sm border border-outline-variant/30">

            {/* Question header */}
            <div className="flex justify-between items-start gap-3 mb-5">
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full inline-block mb-3">
                  Soal {current + 1} dari {totalQuestions}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-on-surface leading-snug">
                  {currentQuestion.text}
                </h2>
              </div>
              <button onClick={toggleFlag}
                className={`flex flex-col items-center gap-0.5 flex-shrink-0 transition-colors p-1 rounded-lg ${
                  flagged.has(current) ? 'text-tertiary' : 'text-on-surface-variant hover:text-tertiary'
                }`}>
                <Flag className={`w-5 h-5 sm:w-6 sm:h-6 ${flagged.has(current) ? 'fill-tertiary' : ''}`} />
                <span className="text-[9px] font-bold">Tandai</span>
              </button>
            </div>

            {/* MC */}
            {currentQuestion.type === 'MULTIPLE_CHOICE' && (
              <div className="space-y-2.5 sm:space-y-3">
                {currentQuestion.options.map((opt) => {
                  const selected = selectedOptions[currentQuestion.id] === opt.id;
                  return (
                    <label key={opt.id}
                      className={`group flex items-center p-3 sm:p-4 md:p-5 rounded-xl border-2 cursor-pointer transition-all ${
                        selected ? 'border-primary bg-primary/5' : 'border-outline-variant/30 hover:border-primary/40 hover:bg-primary/3'
                      }`}>
                      <input type="radio" name="exam-option" checked={selected}
                        onChange={() => selectOption(currentQuestion.id, opt.id, current)}
                        className="w-4 h-4 sm:w-5 sm:h-5 accent-primary flex-shrink-0" />
                      <span className={`ml-3 text-sm leading-snug ${selected ? 'text-on-surface' : 'text-on-surface-variant group-hover:text-on-surface'}`}>
                        <span className="font-bold mr-1.5">{opt.label}.</span>
                        {opt.text}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Essay */}
            {currentQuestion.type === 'ESSAY' && (
              <textarea
                value={essayTexts[currentQuestion.id] ?? ''}
                onChange={(e) => updateEssay(currentQuestion.id, e.target.value, current)}
                placeholder="Tulis jawaban Anda di sini…"
                rows={6}
                className="w-full px-3 py-3 rounded-xl border-2 border-outline-variant/30 bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
              />
            )}
          </div>

          {/* Mobile: answered status bar */}
          <div className="md:hidden flex items-center justify-between bg-surface-container-lowest rounded-xl border border-outline-variant/30 px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span><span className="font-bold text-primary">{answered.size}</span>/{totalQuestions} dijawab</span>
            </div>
            <button onClick={() => setMapOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
              <Map className="w-3.5 h-3.5" /> Peta Soal
            </button>
          </div>
        </section>

        {/* Desktop: sidebar question map */}
        <aside className="hidden md:block w-[260px] xl:w-[300px] shrink-0">
          <QuestionMap
            totalQuestions={totalQuestions} answered={answered} flagged={flagged}
            current={current} onGoTo={goTo}
          />
        </aside>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant/30 px-3 sm:px-5 py-3 sm:py-4 sticky bottom-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
          <button onClick={() => goTo(Math.max(0, current - 1))} disabled={current === 0}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-secondary text-secondary hover:bg-secondary-container/20 transition-all text-xs sm:text-sm font-semibold disabled:opacity-40">
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </button>

          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest hidden sm:inline">Autosave Aktif</span>
            </div>
            <span className="text-xs text-on-surface-variant sm:hidden font-medium">{current + 1} / {totalQuestions}</span>
          </div>

          <button onClick={() => goTo(Math.min(totalQuestions - 1, current + 1))} disabled={current === totalQuestions - 1}
            className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-primary text-white hover:brightness-110 shadow-md transition-all text-xs sm:text-sm font-semibold disabled:opacity-40">
            <span className="hidden sm:inline">Soal Berikutnya</span>
            <span className="sm:hidden">Berikutnya</span>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
}
