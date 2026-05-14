'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { CreateExamInput } from '@/features/exams/validations/exam.schema';

const EXAMS_KEY = 'exams';

export interface ExamRow {
  id: string;
  title: string;
  token: string;
  status: string;
  duration: number;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
  subject: { name: string };
  _count: { items: number; sessions: number };
}

async function fetchExams(params: { status?: string; page?: number } = {}) {
  const sp = new URLSearchParams();
  if (params.status) sp.set('status', params.status);
  if (params.page) sp.set('page', String(params.page));
  const res = await fetch(`/api/exams?${sp}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data as { exams: ExamRow[]; total: number; page: number };
}

async function createExam(data: CreateExamInput) {
  const res = await fetch('/api/exams', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}

async function joinExam(token: string) {
  const res = await fetch('/api/exams/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data as { examId: string; sessionId: string; examTitle: string; subject: string; duration: number; totalQuestions: number };
}

export function useExams(params?: { status?: string; page?: number }) {
  return useQuery({
    queryKey: [EXAMS_KEY, params],
    queryFn: () => fetchExams(params),
  });
}

export function useCreateExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createExam,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [EXAMS_KEY] });
      toast.success('Ujian berhasil dibuat');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useJoinExam() {
  return useMutation({
    mutationFn: joinExam,
    onError: (e: Error) => toast.error(e.message),
  });
}
