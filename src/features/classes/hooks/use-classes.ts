'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export interface ClassRow {
  id: string;
  name: string;
  academicYear: string;
  _count: { students: number };
}

const KEY = 'classes';

async function fetchClasses(): Promise<ClassRow[]> {
  const res = await fetch('/api/classes');
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}

async function createClass(data: { name: string; academicYear: string }) {
  const res = await fetch('/api/classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}

async function deleteClass(id: string) {
  const res = await fetch(`/api/classes/${id}`, { method: 'DELETE' });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
}

export function useClasses() {
  return useQuery({ queryKey: [KEY], queryFn: fetchClasses });
}

export function useCreateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createClass,
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); toast.success('Kelas berhasil ditambahkan'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteClass,
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); toast.success('Kelas dihapus'); },
    onError: (e: Error) => toast.error(e.message),
  });
}
