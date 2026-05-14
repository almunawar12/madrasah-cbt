'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users, GraduationCap, BookUser, ShieldCheck, Upload, Download, UserPlus, ChevronLeft, ChevronRight, MoreVertical, X, Trash2 } from 'lucide-react';
import { useUsers, useCreateUser, useDeleteUser, type UserRow } from '@/features/users/hooks/use-users';
import { useClasses } from '@/features/classes/hooks/use-classes';

type Tab = 'SANTRI' | 'GURU' | 'PENGAWAS';

const createSchema = z.object({
  fullName: z.string().min(2, 'Min 2 karakter'),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  nis: z.string().min(5, 'Min 5 karakter').optional().or(z.literal('')),
  phone: z.string().optional(),
  role: z.enum(['SUPER_ADMIN', 'GURU', 'PENGAWAS', 'SANTRI']),
  classId: z.string().uuid().optional().or(z.literal('')),
  password: z.string().min(8, 'Min 8 karakter'),
});
type CreateForm = z.infer<typeof createSchema>;

function statusBadge(status: string) {
  if (status === 'ACTIVE') return 'bg-primary/10 text-primary';
  if (status === 'INACTIVE') return 'bg-secondary-fixed text-secondary';
  return 'bg-tertiary-container/20 text-tertiary-container';
}

function statusLabel(status: string) {
  if (status === 'ACTIVE') return 'Aktif';
  if (status === 'INACTIVE') return 'Nonaktif';
  return 'Ditangguhkan';
}

function Initials({ name }: { name: string }) {
  const init = name.replace(/^Ust\.\s*/i, '').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
      {init}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-surface-container rounded-xl animate-pulse" />)}
    </div>
  );
}

function CreateUserModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createUser = useCreateUser();
  const { data: classes } = useClasses();
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { role: 'SANTRI' },
  });
  const role = watch('role');

  const onSubmit = (values: CreateForm) => {
    const data = {
      ...values,
      email: values.email || undefined,
      nis: values.nis || undefined,
      classId: values.classId || undefined,
    };
    createUser.mutate(data as never, { onSuccess: () => { reset(); onClose(); } });
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-on-surface">Tambah Pengguna</h3>
          <button onClick={() => { onClose(); reset(); }} className="p-2 rounded-full hover:bg-surface-container transition-colors">
            <X className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-on-surface-variant">Nama Lengkap *</label>
              <input {...register('fullName')} placeholder="Ahmad Fauzi" className="w-full h-11 px-4 rounded-lg border border-outline-variant bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              {errors.fullName && <p className="text-xs text-error">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface-variant">Role *</label>
              <select {...register('role')} className="w-full h-11 px-4 rounded-lg border border-outline-variant bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all">
                <option value="SANTRI">Santri</option>
                <option value="GURU">Guru</option>
                <option value="PENGAWAS">Pengawas</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
            {role === 'SANTRI' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-on-surface-variant">NIS</label>
                <input {...register('nis')} placeholder="20250001" className="w-full h-11 px-4 rounded-lg border border-outline-variant bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                {errors.nis && <p className="text-xs text-error">{errors.nis.message}</p>}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface-variant">Email</label>
              <input {...register('email')} type="email" placeholder="user@madrasah.id" className="w-full h-11 px-4 rounded-lg border border-outline-variant bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
              {errors.email && <p className="text-xs text-error">{errors.email.message}</p>}
            </div>
            {role === 'SANTRI' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-on-surface-variant">Kelas</label>
                <select {...register('classId')} className="w-full h-11 px-4 rounded-lg border border-outline-variant bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all">
                  <option value="">— Pilih Kelas —</option>
                  {classes?.map(c => <option key={c.id} value={c.id}>Kelas {c.name} ({c.academicYear})</option>)}
                </select>
              </div>
            )}
            <div className="col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-on-surface-variant">Password *</label>
              <input {...register('password')} type="password" placeholder="Min 8 karakter" className="w-full h-11 px-4 rounded-lg border border-outline-variant bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
              {errors.password && <p className="text-xs text-error">{errors.password.message}</p>}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { onClose(); reset(); }} className="flex-1 h-11 rounded-xl border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-all">Batal</button>
            <button type="submit" disabled={createUser.isPending} className="flex-1 h-11 bg-primary text-white rounded-xl text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-70">
              {createUser.isPending ? 'Menyimpan…' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function UsersClient() {
  const [tab, setTab] = useState<Tab>('SANTRI');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useUsers({ role: tab, page });
  const deleteUser = useDeleteUser();

  const users: UserRow[] = data?.users ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / (data?.limit ?? 20));

  const tabs: { key: Tab; label: string }[] = [
    { key: 'SANTRI', label: 'Santri' },
    { key: 'GURU', label: 'Guru' },
    { key: 'PENGAWAS', label: 'Pengawas' },
  ];

  return (
    <div className="space-y-8">
      <CreateUserModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <nav className="flex gap-2 mb-2 text-xs text-on-surface-variant">
            <span>Administrasi</span><span>/</span>
            <span className="text-primary font-bold">Manajemen Pengguna</span>
          </nav>
          <h2 className="text-2xl font-bold text-on-surface">Manajemen Pengguna</h2>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface-variant rounded-lg text-sm hover:bg-surface-container-high transition-all">
            <Upload className="w-4 h-4" /> Import
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface-variant rounded-lg text-sm hover:bg-surface-container-high transition-all">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:brightness-110 transition-all shadow-md">
            <UserPlus className="w-4 h-4" /> Tambah Pengguna
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Pengguna', value: total.toLocaleString('id'), badge: '', badgeCls: 'text-primary', icon: Users, iconBg: 'bg-primary/10 text-primary' },
          { label: 'Santri', value: tab === 'SANTRI' ? total.toLocaleString('id') : '—', badge: 'Aktif', badgeCls: 'text-tertiary-container', icon: GraduationCap, iconBg: 'bg-tertiary-container/10 text-tertiary-container' },
          { label: 'Guru', value: tab === 'GURU' ? total.toLocaleString('id') : '—', badge: 'Tetap', badgeCls: 'text-secondary', icon: BookUser, iconBg: 'bg-secondary-container text-secondary' },
          { label: 'Pengawas', value: tab === 'PENGAWAS' ? total.toLocaleString('id') : '—', badge: 'Admin', badgeCls: 'text-on-surface-variant', icon: ShieldCheck, iconBg: 'bg-surface-container-high text-on-surface-variant' },
        ].map((s) => (
          <div key={s.label} className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg ${s.iconBg}`}><s.icon className="w-5 h-5" /></div>
              {s.badge && <span className={`text-xs font-bold ${s.badgeCls}`}>{s.badge}</span>}
            </div>
            <p className="text-xs text-on-surface-variant mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-on-surface">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="flex border-b border-outline-variant px-6">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => { setTab(t.key); setPage(1); }}
              className={`px-6 py-4 text-sm font-medium transition-colors ${tab === t.key ? 'text-primary font-bold border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {isLoading ? <TableSkeleton /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  {['Pengguna', 'NIS / ID', 'Kelas / Jabatan', 'Status', ''].map((h) => (
                    <th key={h} className={`px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider ${h === '' ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {users.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-on-surface-variant">Tidak ada data pengguna.</td></tr>
                ) : users.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Initials name={u.fullName} />
                        <div>
                          <p className="text-sm font-bold text-on-surface">{u.fullName}</p>
                          <p className="text-xs text-on-surface-variant">{u.email ?? '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant font-mono">{u.nis ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {u.class ? `Kelas ${u.class.name} (${u.class.academicYear})` : u.role !== 'SANTRI' ? u.role === 'GURU' ? 'Guru' : 'Pengawas' : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${statusBadge(u.status)}`}>{statusLabel(u.status)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="text-on-surface-variant hover:text-primary p-2 rounded-full transition-colors"><MoreVertical className="w-5 h-5" /></button>
                        <button onClick={() => deleteUser.mutate(u.id)} className="text-on-surface-variant hover:text-error p-2 rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-4 bg-surface-container-low flex justify-between items-center">
          <p className="text-xs text-on-surface-variant">Menampilkan {users.length} dari {total} pengguna</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`px-3 py-1 rounded-lg text-sm font-semibold ${page === p ? 'bg-primary text-white' : 'border border-outline-variant hover:bg-surface-container-high transition-colors'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors disabled:opacity-40">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
