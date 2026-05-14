'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { CreateUserInput, UpdateUserInput } from '@/features/users/validations/user.schema';

const USERS_KEY = 'users';

async function fetchUsers(params: { role?: string; page?: number; limit?: number } = {}) {
  const sp = new URLSearchParams();
  if (params.role) sp.set('role', params.role);
  if (params.page) sp.set('page', String(params.page));
  if (params.limit) sp.set('limit', String(params.limit));
  const res = await fetch(`/api/users?${sp}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data as { users: UserRow[]; total: number; page: number; limit: number };
}

async function createUser(data: CreateUserInput) {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}

async function updateUser(id: string, data: UpdateUserInput) {
  const res = await fetch(`/api/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}

async function deleteUser(id: string) {
  const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
}

export interface UserRow {
  id: string;
  fullName: string;
  email: string | null;
  nis: string | null;
  role: string;
  status: string;
  classId: string | null;
  createdAt: string;
}

export function useUsers(params?: { role?: string; page?: number }) {
  return useQuery({
    queryKey: [USERS_KEY, params],
    queryFn: () => fetchUsers(params),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [USERS_KEY] });
      toast.success('Pengguna berhasil dibuat');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) => updateUser(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [USERS_KEY] });
      toast.success('Pengguna berhasil diperbarui');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [USERS_KEY] });
      toast.success('Pengguna berhasil dihapus');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
