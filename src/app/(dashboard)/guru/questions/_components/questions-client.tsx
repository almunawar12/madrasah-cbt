'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookOpen, FolderOpen, PlusCircle, Eye, Pencil, Copy, Trash2, X, Plus, Minus } from 'lucide-react';
import { useQuestions, useCreateQuestion, useDeleteQuestion } from '@/features/questions/hooks/use-questions';
import { useSubjects } from '@/features/subjects/hooks/use-subjects';

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

const optionSchema = z.object({ label: z.string(), text: z.string().min(1, 'Wajib diisi'), isCorrect: z.boolean() });
const formSchema = z.object({
  subjectId: z.string().uuid('Pilih mata pelajaran'),
  type: z.enum(['MULTIPLE_CHOICE', 'ESSAY']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  score: z.coerce.number().int().min(1),
  text: z.string().min(5, 'Min 5 karakter'),
  options: z.array(optionSchema).optional(),
});
type FormValues = z.infer<typeof formSchema>;

const LABELS = ['A', 'B', 'C', 'D', 'E'];

function difficultyBadge(d: Difficulty) {
  if (d === 'EASY') return 'bg-green-100 text-emerald-800';
  if (d === 'MEDIUM') return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
}
function difficultyLabel(d: Difficulty) {
  if (d === 'EASY') return 'MUDAH';
  if (d === 'MEDIUM') return 'SEDANG';
  return 'SULIT';
}

function TableSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-surface-container rounded-xl animate-pulse" />)}
    </div>
  );
}

function CreateQuestionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: subjects } = useSubjects();
  const createQuestion = useCreateQuestion();

  const { register, control, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as never,
    defaultValues: {
      type: 'MULTIPLE_CHOICE',
      difficulty: 'MEDIUM',
      score: 1,
      options: [
        { label: 'A', text: '', isCorrect: false },
        { label: 'B', text: '', isCorrect: false },
        { label: 'C', text: '', isCorrect: false },
        { label: 'D', text: '', isCorrect: false },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'options' });
  const type = watch('type');

  const setCorrect = (idx: number) => {
    fields.forEach((_, i) => setValue(`options.${i}.isCorrect`, i === idx));
  };

  const onSubmit = (values: FormValues) => {
    const data = {
      ...values,
      options: type === 'MULTIPLE_CHOICE' ? values.options?.map((o, i) => ({ ...o, label: LABELS[i] ?? String(i + 1) })) : undefined,
    };
    createQuestion.mutate(data as never, { onSuccess: () => { reset(); onClose(); } });
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-on-surface">Buat Soal Baru</h3>
          <button onClick={() => { onClose(); reset(); }} className="p-2 rounded-full hover:bg-surface-container transition-colors">
            <X className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-3 space-y-1.5">
              <label className="text-sm font-medium text-on-surface-variant">Mata Pelajaran *</label>
              <select {...register('subjectId')} className="w-full h-11 px-4 rounded-lg border border-outline-variant bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all">
                <option value="">— Pilih —</option>
                {subjects?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {errors.subjectId && <p className="text-xs text-error">{errors.subjectId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface-variant">Tipe *</label>
              <select {...register('type')} className="w-full h-11 px-4 rounded-lg border border-outline-variant bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all">
                <option value="MULTIPLE_CHOICE">Pilihan Ganda</option>
                <option value="ESSAY">Essay</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface-variant">Tingkat</label>
              <select {...register('difficulty')} className="w-full h-11 px-4 rounded-lg border border-outline-variant bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all">
                <option value="EASY">Mudah</option>
                <option value="MEDIUM">Sedang</option>
                <option value="HARD">Sulit</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface-variant">Skor</label>
              <input {...register('score')} type="number" min={1} className="w-full h-11 px-4 rounded-lg border border-outline-variant bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-on-surface-variant">Teks Soal *</label>
            <textarea {...register('text')} rows={4} placeholder="Tuliskan pertanyaan di sini..." className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none" />
            {errors.text && <p className="text-xs text-error">{errors.text.message}</p>}
          </div>

          {type === 'MULTIPLE_CHOICE' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-on-surface-variant">Pilihan Jawaban *</label>
                {fields.length < 5 && (
                  <button type="button" onClick={() => append({ label: LABELS[fields.length], text: '', isCorrect: false })}
                    className="flex items-center gap-1 text-xs text-primary font-semibold hover:opacity-80">
                    <Plus className="w-3.5 h-3.5" /> Tambah Opsi
                  </button>
                )}
              </div>
              {fields.map((field, i) => (
                <div key={field.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${watch(`options.${i}.isCorrect`) ? 'border-primary bg-primary/5' : 'border-outline-variant/30'}`}>
                  <button type="button" onClick={() => setCorrect(i)}
                    className={`w-7 h-7 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs font-bold transition-colors ${watch(`options.${i}.isCorrect`) ? 'border-primary bg-primary text-white' : 'border-outline-variant text-on-surface-variant hover:border-primary'}`}>
                    {LABELS[i]}
                  </button>
                  <input {...register(`options.${i}.text`)} placeholder={`Opsi ${LABELS[i]}`} className="flex-1 bg-transparent text-sm text-on-surface focus:outline-none placeholder:text-on-surface-variant/50" />
                  {fields.length > 2 && (
                    <button type="button" onClick={() => remove(i)} className="text-on-surface-variant hover:text-error transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <p className="text-xs text-on-surface-variant">Klik huruf untuk menandai jawaban benar.</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { onClose(); reset(); }} className="flex-1 h-11 rounded-xl border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-all">Batal</button>
            <button type="submit" disabled={createQuestion.isPending} className="flex-1 h-11 bg-primary text-white rounded-xl text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-70">
              {createQuestion.isPending ? 'Menyimpan…' : 'Simpan Soal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function QuestionsClient() {
  const [open, setOpen] = useState(false);
  const [subjectId, setSubjectId] = useState('');
  const [type, setType] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuestions({ subjectId: subjectId || undefined, type: type || undefined, difficulty: difficulty || undefined, page });
  const deleteQuestion = useDeleteQuestion();
  const { data: subjects } = useSubjects();

  const questions = data?.questions ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-8">
      <CreateQuestionModal open={open} onClose={() => setOpen(false)} />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-bold mb-2">
            <FolderOpen className="w-4 h-4" /> PERPUSTAKAAN / REPOSITORI
          </div>
          <h2 className="text-2xl font-bold text-on-surface">Bank Soal</h2>
          <p className="text-sm text-on-surface-variant mt-1">Kelola dan atur soal ujian digital.</p>
        </div>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl text-sm font-semibold hover:brightness-110 transition-all shadow-lg active:scale-95">
          <PlusCircle className="w-5 h-5" /> Buat Soal
        </button>
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant/30 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-on-surface-variant text-sm font-bold px-2 border-r border-outline-variant pr-4 mr-2">
          <BookOpen className="w-4 h-4" /> FILTER
        </div>
        <select value={subjectId} onChange={e => { setSubjectId(e.target.value); setPage(1); }}
          className="bg-surface-container-low border-none rounded-lg text-sm text-on-surface px-4 py-2 focus:ring-2 focus:ring-primary/20 min-w-[160px]">
          <option value="">Semua Mapel</option>
          {subjects?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={difficulty} onChange={e => { setDifficulty(e.target.value); setPage(1); }}
          className="bg-surface-container-low border-none rounded-lg text-sm text-on-surface px-4 py-2 focus:ring-2 focus:ring-primary/20 min-w-[140px]">
          <option value="">Semua Tingkat</option>
          <option value="EASY">Mudah</option>
          <option value="MEDIUM">Sedang</option>
          <option value="HARD">Sulit</option>
        </select>
        <select value={type} onChange={e => { setType(e.target.value); setPage(1); }}
          className="bg-surface-container-low border-none rounded-lg text-sm text-on-surface px-4 py-2 focus:ring-2 focus:ring-primary/20 min-w-[140px]">
          <option value="">Semua Tipe</option>
          <option value="MULTIPLE_CHOICE">Pilihan Ganda</option>
          <option value="ESSAY">Essay</option>
        </select>
        <div className="ml-auto text-xs text-on-surface-variant">Total: {total} soal</div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
        {isLoading ? <TableSkeleton /> : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high/50 border-b border-outline-variant/30">
                {['Preview Soal', 'Mata Pelajaran', 'Tingkat', 'Tipe', 'Skor', 'Dibuat', ''].map((h) => (
                  <th key={h} className={`px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider ${h === '' ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {questions.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-16 text-center text-sm text-on-surface-variant">Belum ada soal. Klik "Buat Soal" untuk mulai.</td></tr>
              ) : questions.map((q) => (
                <tr key={q.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-5 max-w-xs">
                    <p className="text-sm font-medium text-on-surface line-clamp-1">{q.text}</p>
                    <span className="text-xs text-on-surface-variant font-mono">ID: {q.id.slice(0, 8)}…</span>
                  </td>
                  <td className="px-6 py-5 text-sm text-on-surface">{q.subject.name}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${difficultyBadge(q.difficulty)}`}>{difficultyLabel(q.difficulty)}</span>
                  </td>
                  <td className="px-6 py-5 text-sm text-on-surface-variant">{q.type === 'MULTIPLE_CHOICE' ? 'Pilihan Ganda' : 'Essay'}</td>
                  <td className="px-6 py-5 text-sm font-bold text-on-surface">{q.score}</td>
                  <td className="px-6 py-5 text-sm text-on-surface-variant">{new Date(q.createdAt).toLocaleDateString('id-ID')}</td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="Preview"><Eye className="w-4 h-4" /></button>
                      <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="Edit"><Pencil className="w-4 h-4" /></button>
                      <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="Duplikat"><Copy className="w-4 h-4" /></button>
                      <button onClick={() => deleteQuestion.mutate(q.id)} className="p-2 text-on-surface-variant hover:text-error hover:bg-error/5 rounded-lg transition-all" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="px-6 py-4 bg-surface-container-low flex justify-between items-center border-t border-outline-variant/30">
          <p className="text-xs text-on-surface-variant">Halaman {page}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors text-xs disabled:opacity-40">← Prev</button>
            <button onClick={() => setPage(p => p + 1)} disabled={questions.length < 20} className="px-3 py-1.5 rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors text-xs disabled:opacity-40">Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
