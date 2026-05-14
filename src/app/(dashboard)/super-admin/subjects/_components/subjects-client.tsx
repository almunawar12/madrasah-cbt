'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookOpen, Plus, Trash2, Pencil, X } from 'lucide-react';
import { useSubjects, useCreateSubject, useDeleteSubject } from '@/features/subjects/hooks/use-subjects';

const schema = z.object({
  name: z.string().min(2, 'Min 2 karakter').max(100),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-16 bg-surface-container rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

export function SubjectsClient() {
  const { data, isLoading } = useSubjects();
  const createSubject = useCreateSubject();
  const deleteSubject = useDeleteSubject();
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (values: FormValues) => {
    createSubject.mutate(values, { onSuccess: () => { reset(); setOpen(false); } });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Mata Pelajaran</h2>
          <p className="text-sm text-on-surface-variant mt-1">Kelola daftar mata pelajaran ujian.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:brightness-110 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" /> Tambah Mapel
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-on-surface">Tambah Mata Pelajaran</h3>
              <button onClick={() => { setOpen(false); reset(); }} className="p-2 rounded-full hover:bg-surface-container transition-colors">
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-on-surface-variant">Nama Mata Pelajaran</label>
                <input
                  {...register('name')}
                  placeholder="Contoh: Fiqh & Syariah"
                  className="w-full h-11 px-4 rounded-lg border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                {errors.name && <p className="text-xs text-error">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-on-surface-variant">Deskripsi (opsional)</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Deskripsi singkat..."
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setOpen(false); reset(); }} className="flex-1 h-11 rounded-xl border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-all">
                  Batal
                </button>
                <button type="submit" disabled={createSubject.isPending} className="flex-1 h-11 bg-primary text-white rounded-xl text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-70">
                  {createSubject.isPending ? 'Menyimpan…' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? <Skeleton /> : (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm">
          {!data?.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
              <BookOpen className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm">Belum ada mata pelajaran.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Nama</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Deskripsi</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider text-center">Soal</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider text-center">Ujian</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {data.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-bold text-on-surface">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant max-w-xs truncate">{s.description ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-center font-bold text-on-surface">{s._count.questions}</td>
                    <td className="px-6 py-4 text-sm text-center font-bold text-on-surface">{s._count.exams}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteSubject.mutate(s.id)}
                          disabled={deleteSubject.isPending}
                          className="p-2 text-on-surface-variant hover:text-error hover:bg-error/5 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
