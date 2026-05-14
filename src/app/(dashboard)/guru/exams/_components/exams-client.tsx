'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Timer, Plus, X, Copy, Trash2, Eye, ClipboardCheck } from 'lucide-react';
import { useExams, useCreateExam, type ExamRow } from '@/features/exams/hooks/use-exams';
import { useSubjects } from '@/features/subjects/hooks/use-subjects';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const formSchema = z.object({
  title: z.string().min(3, 'Min 3 karakter'),
  subjectId: z.string().uuid('Pilih mata pelajaran'),
  duration: z.coerce.number().int().min(5, 'Min 5 menit').max(300),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  shuffleQ: z.boolean().default(false),
  shuffleOpts: z.boolean().default(false),
});
type FormValues = z.infer<typeof formSchema>;

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Draft', PUBLISHED: 'Dipublikasi', ONGOING: 'Berlangsung', FINISHED: 'Selesai', ARCHIVED: 'Diarsipkan',
};
const STATUS_CLS: Record<string, string> = {
  DRAFT: 'bg-surface-container text-on-surface-variant',
  PUBLISHED: 'bg-primary/10 text-primary',
  ONGOING: 'bg-tertiary-container/20 text-tertiary-container',
  FINISHED: 'bg-secondary-container text-secondary',
  ARCHIVED: 'bg-surface-container-high text-on-surface-variant',
};

function usePublishExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/exams/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'PUBLISHED' }) });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exams'] }); toast.success('Ujian dipublikasikan'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

function useDeleteExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/exams/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exams'] }); toast.success('Ujian dihapus'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

function CreateExamModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: subjects } = useSubjects();
  const createExam = useCreateExam();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as never,
    defaultValues: { duration: 90, shuffleQ: false, shuffleOpts: false },
  });

  const onSubmit = (values: FormValues) => {
    createExam.mutate(values, { onSuccess: () => { reset(); onClose(); } });
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-on-surface">Buat Ujian Baru</h3>
          <button onClick={() => { onClose(); reset(); }} className="p-2 rounded-full hover:bg-surface-container transition-colors">
            <X className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-on-surface-variant">Judul Ujian *</label>
            <input {...register('title')} placeholder="Contoh: UTS Fiqh & Syariah Kelas X" className="w-full h-11 px-4 rounded-lg border border-outline-variant bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
            {errors.title && <p className="text-xs text-error">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface-variant">Mata Pelajaran *</label>
              <select {...register('subjectId')} className="w-full h-11 px-4 rounded-lg border border-outline-variant bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all">
                <option value="">— Pilih —</option>
                {subjects?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {errors.subjectId && <p className="text-xs text-error">{errors.subjectId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface-variant">Durasi (menit) *</label>
              <input {...register('duration')} type="number" className="w-full h-11 px-4 rounded-lg border border-outline-variant bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
              {errors.duration && <p className="text-xs text-error">{errors.duration.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface-variant">Mulai (opsional)</label>
              <input {...register('startTime')} type="datetime-local" className="w-full h-11 px-4 rounded-lg border border-outline-variant bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface-variant">Selesai (opsional)</label>
              <input {...register('endTime')} type="datetime-local" className="w-full h-11 px-4 rounded-lg border border-outline-variant bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
            </div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input {...register('shuffleQ')} type="checkbox" className="w-4 h-4 accent-primary" />
              <span className="text-sm text-on-surface-variant">Acak Soal</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input {...register('shuffleOpts')} type="checkbox" className="w-4 h-4 accent-primary" />
              <span className="text-sm text-on-surface-variant">Acak Opsi</span>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { onClose(); reset(); }} className="flex-1 h-11 rounded-xl border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-all">Batal</button>
            <button type="submit" disabled={createExam.isPending} className="flex-1 h-11 bg-primary text-white rounded-xl text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-70">
              {createExam.isPending ? 'Membuat…' : 'Buat Ujian'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ExamCard({ exam }: { exam: ExamRow }) {
  const publish = usePublishExam();
  const del = useDeleteExam();
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${STATUS_CLS[exam.status] ?? ''}`}>
          {STATUS_LABEL[exam.status]}
        </span>
        <div className="flex gap-1">
          <button className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all"><Eye className="w-4 h-4" /></button>
          <button onClick={() => { navigator.clipboard.writeText(exam.token); toast.success('Token disalin'); }} className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all"><Copy className="w-4 h-4" /></button>
          <button onClick={() => del.mutate(exam.id)} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/5 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
      <h4 className="text-sm font-bold text-on-surface mb-1 line-clamp-2">{exam.title}</h4>
      <p className="text-xs text-on-surface-variant mb-3">{exam.subject.name} · {exam.duration} menit</p>
      <div className="flex items-center justify-between">
        <div className="text-xs text-on-surface-variant">
          <span className="font-bold text-on-surface">{exam._count.items}</span> soal ·{' '}
          <span className="font-bold text-on-surface">{exam._count.sessions}</span> peserta
        </div>
        <div className="font-mono text-xs bg-surface-container px-2 py-1 rounded font-bold text-primary tracking-widest">{exam.token}</div>
      </div>
      {exam.status === 'DRAFT' && (
        <button onClick={() => publish.mutate(exam.id)} disabled={publish.isPending}
          className="mt-4 w-full h-9 flex items-center justify-center gap-2 bg-primary text-white rounded-lg text-xs font-bold hover:brightness-110 transition-all disabled:opacity-70">
          <ClipboardCheck className="w-4 h-4" /> Publikasikan
        </button>
      )}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-surface-container rounded-xl animate-pulse" />)}
    </div>
  );
}

export function ExamsClient() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('');
  const { data, isLoading } = useExams({ status: status || undefined });
  const exams = data?.exams ?? [];

  return (
    <div className="space-y-8">
      <CreateExamModal open={open} onClose={() => setOpen(false)} />

      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Ujian Saya</h2>
          <p className="text-sm text-on-surface-variant mt-1">Kelola dan pantau ujian yang Anda buat.</p>
        </div>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl text-sm font-semibold hover:brightness-110 transition-all shadow-lg">
          <Plus className="w-5 h-5" /> Buat Ujian
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[['', 'Semua'], ['DRAFT', 'Draft'], ['PUBLISHED', 'Dipublikasi'], ['ONGOING', 'Berlangsung'], ['FINISHED', 'Selesai']].map(([val, label]) => (
          <button key={val} onClick={() => setStatus(val)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${status === val ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>
            {label}
          </button>
        ))}
      </div>

      {isLoading ? <GridSkeleton /> : exams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant/30">
          <Timer className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-sm">Belum ada ujian. Klik "Buat Ujian" untuk mulai.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {exams.map(e => <ExamCard key={e.id} exam={e} />)}
        </div>
      )}
    </div>
  );
}
