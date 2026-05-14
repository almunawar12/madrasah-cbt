'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export interface SubjectRow {
  id: string;
  name: string;
  description: string | null;
  _count: { questions: number; exams: number };
}

const KEY = 'subjects';

async function fetchSubjects(): Promise<SubjectRow[]> {
  const res = await fetch('/api/subjects');
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}

async function createSubject(data: { name: string; description?: string }) {
  const res = await fetch('/api/subjects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}

async function deleteSubject(id: string) {
  const res = await fetch(`/api/subjects/${id}`, { method: 'DELETE' });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
}

export function useSubjects() {
  return useQuery({ queryKey: [KEY], queryFn: fetchSubjects });
}

export function useCreateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSubject,
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); toast.success('Mata pelajaran ditambahkan'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSubject,
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); toast.success('Mata pelajaran dihapus'); },
    onError: (e: Error) => toast.error(e.message),
  });
}
