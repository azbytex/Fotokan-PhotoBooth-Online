'use client';

import { useEffect, useRef, useState } from 'react';
import { renderPhotoStrip } from '@/lib/canvas/renderer';
import { getSamplePhoto } from '@/lib/canvas/samplePhotos';
import { LayoutType, ShotItem, ThemeDefinition } from '@/lib/types';

const sampleShots = (offset: number): ShotItem[] =>
  [0, 1, 2, 3].map((i) => ({
    id: `sample-${offset + i}`,
    dataUrl: getSamplePhoto(offset + i),
    timestamp: 0,
  }));

// Hasil gambar disimpan sebagai file JPEG di memori. Strip yang sama tidak digambar dua kali,
// dan browser menangani <img> jauh lebih ringan daripada puluhan canvas saat scroll.
const finished = new Map<string, Promise<string>>();
const waiting: (() => Promise<unknown>)[] = [];
let isWorking = false;

function whenIdle(run: () => void) {
  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 400 });
  else setTimeout(run, 30);
}

function pump() {
  if (isWorking) return;
  // Yang terakhir diminta adalah yang paling dekat dengan posisi scroll sekarang.
  const job = waiting.pop();
  if (!job) return;
  isWorking = true;
  whenIdle(() => {
    job().finally(() => {
      isWorking = false;
      pump();
    });
  });
}

function requestStrip(theme: ThemeDefinition, layout: LayoutType, offset: number, scale: number) {
  const key = `${theme.id}|${layout}|${offset % 6}|${scale}`;
  const existing = finished.get(key);
  if (existing) return existing;

  const pending = new Promise<string>((resolve) => {
    waiting.push(async () => {
      const canvas = document.createElement('canvas');
      await renderPhotoStrip(canvas, {
        theme,
        layout,
        shots: sampleShots(offset),
        peerShots: layout.startsWith('duo-') ? sampleShots(offset + 3) : [],
        hostName: 'Kamu',
        peerName: 'Teman',
        scale,
      });
      await new Promise<void>((done) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(URL.createObjectURL(blob));
            done();
          },
          'image/jpeg',
          0.88
        );
      });
    });
    pump();
  });
  finished.set(key, pending);
  return pending;
}

interface StripPreviewProps {
  theme: ThemeDefinition;
  layout?: LayoutType;
  offset?: number;
  className?: string;
}

/** Contoh strip memakai foto contoh, digambar oleh renderer yang sama dengan hasil asli. */
export default function StripPreview({ theme, layout = '4-cut', offset = 0, className = '' }: StripPreviewProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const baseWidth = layout === 'duo-double' ? 1150 : 600;

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    let isCurrent = true;
    setIsLoaded(false);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const pixels = box.offsetWidth * Math.min(window.devicePixelRatio || 1, 2);
        const scale = Math.min(1.2, Math.max(0.2, Math.ceil((pixels / baseWidth) * 10) / 10));
        requestStrip(theme, layout, offset, scale).then((url) => {
          if (isCurrent) setSrc(url);
        });
      },
      { rootMargin: '700px' }
    );
    observer.observe(box);
    return () => {
      isCurrent = false;
      observer.disconnect();
    };
  }, [theme, layout, offset, baseWidth]);

  return (
    <div
      ref={boxRef}
      style={{ aspectRatio: layout === 'duo-double' ? '1150 / 1800' : '600 / 1800', backgroundColor: theme.bgColor }}
      className={`block w-full ${className}`}
    >
      {src && (
        <img
          src={src}
          alt={`Contoh strip foto dengan frame ${theme.name}`}
          decoding="async"
          draggable={false}
          onLoad={() => setIsLoaded(true)}
          className={`block h-full w-full transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
}
