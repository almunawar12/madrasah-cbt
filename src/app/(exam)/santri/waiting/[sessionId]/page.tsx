'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  BookOpenCheck, Clock, FileText, Maximize2, ShieldAlert,
  Monitor, Eye, Copy, AlertTriangle, CheckCircle2, Loader2, Users,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SessionInfo {
  id: string;
  status: string;
  exam: {
    id: string;
    title: string;
    duration: number;
    startTime: string | null;
    endTime: string | null;
    _count: { items: number };
    subject: { name: string };
  };
}

const RULES = [
  { icon: Maximize2,    text: 'Layar wajib fullscreen selama ujian berlangsung.' },
  { icon: Monitor,      text: 'Dilarang membuka tab atau jendela browser lain.' },
  { icon: Eye,          text: 'Dilarang berpindah ke aplikasi lain.' },
  { icon: Copy,         text: 'Dilarang menyalin teks soal atau jawaban.' },
  { icon: AlertTriangle,text: 'Setiap pelanggaran dicatat & dilaporkan pengawas.' },
];

export default function WaitingPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();

  const [info, setInfo] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [fsReady, setFsReady] = useState(false);

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}/info`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) { toast.error(json.message); router.push('/santri'); return; }
        setInfo(json.data);
      })
      .catch(() => { toast.error('Gagal memuat info ujian'); router.push('/santri'); })
      .finally(() => setLoading(false));
  }, [sessionId, router]);

  useEffect(() => {
    const handler = () => setFsReady(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const requestFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
    } catch {
      toast.error('Gagal fullscreen. Tekan F11 secara manual.');
    }
  };

  const handleStart = async () => {
    if (!info) return;
    setStarting(true);
    if (!document.fullscreenElement) {
      await requestFullscreen();
      await new Promise((r) => setTimeout(r, 300));
    }
    router.push(`/santri/exam/${info.exam.id}?session=${sessionId}`);
  };

  if (loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!info) return null;

  return (
    <div className="h-screen bg-background islamic-pattern flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-5xl h-full max-h-[680px] grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">

        {/* ── Kiri: Info Ujian ─────────────────────────────────── */}
        <div className="flex flex-col gap-4 min-h-0">

          {/* Exam card */}
          <div className="bg-primary rounded-2xl p-6 text-white relative overflow-hidden flex-shrink-0">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <BookOpenCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Bersiap Ujian</p>
                  <p className="text-xs opacity-80">{info.exam.subject.name}</p>
                </div>
              </div>
              <h1 className="text-xl font-bold leading-snug mb-4">{info.exam.title}</h1>
              <div className="flex gap-3">
                <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">{info.exam.duration} menit</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">{info.exam._count.items} soal</span>
                </div>
              </div>
            </div>
            <BookOpenCheck className="absolute -right-4 -bottom-4 w-28 h-28 opacity-10" />
          </div>

          {/* Fullscreen status */}
          <div className={`flex items-center gap-3 p-4 rounded-xl border flex-shrink-0 ${
            fsReady ? 'bg-primary/5 border-primary/30' : 'bg-surface-container-lowest border-outline-variant/40'
          }`}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
              fsReady ? 'bg-primary/10' : 'bg-surface-container-high'
            }`}>
              {fsReady
                ? <CheckCircle2 className="w-4 h-4 text-primary" />
                : <Maximize2 className="w-4 h-4 text-on-surface-variant" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold leading-none ${fsReady ? 'text-primary' : 'text-on-surface'}`}>
                {fsReady ? 'Fullscreen Aktif' : 'Fullscreen Belum Aktif'}
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {fsReady ? 'Layar siap untuk ujian.' : 'Wajib aktif sebelum mulai ujian.'}
              </p>
            </div>
            {!fsReady && (
              <button
                onClick={requestFullscreen}
                className="px-3 py-1.5 rounded-lg border border-primary text-primary text-xs font-bold hover:bg-primary/5 transition-colors flex-shrink-0"
              >
                Aktifkan
              </button>
            )}
          </div>

          {/* Start button */}
          <div className="flex-shrink-0 space-y-2">
            <button
              onClick={handleStart}
              disabled={starting}
              className="w-full py-3.5 bg-primary text-white font-bold text-sm rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
            >
              {starting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Memulai Ujian…</>
                : <><BookOpenCheck className="w-4 h-4" /> Mulai Ujian Sekarang</>
              }
            </button>
            <p className="text-center text-[11px] text-on-surface-variant">
              Dengan memulai, Anda menyetujui seluruh peraturan ujian.
            </p>
          </div>
        </div>

        {/* ── Kanan: Peraturan ─────────────────────────────────── */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col min-h-0 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-outline-variant/30 bg-error/5 flex-shrink-0">
            <ShieldAlert className="w-5 h-5 text-error flex-shrink-0" />
            <div>
              <h2 className="text-sm font-bold text-on-surface">Peraturan Ujian</h2>
              <p className="text-xs text-on-surface-variant">Baca dan pahami sebelum memulai</p>
            </div>
          </div>

          <ul className="flex-1 divide-y divide-outline-variant/20 overflow-y-auto">
            {RULES.map(({ icon: Icon, text }, i) => (
              <li key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="w-8 h-8 rounded-lg bg-error/8 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-error" />
                </div>
                <p className="text-sm text-on-surface">{text}</p>
              </li>
            ))}
          </ul>

          {/* Footer note */}
          <div className="px-5 py-4 border-t border-outline-variant/20 bg-surface-container-low flex-shrink-0">
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 text-on-surface-variant flex-shrink-0 mt-0.5" />
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Pengawas memantau aktivitas Anda secara <strong className="text-on-surface">real-time</strong> selama ujian berlangsung.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
