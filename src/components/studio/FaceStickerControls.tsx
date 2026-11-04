'use client';

import { stickersForTheme } from '@/lib/face/stickerCatalog';
import { ThemeDefinition } from '@/lib/types';

interface FaceStickerControlsProps {
  theme: ThemeDefinition;
  selected: string | null;
  onSelect: (id: string | null) => void;
}

export default function FaceStickerControls({ theme, selected, onSelect }: FaceStickerControlsProps) {
  const { stickers, matched } = stickersForTheme(theme);

  return (
    <div>
      <span className="field-label">Stiker wajah 3D</span>
      <p className="-mt-1 mb-2 text-xs leading-relaxed text-muted">
        Model 3D mengikuti gerak dan arah kepalamu. Yang paling kiri paling cocok dengan frame ini. Semua diproses di perangkatmu, videomu
        tidak dikirim ke server. Pilihan pertama perlu mengunduh sekitar 19 MB.
      </p>
      <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-2 pt-1">
        <button type="button" onClick={() => onSelect(null)} aria-pressed={!selected} className="w-[72px] shrink-0 text-center">
          <span
            className={`flex aspect-square items-center justify-center rounded-lg bg-surface text-xs outline outline-2 outline-offset-2 transition-[outline-color] duration-200 ${
              !selected ? 'outline-fg' : 'outline-transparent'
            }`}
          >
            Tanpa
          </span>
          <span className={`mt-1.5 block text-xs leading-tight ${!selected ? 'font-bold' : 'font-medium'}`}>Tanpa stiker</span>
        </button>
        {stickers.map((sticker, i) => {
          const isActive = selected === sticker.id;
          return (
            <button key={sticker.id} type="button" onClick={() => onSelect(sticker.id)} aria-pressed={isActive} className="w-[72px] shrink-0 text-center">
              <span
                className={`block aspect-square overflow-hidden rounded-lg outline outline-2 outline-offset-2 transition-[outline-color] duration-200 ${
                  isActive ? 'outline-fg' : 'outline-transparent'
                } ${i < matched ? 'bg-[rgb(var(--flash))]' : 'bg-surface'}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/face-stickers/${sticker.id}.png`} alt="" loading="lazy" decoding="async" className="block h-full w-full" />
              </span>
              <span className={`mt-1.5 block text-xs leading-tight ${isActive ? 'font-bold' : 'font-medium'}`}>{sticker.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
