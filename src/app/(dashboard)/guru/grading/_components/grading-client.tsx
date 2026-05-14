'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardCheck, CheckCircle2, Clock, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ExamRow } from '@/features/exams/hooks/use-exams';

interface EssayAnswer {
  id: string;
  essayText: string | null;
  score: number | null;
  gradedAt: string | null;
  question: { id: string; text: string; score: number };
  session: {
    id: string;
    status: string;
    user: { id: string; fullName: string; nis: string | null; class: { name: string } | null };
  };
}

function useFinishedExams() {
  return useQuery<ExamRow[]>({
    queryKey: ['exams-finished'],
    queryFn: async () => {
      const res = await fetch('/api/exams?status=FINISHED');
      const json = await res.json();
      return json.data?.exams ?? [];
    },
  });
}

function useEssayAnswers(examId: string) {
  return useQuery<EssayAnswer[]>({
    queryKey: ['essay-answers', examId],
    queryFn: async () => {
      const res = await fetch(`/api/exams/${examId}/grade`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    },
    enabled: !!examId,
  });
}

function useGradeAnswer(examId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ answerId, score }: { answerId: string; score: number }) => {
      const res = await fetch(`/api/exams/${examId}/grade`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answerId, score }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['essay-answers', examId] });
      toast.success('Nilai disimpan');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

function AnswerCard({ answer, examId }: { answer: EssayAnswer; examId: string }) {
  const [scoreInput, setScoreInput] = useState(answer.score?.toString() ?? '');
  const grade = useGradeAnswer(examId);
  const alreadyGraded = !!answer.gradedAt;
  const maxScore = answer.question.score;

  const handleGrade = () => {
    const s = Number(scoreInput);
    if (isNaN(s) || s < 0 || s > maxScore) {
      toast.error(`Nilai harus antara 0–${maxScore}`);
      return;
    }
    grade.mutate({ answerId: answer.id, score: s });
  };

  return (
    <div className={`bg-surface-container-lowest rounded-xl border p-5 space-y-4 ${alreadyGraded ? 'border-primary/20' : 'border-outline-variant/30'}`}>
      <div className="flex justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {answer.session.user.fullName}
            </span>
            <span className="text-xs text-on-surface-variant">
              {answer.session.user.class?.name ?? '—'} · {answer.session.user.nis ?? '—'}
            </span>
          </div>
          <p className="text-sm font-semibold text-on-surface leading-snug">{answer.question.text}</p>
        </div>
        {alreadyGraded ? (
          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
        ) : (
          <Clock className="w-5 h-5 text-on-surface-variant flex-shrink-0 mt-1" />
        )}
      </div>

      <div className="bg-surface-container p-4 rounded-lg">
        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Jawaban Santri</p>
        <p className="text-sm text-on-surface whitespace-pre-wrap">
          {answer.essayText ?? <span className="italic text-on-surface-variant">Tidak ada jawaban</span>}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-on-surface-variant whitespace-nowrap">
          Nilai (maks {maxScore}):
        </label>
        <input
          type="number"
          min={0}
          max={maxScore}
          value={scoreInput}
          onChange={(e) => setScoreInput(e.target.value)}
          className="w-24 h-9 px-3 rounded-lg border border-outline-variant bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
        <button
          onClick={handleGrade}
          disabled={grade.isPending}
          className="h-9 px-4 bg-primary text-white rounded-lg text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-70"
        >
          {grade.isPending ? 'Menyimpan…' : alreadyGraded ? 'Perbarui' : 'Simpan Nilai'}
        </button>
        {alreadyGraded && (
          <span className="text-xs text-primary font-semibold">
            Sudah dinilai: {answer.score}
          </span>
        )}
      </div>
    </div>
  );
}

export function GradingClient() {
  const [selectedExamId, setSelectedExamId] = useState('');
  const [filter, setFilter] = useState<'all' | 'ungraded' | 'graded'>('all');

  const { data: exams, isLoading: examsLoading } = useFinishedExams();
  const { data: answers, isLoading: answersLoading } = useEssayAnswers(selectedExamId);

  const filtered = (answers ?? []).filter((a) => {
    if (filter === 'ungraded') return !a.gradedAt;
    if (filter === 'graded') return !!a.gradedAt;
    return true;
  });

  const gradedCount = (answers ?? []).filter((a) => a.gradedAt).length;
  const totalCount = answers?.length ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-on-surface">Penilaian Esai</h2>
        <p className="text-sm text-on-surface-variant mt-1">Nilai jawaban esai santri secara manual.</p>
      </div>

      {/* Exam Selector */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-on-surface-variant">Pilih Ujian:</label>
        {examsLoading ? (
          <div className="h-11 w-72 bg-surface-container animate-pulse rounded-lg" />
        ) : (
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="h-11 px-4 rounded-lg border border-outline-variant bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          >
            <option value="">— Pilih Ujian Selesai —</option>
            {exams?.map((e) => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        )}
        {totalCount > 0 && (
          <span className="text-sm text-on-surface-variant">
            <span className="font-bold text-on-surface">{gradedCount}</span>/{totalCount} dinilai
          </span>
        )}
      </div>

      {/* Filter */}
      {selectedExamId && (
        <div className="flex gap-2">
          {(['all', 'ungraded', 'graded'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filter === f ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
            >
              {f === 'all' ? 'Semua' : f === 'ungraded' ? 'Belum Dinilai' : 'Sudah Dinilai'}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {!selectedExamId ? (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant/30">
          <BookOpen className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-sm">Pilih ujian yang sudah selesai untuk mulai menilai.</p>
        </div>
      ) : answersLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-48 bg-surface-container rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant/30">
          <ClipboardCheck className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-sm">
            {filter === 'ungraded' ? 'Semua jawaban sudah dinilai.' : 'Belum ada jawaban esai.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => (
            <AnswerCard key={a.id} answer={a} examId={selectedExamId} />
          ))}
        </div>
      )}
    </div>
  );
}
