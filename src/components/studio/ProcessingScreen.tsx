'use client';

import { Wordmark } from '@/components/layout/BrandMark';

/** Layar singkat di antara foto terakhir dan halaman hasil. */
export default function ProcessingScreen() {
  return (
    <div role="status" className="page-fade fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-page px-4 text-center text-fg">
      <Wordmark isSpinning className="w-[min(78vw,420px)]" />
      <p className="text-xl font-bold tracking-tight">Menyusun fotomu...</p>
    </div>
  );
}
