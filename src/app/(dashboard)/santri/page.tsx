'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Clock, CheckCircle2, AlertCircle, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import { useJoinExam } from '@/features/exams/hooks/use-exams';
import { useQuery } from '@tanstack/react-query';

interface MySession {
  id: string;
  status: string;
  score: number | null;
  exam: { title: string; subject: { name: string }; duration: number; _count: { items: number } };
  createdAt: string;
}

function useMyExams() {
  return useQuery({
    queryKey: ['my-sessions'],
    queryFn: async (): Promise<MySession[]> => {
      const res = await fetch('/api/sessions/me');
      const json = await res.json();
      if (!json.success) return [];
      return json.data;
    },
  });
}

export default function SantriPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const joinExam = useJoinExam();
  const { data: sessions } = useMyExams();

  const handleJoin = () => {
    if (!token.trim()) { toast.error('Masukkan token ujian'); return; }
    joinExam.mutate(token.trim(), {
      onSuccess: (data) => {
        toast.success('Token valid! Bersiap ujian…');
        router.push(`/santri/waiting/${data.sessionId}`);
      },
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-on-surface">Dashboard Santri</h2>
        <p className="text-sm text-on-surface-variant mt-1">Selamat datang! Masukkan token untuk memulai ujian.</p>
      </div>

      {/* Token Entry */}
      <div className="bg-primary rounded-2xl p-8 islamic-pattern-white relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-2 mb-3">
            <Key className="w-5 h-5 text-primary-fixed" />
            <span className="text-sm font-semibold text-primary-fixed uppercase tracking-wide">Masuk Ujian</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Masukkan Token Ujian</h3>
          <p className="text-sm text-primary-fixed/80 mb-6">Token diberikan oleh pengawas sebelum ujian dimulai.</p>
          <div className="flex gap-3">
            <input
              value={token}
              onChange={(e) => setToken(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              placeholder="Contoh: ABX-2024-FQH"
              maxLength={20}
              className="flex-1 h-12 px-4 rounded-xl bg-white/10 border border-white/30 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm font-mono tracking-widest uppercase"
            />
            <button
              onClick={handleJoin}
              disabled={joinExam.isPending}
              className="h-12 px-6 bg-white text-primary font-bold rounded-xl hover:brightness-95 active:scale-95 transition-all disabled:opacity-70"
            >
              {joinExam.isPending ? 'Memverifikasi…' : 'Mulai Ujian'}
            </button>
          </div>
        </div>
      </div>

      {/* My Exams */}
      <div>
        <h3 className="text-lg font-semibold text-on-surface mb-4">Riwayat Ujian Saya</h3>
        {!sessions?.length ? (
          <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant/30">
            <BookOpen className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">Belum ada riwayat ujian.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => {
              const done = s.status === 'SUBMITTED' || s.status === 'FORCE_SUBMITTED';
              return (
                <div key={s.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5 flex items-center justify-between hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${done ? 'bg-primary/10' : 'bg-surface-container'}`}>
                      {done ? <CheckCircle2 className="w-6 h-6 text-primary" /> : <BookOpen className="w-6 h-6 text-on-surface-variant" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-on-surface">{s.exam.title}</h4>
                      <p className="text-xs text-on-surface-variant">{s.exam.subject.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-on-surface-variant flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {s.exam.duration} menit
                        </span>
                        <span className="text-xs text-on-surface-variant">{s.exam._count.items} soal</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {done ? (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{s.score?.toFixed(0) ?? '—'}</p>
                        <p className="text-[10px] text-on-surface-variant">Nilai Akhir</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full">
                        <AlertCircle className="w-3.5 h-3.5" /> {s.status === 'IN_PROGRESS' ? 'Sedang Berlangsung' : 'Menunggu'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
