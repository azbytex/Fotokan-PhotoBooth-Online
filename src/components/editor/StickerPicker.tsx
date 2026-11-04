'use client';

import { Trash2, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { PlacedSticker } from '@/lib/types';

interface StickerPickerProps {
  onAddSticker: (symbol: string) => void;
  placedStickers: PlacedSticker[];
  onRemoveSticker: (id: string) => void;
  onClearStickers: () => void;
  onUpdateStickerScale: (id: string, delta: number) => void;
  onRotateSticker: (id: string) => void;
  activeThemeStickers?: string[];
}

const COMMON_STICKERS = [
  '💖', '✨', '🧸', '🐰', '🎀', '🌸', '☁️', '🫧', '🍒', '🍓', '🧁', '🌷',
  '🎞️', '⭐', '✌️', '🕶️', '🏷️', '🍾', '🥂', '🎉', '👑', '🕊️', '💿', '🦋',
  '❤️', '🫶', '🔥', '🪄', '🍭', '☕', '🌻', '🌙', '🎬', '📸', '⚡', '🖤',
];

const iconButton = 'rounded-md p-2 text-muted hover:bg-surface hover:text-fg';

export default function StickerPicker({
  onAddSticker,
  placedStickers,
  onRemoveSticker,
  onClearStickers,
  onUpdateStickerScale,
  onRotateSticker,
  activeThemeStickers = [],
}: StickerPickerProps) {
  const combined = Array.from(new Set([...activeThemeStickers, ...COMMON_STICKERS]));

  return (
    <div className="space-y-6">
      <div>
        <p className="field-label">Klik stiker untuk menambahkannya, lalu geser langsung di strip</p>
        <div className="grid grid-cols-6 gap-1 sm:grid-cols-10">
          {combined.map((symbol) => (
            <button
              key={symbol}
              type="button"
              onClick={() => onAddSticker(symbol)}
              aria-label={`Tambah stiker ${symbol}`}
              className="flex h-11 items-center justify-center rounded-lg text-2xl hover:bg-surface"
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>

      {placedStickers.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Terpasang</span>
            <button type="button" onClick={onClearStickers} className="text-sm font-medium text-brand-text hover:underline">
              Hapus semua
            </button>
          </div>

          <ul className="divide-y divide-line border-y border-line">
            {placedStickers.map((sticker) => (
              <li key={sticker.id} className="flex items-center justify-between py-1.5">
                <span className="text-xl">{sticker.symbol}</span>
                <div className="flex items-center">
                  <button type="button" onClick={() => onUpdateStickerScale(sticker.id, -0.15)} className={iconButton} aria-label="Perkecil" title="Perkecil">
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => onUpdateStickerScale(sticker.id, 0.15)} className={iconButton} aria-label="Perbesar" title="Perbesar">
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => onRotateSticker(sticker.id)} className={iconButton} aria-label="Putar 30 derajat" title="Putar 30°">
                    <RotateCw className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => onRemoveSticker(sticker.id)} className={iconButton} aria-label="Hapus stiker" title="Hapus">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
