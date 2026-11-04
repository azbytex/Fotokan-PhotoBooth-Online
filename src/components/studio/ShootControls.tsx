'use client';

import { ReactNode } from 'react';
import { ArrowRight, Camera, FlipHorizontal, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { ShotItem } from '@/lib/types';

interface ShootControlsProps {
  stage: 'ready' | 'countdown' | 'review';
  shotIndex: number;
  totalShots: number;
  takenCount: number;
  preview?: ShotItem;
  countdownSecs: number;
  setCountdownSecs: (secs: number) => void;
  isMirrored: boolean;
  setIsMirrored: (val: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  onShoot: () => void;
  onRetake: () => void;
  onNext: () => void;
  nextLabel: string;
  isBusy?: boolean;
  /** Kontrol filter, ditampilkan di bawah tombol utama. */
  children: ReactNode;
}

export default function ShootControls({
  stage,
  shotIndex,
  totalShots,
  takenCount,
  preview,
  countdownSecs,
  setCountdownSecs,
  isMirrored,
  setIsMirrored,
  soundEnabled,
  setSoundEnabled,
  onShoot,
  onRetake,
  onNext,
  nextLabel,
  isBusy = false,
  children,
}: ShootControlsProps) {
  const counting = stage === 'countdown';
  const heading =
    stage === 'review' ? `Foto ${shotIndex + 1} sudah diambil` : `Foto ${shotIndex + 1} dari ${totalShots}`;

  return (
    <div className="space-y-5 rounded-xl border border-line p-4 sm:p-5">
      <div>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">{counting ? 'Bersiap...' : heading}</h2>
          <span className="text-sm tabular-nums text-muted">
            {takenCount}/{totalShots}
          </span>
        </div>
        <div className="mt-2 flex gap-1" aria-hidden="true">
          {Array.from({ length: totalShots }).map((_, i) => (
            <span key={i} className={`h-1 flex-1 rounded-full ${i < takenCount ? 'bg-brand' : 'bg-line'}`} />
          ))}
        </div>
      </div>

      {stage === 'review' ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview.dataUrl}
              alt={`Hasil foto ${shotIndex + 1}`}
              className="h-20 w-[107px] shrink-0 rounded-md object-cover"
            />
          )}
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onRetake} disabled={isBusy} className="btn-secondary">
              <RotateCcw className="h-4 w-4" />
              Ulangi foto
            </button>
            <button type="button" onClick={onNext} disabled={isBusy} className="btn-primary">
              {isBusy ? 'Mengirim...' : nextLabel}
              {!isBusy && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={onShoot} disabled={counting} className="btn-primary w-full py-3 text-base">
          <Camera className="h-5 w-5" />
          {counting ? 'Menghitung mundur...' : 'Ambil foto'}
        </button>
      )}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium">Timer</span>
          <div className="flex overflow-hidden rounded-lg border border-line">
            {[3, 5, 10].map((secs) => (
              <button
                key={secs}
                type="button"
                onClick={() => setCountdownSecs(secs)}
                disabled={counting}
                aria-pressed={countdownSecs === secs}
                className={`px-3 py-1.5 ${countdownSecs === secs ? 'bg-fg text-page' : 'hover:bg-surface'}`}
              >
                {secs} dtk
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsMirrored(!isMirrored)}
          aria-pressed={isMirrored}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 ${isMirrored ? 'border-fg' : 'border-line text-muted'}`}
        >
          <FlipHorizontal className="h-4 w-4" />
          Cermin
        </button>
        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          aria-pressed={soundEnabled}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 ${soundEnabled ? 'border-fg' : 'border-line text-muted'}`}
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          Suara
        </button>
      </div>

      {children}
    </div>
  );
}
