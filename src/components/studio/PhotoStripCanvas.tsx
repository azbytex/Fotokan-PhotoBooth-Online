'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { renderPhotoStrip } from '@/lib/canvas/renderer';
import { LayoutType, PlacedSticker, ShotItem, ThemeDefinition } from '@/lib/types';

// Array kosong yang tetap sama, supaya pratinjau tidak digambar ulang di setiap render halaman.
const NO_SHOTS: ShotItem[] = [];
const NO_STICKERS: PlacedSticker[] = [];
const PREVIEW_SCALE = 1.5;
// Ukuran stiker di renderer adalah 42 × skala, dalam satuan lebar strip.
const STICKER_SIZE = 42;

interface PhotoStripCanvasProps {
  theme: ThemeDefinition;
  layout: LayoutType;
  shots: ShotItem[];
  peerShots?: ShotItem[];
  stickers?: PlacedSticker[];
  /** Kalau diisi, stiker bisa digeser langsung di pratinjau. Posisi dalam persen. */
  onMoveSticker?: (id: string, x: number, y: number) => void;
  customCaption?: string;
  customDate?: string;
  watermark?: boolean;
  hostName?: string;
  peerName?: string;
}

interface StickerDrag {
  sticker: PlacedSticker;
  x: number;
  y: number;
  fontSize: number;
}

/** Pratinjau strip selama sesi. Unduhan ada di halaman hasil. */
export default function PhotoStripCanvas({
  theme,
  layout,
  shots,
  peerShots = NO_SHOTS,
  stickers = NO_STICKERS,
  onMoveSticker,
  customCaption,
  customDate,
  watermark = true,
  hostName,
  peerName,
}: PhotoStripCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drag, setDrag] = useState<StickerDrag | null>(null);
  const draggingId = drag?.sticker.id;

  // Stiker yang digeser mengikuti jari sebagai elemen biasa, jadi strip tidak perlu digambar ulang di setiap gerakan.
  const drawnStickers = useMemo(
    () => (draggingId ? stickers.filter((sticker) => sticker.id !== draggingId) : stickers),
    [stickers, draggingId]
  );

  useEffect(() => {
    let isLatest = true;
    const offscreen = document.createElement('canvas');
    renderPhotoStrip(offscreen, {
      theme,
      layout,
      shots,
      peerShots,
      stickers: drawnStickers,
      customCaption,
      customDate,
      watermark,
      hostName,
      peerName,
      scale: PREVIEW_SCALE,
    }).then(() => {
      const canvas = canvasRef.current;
      if (!isLatest || !canvas) return;
      canvas.width = offscreen.width;
      canvas.height = offscreen.height;
      canvas.getContext('2d')?.drawImage(offscreen, 0, 0);
    });
    return () => {
      isLatest = false;
    };
  }, [theme, layout, shots, peerShots, drawnStickers, customCaption, customDate, watermark, hostName, peerName]);

  const pointerPosition = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(100, ((event.clientX - box.left) / box.width) * 100)),
      y: Math.max(0, Math.min(100, ((event.clientY - box.top) / box.height) * 100)),
      box,
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    if (!onMoveSticker || !canvas.width) return;
    const { x, y, box } = pointerPosition(event);
    const baseWidth = canvas.width / PREVIEW_SCALE;
    const baseHeight = canvas.height / PREVIEW_SCALE;
    // Stiker paling atas digambar terakhir, jadi dicari dari belakang.
    const hit = [...stickers].reverse().find((sticker) => {
      const dx = ((x - sticker.x) / 100) * baseWidth;
      const dy = ((y - sticker.y) / 100) * baseHeight;
      return Math.hypot(dx, dy) <= (STICKER_SIZE * sticker.scale) / 2 + 10;
    });
    if (!hit) return;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    setDrag({ sticker: hit, x, y, fontSize: STICKER_SIZE * hit.scale * (box.width / baseWidth) });
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drag) return;
    const { x, y } = pointerPosition(event);
    setDrag({ ...drag, x, y });
  };

  const finishDrag = () => {
    if (!drag) return;
    onMoveSticker?.(drag.sticker.id, drag.x, drag.y);
    setDrag(null);
  };

  return (
    <div className="mx-auto w-full max-w-[320px]">
      <div className="flex justify-center rounded-xl bg-surface p-4">
        <div className="relative flex max-w-full">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={`Pratinjau strip foto dengan frame ${theme.name}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishDrag}
            onPointerCancel={() => setDrag(null)}
            style={onMoveSticker && stickers.length ? { touchAction: 'none', cursor: drag ? 'grabbing' : 'grab' } : undefined}
            className="h-auto max-h-[68vh] max-w-full shadow-md"
          />
          {drag && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute select-none leading-none"
              style={{
                left: `${drag.x}%`,
                top: `${drag.y}%`,
                fontSize: drag.fontSize,
                transform: `translate(-50%, -50%) rotate(${drag.sticker.rotation}deg)`,
              }}
            >
              {drag.sticker.symbol}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
