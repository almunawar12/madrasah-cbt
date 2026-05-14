'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GraduationCap, Plus, Trash2, X, Users } from 'lucide-react';
import { useClasses, useCreateClass, useDeleteClass } from '@/features/classes/hooks/use-classes';

const schema = z.object({
  name: z.string().min(1, 'Wajib diisi').max(50),
  academicYear: z.string().regex(/^\d{4}\/\d{4}$/, 'Format: 2024/2025'),
});
type FormValues = z.infer<typeof schema>;

function Skeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-28 bg-surface-container rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

export function ClassesClient() {
  const { data, isLoading } = useClasses();
  const createClass = useCreateClass();
  const deleteClass = useDeleteClass();
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { academicYear: '2024/2025' },
  });

  const onSubmit = (values: FormValues) => {
    createClass.mutate(values, { onSuccess: () => { reset(); setOpen(false); } });
  };

  const grouped = data?.reduce<Record<string, typeof data>>((acc, c) => {
    (acc[c.academicYear] ??= []).push(c);
    return acc;
  }, {}) ?? {};

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Manajemen Kelas</h2>
          <p className="text-sm text-on-surface-variant mt-1">Kelola kelas dan tahun ajaran.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:brightness-110 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" /> Tambah Kelas
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-on-surface">Tambah Kelas</h3>
              <button onClick={() => { setOpen(false); reset(); }} className="p-2 rounded-full hover:bg-surface-container transition-colors">
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-on-surface-variant">Nama Kelas</label>
                <input
                  {...register('name')}
                  placeholder="Contoh: X-A"
                  className="w-full h-11 px-4 rounded-lg border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                {errors.name && <p className="text-xs text-error">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-on-surface-variant">Tahun Ajaran</label>
                <input
                  {...register('academicYear')}
                  placeholder="2024/2025"
                  className="w-full h-11 px-4 rounded-lg border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                {errors.academicYear && <p className="text-xs text-error">{errors.academicYear.message}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setOpen(false); reset(); }} className="flex-1 h-11 rounded-xl border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-all">
                  Batal
                </button>
                <button type="submit" disabled={createClass.isPending} className="flex-1 h-11 bg-primary text-white rounded-xl text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-70">
                  {createClass.isPending ? 'Menyimpan…' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading ? <Skeleton /> : !data?.length ? (
        <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant/30">
          <GraduationCap className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-sm">Belum ada kelas.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([year, classes]) => (
            <div key={year}>
              <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">
                Tahun Ajaran {year}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {classes.map((c) => (
                  <div key={c.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5 hover:shadow-md transition-shadow group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-primary" />
                      </div>
                      <button
                        onClick={() => deleteClass.mutate(c.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-on-surface-variant hover:text-error hover:bg-error/5 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h4 className="text-lg font-bold text-on-surface">Kelas {c.name}</h4>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-on-surface-variant">
                      <Users className="w-3.5 h-3.5" />
                      <span>{c._count.students} Santri</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
