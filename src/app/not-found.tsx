import Link from 'next/link';
import { BookOpen, Home } from 'lucide-react';
import { BackButton } from '@/app/_components/back-button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background islamic-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-primary/40" />
            </div>
            <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-error/10 border-2 border-error/20 flex items-center justify-center">
              <span className="text-error font-black text-lg">!</span>
            </div>
          </div>
        </div>

        {/* 404 */}
        <div>
          <p className="text-8xl font-black text-primary/20 leading-none select-none">404</p>
          <h1 className="mt-2 text-2xl font-bold text-on-surface">Halaman Tidak Ditemukan</h1>
          <p className="mt-3 text-on-surface-variant text-sm leading-relaxed">
            Halaman yang Anda cari tidak ada atau telah dipindahkan.
            <br />
            Periksa kembali URL atau kembali ke beranda.
          </p>
        </div>

        {/* Arabic quote */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl px-6 py-4">
          <p className="text-primary font-semibold text-lg" dir="rtl">
            وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ
          </p>
          <p className="text-on-surface-variant text-xs mt-1">
            &ldquo;Boleh jadi kamu membenci sesuatu, padahal ia amat baik bagimu&rdquo; — Q.S. Al-Baqarah: 216
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            <Home className="w-4 h-4" />
            Ke Beranda
          </Link>
          <BackButton />
        </div>
      </div>
    </div>
  );
}
