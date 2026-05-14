'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { User, Lock, BookOpenCheck } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { Checkbox } from '@/components/atoms/checkbox';
import { PasswordField } from '@/components/molecules/password-field';
import { FormField } from '@/components/molecules/form-field';
import { loginSchema, type LoginInput } from '@/features/auth/validations/login.schema';
import { cn } from '@/lib/utils';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const onSubmit = (values: LoginInput) => {
    setServerError(null);
    startTransition(async () => {
      const res = await signIn('credentials', { ...values, redirect: false });
      if (!res || res.error) {
        setServerError('Email/NIS atau password salah');
        toast.error('Login gagal. Periksa kembali kredensial Anda.');
        return;
      }
      toast.success('Selamat datang kembali!');
      router.replace(params.get('callbackUrl') ?? '/');
      router.refresh();
    });
  };

  return (
    <main className="w-full max-w-[1100px] h-screen md:h-[min(780px,calc(100vh-2rem))] flex flex-col md:flex-row overflow-hidden md:rounded-2xl shadow-[0_20px_50px_rgba(0,105,72,0.12)] bg-surface-container-lowest mx-auto">
      {/* Left: visual panel */}
      <section className="hidden md:flex md:w-1/2 relative bg-primary items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-container opacity-95" />
        <div className="relative z-10 p-10 max-w-md text-on-primary">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <BookOpenCheck className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">SantriExam</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-3">
            Digital Excellence<br />in Madrasah
          </h1>
          <p className="text-primary-fixed/90 text-base leading-relaxed mb-8">
            Platform ujian berbasis komputer yang modern, aman, dan terpercaya untuk seluruh civitas madrasah.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { icon: '📚', label: 'Bank Soal', value: '10.000+' },
              { icon: '🎓', label: 'Santri Aktif', value: '1.284' },
              { icon: '📝', label: 'Ujian Selesai', value: '432' },
              { icon: '⚡', label: 'Uptime', value: '99.9%' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl p-3">
                <div className="text-xl mb-1">{s.icon}</div>
                <div className="text-xs text-primary-fixed/70">{s.label}</div>
                <div className="text-lg font-bold">{s.value}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {['ZH', 'UF', 'MY'].map((i) => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-white bg-primary-container flex items-center justify-center text-xs font-bold text-on-primary-container">
                  {i}
                </div>
              ))}
            </div>
            <span className="text-sm text-primary-fixed/80">Bergabung dengan 10.000+ Santri</span>
          </div>
        </div>
      </section>

      {/* Right: auth form */}
      <section className="w-full md:w-1/2 flex flex-col items-center justify-center px-8 py-6 md:px-14 bg-surface-container-lowest overflow-hidden">
        <div className="w-full max-w-sm">
          {/* Mobile branding */}
          <div className="flex items-center gap-3 mb-4 md:hidden">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <BookOpenCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-primary">SantriExam</span>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-on-surface mb-1">Selamat Datang</h2>
            <p className="text-sm text-on-surface-variant">Masuk ke akun Anda untuk melanjutkan.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              label="Email atau NIS"
              htmlFor="identifier"
              error={errors.identifier?.message}
            >
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline" />
                <input
                  id="identifier"
                  autoComplete="username"
                  placeholder="santri@madrasah.id atau 20250001"
                  className={cn(
                    'flex h-11 w-full rounded-lg border bg-surface pl-10 pr-4 py-3 text-sm text-on-surface placeholder:text-outline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary transition-all',
                    errors.identifier ? 'border-error' : 'border-outline-variant',
                  )}
                  {...register('identifier')}
                />
              </div>
            </FormField>

            <FormField
              label="Password"
              htmlFor="password"
              error={errors.password?.message}
            >
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline z-10" />
                <div className="[&>input]:pl-10">
                  <PasswordField
                    id="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={errors.password ? 'border-error' : ''}
                    {...register('password')}
                  />
                </div>
              </div>
            </FormField>

            <div className="flex items-center justify-between">
              <Checkbox id="remember" label="Ingat saya" />
              <Link
                href="/forgot-password"
                className="text-sm font-semibold text-primary hover:text-primary-container transition-colors"
              >
                Lupa password?
              </Link>
            </div>

            {serverError && (
              <div className="rounded-lg bg-error-container px-4 py-3 text-sm text-on-error-container">
                {serverError}
              </div>
            )}

            <Button
              type="submit"
              disabled={pending}
              className="w-full h-12 text-base rounded-xl shadow-md"
            >
              {pending ? 'Memproses…' : 'Masuk'}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-outline-variant/30 text-center">
            <p className="text-xs text-on-surface-variant mb-2">Butuh bantuan?</p>
            <div className="flex items-center justify-center gap-6">
              <a href="#" className="text-xs font-semibold text-primary hover:opacity-80 transition-opacity uppercase tracking-wide">
                Dukungan
              </a>
              <a href="#" className="text-xs font-semibold text-primary hover:opacity-80 transition-opacity uppercase tracking-wide">
                Panduan
              </a>
            </div>
          </div>

          <p className="mt-4 text-center text-[11px] text-outline">
            © 2024 SantriExam · Digital Madrasah Ecosystem
          </p>
        </div>
      </section>
    </main>
  );
}
