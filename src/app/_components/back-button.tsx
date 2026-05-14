'use client';

import { ArrowLeft } from 'lucide-react';

export function BackButton() {
  return (
    <button
      onClick={() => history.back()}
      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-outline-variant text-on-surface font-semibold text-sm hover:bg-surface-container transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      Kembali
    </button>
  );
}
