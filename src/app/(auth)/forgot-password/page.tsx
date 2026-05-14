import Link from 'next/link';
import { BookOpenCheck, ArrowLeft } from 'lucide-react';

export const metadata = { title: 'Lupa Password · SantriExam' };

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-surface-container-lowest rounded-2xl shadow-[0_20px_50px_rgba(0,105,72,0.10)] p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <BookOpenCheck className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-primary">SantriExam</span>
        </div>

        <h2 className="text-2xl font-bold text-on-surface mb-2">Lupa Password?</h2>
        <p className="text-sm text-on-surface-variant mb-8">
          Hubungi administrator untuk mereset password Anda, atau gunakan formulir berikut.
        </p>

        <form className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-on-surface-variant" htmlFor="email">
              Email atau NIS
            </label>
            <input
              id="email"
              type="text"
              placeholder="santri@madrasah.id atau 20250001"
              className="flex h-11 w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-sm text-on-surface placeholder:text-outline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary transition-all"
            />
          </div>
          <button
            type="submit"
            className="w-full h-12 bg-primary text-white text-base font-semibold rounded-xl shadow-md hover:brightness-110 active:scale-[0.98] transition-all"
          >
            Kirim Permintaan Reset
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke halaman masuk
          </Link>
        </div>
      </div>
    </div>
  );
}
