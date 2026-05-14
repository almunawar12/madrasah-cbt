'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { CreateQuestionInput } from '@/features/questions/validations/question.schema';

const QS_KEY = 'questions';

export interface QuestionRow {
  id: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'ESSAY';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  score: number;
  imageUrl: string | null;
  createdAt: string;
  subject: { name: string };
  options: { id: string; label: string; text: string; isCorrect: boolean }[];
}

async function fetchQuestions(params: { subjectId?: string; type?: string; difficulty?: string; page?: number } = {}) {
  const sp = new URLSearchParams();
  if (params.subjectId) sp.set('subjectId', params.subjectId);
  if (params.type) sp.set('type', params.type);
  if (params.difficulty) sp.set('difficulty', params.difficulty);
  if (params.page) sp.set('page', String(params.page));
  const res = await fetch(`/api/questions?${sp}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data as { questions: QuestionRow[]; total: number; page: number };
}

async function createQuestion(data: CreateQuestionInput) {
  const res = await fetch('/api/questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}

async function deleteQuestion(id: string) {
  const res = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
}

export function useQuestions(params?: { subjectId?: string; type?: string; difficulty?: string; page?: number }) {
  return useQuery({
    queryKey: [QS_KEY, params],
    queryFn: () => fetchQuestions(params),
  });
}

export function useCreateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createQuestion,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QS_KEY] });
      toast.success('Soal berhasil dibuat');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QS_KEY] });
      toast.success('Soal berhasil dihapus');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
