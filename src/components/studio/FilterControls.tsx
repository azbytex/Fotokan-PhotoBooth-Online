'use client';

import { useEffect, useRef, useState } from 'react';
import { FilterOverlay, paintFilterOverlay } from '@/lib/canvas/filterEffects';
import { getSamplePhoto } from '@/lib/canvas/samplePhotos';

interface FilterControlsProps {
  brightness: number;
  setBrightness: (val: number) => void;
  contrast: number;
  setContrast: (val: number) => void;
  saturation: number;
  setSaturation: (val: number) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

export interface FilterPreset {
  id: string;
  name: string;
  group: string;
  css: string;
  overlay?: FilterOverlay;
}

export const FILTER_GROUPS = ['Natural', 'Lucu', 'Efek', 'Film', 'Hitam putih'];

export const FILTER_PRESETS: FilterPreset[] = [
  { id: 'normal', name: 'Warna frame', group: 'Natural', css: 'none' },
  { id: 'asli', name: 'Asli', group: 'Natural', css: 'none' },
  { id: 'cerah', name: 'Cerah', group: 'Natural', css: 'brightness(1.12) saturate(1.08)' },
  { id: 'glowing', name: 'Glowing', group: 'Natural', css: 'brightness(1.1) contrast(0.92) saturate(1.06)' },
  { id: 'warm', name: 'Hangat', group: 'Natural', css: 'sepia(0.3) saturate(1.2) brightness(1.05)' },
  { id: 'sejuk', name: 'Sejuk', group: 'Natural', css: 'brightness(1.04) saturate(0.94) hue-rotate(10deg)' },
  { id: 'vivid', name: 'Pekat', group: 'Natural', css: 'contrast(1.12) saturate(1.42)' },

  { id: 'rose', name: 'Rosé', group: 'Lucu', css: 'brightness(1.06) saturate(1.15) hue-rotate(-10deg)' },
  { id: 'pipi-pink', name: 'Pipi Pink', group: 'Lucu', css: 'brightness(1.08) saturate(1.26) hue-rotate(-14deg) contrast(0.96)' },
  { id: 'susu-stroberi', name: 'Susu Stroberi', group: 'Lucu', css: 'brightness(1.12) contrast(0.88) saturate(1.1) hue-rotate(-8deg)' },
  { id: 'peach', name: 'Peach', group: 'Lucu', css: 'brightness(1.08) sepia(0.2) saturate(1.3) hue-rotate(-12deg)' },
  { id: 'lavender', name: 'Lavender', group: 'Lucu', css: 'brightness(1.08) contrast(0.92) sepia(0.2) hue-rotate(220deg) saturate(1.05)' },
  { id: 'permen-kapas', name: 'Permen Kapas', group: 'Lucu', css: 'brightness(1.12) contrast(0.86) saturate(1.3) hue-rotate(-20deg)' },
  { id: 'mochi', name: 'Mochi', group: 'Lucu', css: 'brightness(1.14) contrast(0.82) saturate(0.92)' },
  { id: 'bubblegum', name: 'Bubblegum', group: 'Lucu', css: 'saturate(1.5) brightness(1.06) hue-rotate(-24deg)' },

  { id: 'hujan-hati', name: 'Hujan Hati', group: 'Efek', css: 'brightness(1.06) saturate(1.14) hue-rotate(-6deg)', overlay: 'hearts' },
  { id: 'kilau', name: 'Kilau', group: 'Efek', css: 'brightness(1.08) contrast(0.96)', overlay: 'sparkles' },
  { id: 'bintang', name: 'Bintang', group: 'Efek', css: 'brightness(1.05) saturate(1.12)', overlay: 'stars' },
  { id: 'bokeh', name: 'Bokeh', group: 'Efek', css: 'brightness(1.05) saturate(1.06)', overlay: 'bokeh' },
  { id: 'kelopak', name: 'Kelopak Sakura', group: 'Efek', css: 'brightness(1.08) saturate(1.06) hue-rotate(-6deg)', overlay: 'petals' },
  { id: 'salju', name: 'Salju', group: 'Efek', css: 'brightness(1.06) saturate(0.92) hue-rotate(6deg)', overlay: 'snow' },
  { id: 'pelangi', name: 'Pelangi', group: 'Efek', css: 'brightness(1.06) saturate(1.12)', overlay: 'rainbow' },
  { id: 'komik', name: 'Komik', group: 'Efek', css: 'contrast(1.42) saturate(1.5)', overlay: 'halftone' },

  { id: 'vintage', name: 'Film 90-an', group: 'Film', css: 'contrast(1.15) brightness(1.05) saturate(1.1) sepia(0.15)' },
  { id: 'kertas-tua', name: 'Kertas Tua', group: 'Film', css: 'sepia(0.34) contrast(0.92) brightness(1.06) saturate(0.86)', overlay: 'grain' },
  { id: 'bocor', name: 'Bocor Cahaya', group: 'Film', css: 'contrast(1.06) saturate(1.12) sepia(0.08)', overlay: 'leak' },
  { id: 'butiran', name: 'Butiran Film', group: 'Film', css: 'contrast(1.1) saturate(0.94) sepia(0.08)', overlay: 'grain' },
  { id: 'senja', name: 'Senja', group: 'Film', css: 'sepia(0.28) saturate(1.42) hue-rotate(-14deg) contrast(1.05)' },
  { id: 'daun-pudar', name: 'Daun Pudar', group: 'Film', css: 'contrast(0.92) brightness(1.06) saturate(0.84) hue-rotate(18deg)' },
  { id: 'kopi-susu', name: 'Kopi Susu', group: 'Film', css: 'sepia(0.42) contrast(0.96) brightness(1.03) saturate(0.92)' },
  { id: 'cyan', name: 'Biru Tua', group: 'Film', css: 'sepia(0.5) hue-rotate(165deg) saturate(0.9)' },
  { id: 'cyber', name: 'Neon', group: 'Film', css: 'contrast(1.25) brightness(1.1) saturate(1.3) hue-rotate(15deg)', overlay: 'vignette' },

  { id: 'noir', name: 'Hitam putih', group: 'Hitam putih', css: 'grayscale(1) contrast(1.2)' },
  { id: 'noir-keras', name: 'Noir', group: 'Hitam putih', css: 'grayscale(1) contrast(1.5) brightness(0.96)', overlay: 'vignette' },
  { id: 'perak', name: 'Perak', group: 'Hitam putih', css: 'grayscale(1) contrast(0.9) brightness(1.1)' },
  { id: 'koran', name: 'Koran', group: 'Hitam putih', css: 'grayscale(1) contrast(1.3)', overlay: 'halftone' },
  { id: 'sepia', name: 'Sepia', group: 'Hitam putih', css: 'grayscale(1) sepia(0.72) contrast(1.06)' },
];

/** Filter pilihan pengguna menggantikan warna bawaan frame. */
export function resolveFilterCss(filterId: string, themeFilterCss: string) {
  if (filterId === 'normal') return themeFilterCss;
  return FILTER_PRESETS.find((f) => f.id === filterId)?.css ?? themeFilterCss;
}

export function resolveFilterOverlay(filterId: string) {
  return FILTER_PRESETS.find((f) => f.id === filterId)?.overlay;
}

/** Lapisan hiasan filter. Sekali gambar lalu diam, jadi tidak membebani video. */
export function OverlayLayer({ overlay, className = '' }: { overlay: FilterOverlay; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    canvas.width = Math.max(1, Math.min(960, canvas.offsetWidth * Math.min(window.devicePixelRatio || 1, 2)));
    canvas.height = Math.round(canvas.width * 0.75);
    const ctx = canvas.getContext('2d');
    if (ctx) paintFilterOverlay(overlay, ctx, canvas.width, canvas.height);
  }, [overlay]);

  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}

function Slider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 flex justify-between">
        <span>{label}</span>
        <span className="tabular-nums text-muted">{value}%</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer"
      />
    </label>
  );
}

export default function FilterControls({
  brightness,
  setBrightness,
  contrast,
  setContrast,
  saturation,
  setSaturation,
  activeFilter,
  setActiveFilter,
}: FilterControlsProps) {
  const [group, setGroup] = useState(FILTER_PRESETS.find((f) => f.id === activeFilter)?.group ?? FILTER_GROUPS[0]);

  return (
    <div>
      <span className="field-label">Filter</span>
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-2">
        {FILTER_GROUPS.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setGroup(name)}
            aria-pressed={group === name}
            className={`chip ${group === name ? 'chip-on' : ''}`}
          >
            {name}
          </button>
        ))}
      </div>

      <div key={group} className="page-fade -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-2 pt-1">
        {FILTER_PRESETS.filter((filter) => filter.group === group).map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              aria-pressed={isActive}
              className="w-[72px] shrink-0 text-center"
            >
              <span
                className={`relative block aspect-[4/5] overflow-hidden rounded-lg outline outline-2 outline-offset-2 transition-[outline-color] duration-200 ${
                  isActive ? 'outline-fg' : 'outline-transparent'
                }`}
              >
                <img
                  src={getSamplePhoto(1)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  style={{ filter: filter.css === 'none' ? undefined : filter.css }}
                  className="h-full w-full object-cover"
                />
                {filter.overlay && <OverlayLayer overlay={filter.overlay} />}
              </span>
              <span className={`mt-1.5 block text-xs leading-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {filter.name}
              </span>
            </button>
          );
        })}
      </div>

      <details className="mt-2">
        <summary className="text-sm font-medium">Atur kecerahan dan warna</summary>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <Slider label="Kecerahan" value={brightness} min={60} max={140} onChange={setBrightness} />
          <Slider label="Kontras" value={contrast} min={60} max={140} onChange={setContrast} />
          <Slider label="Saturasi" value={saturation} min={0} max={160} onChange={setSaturation} />
        </div>
      </details>
    </div>
  );
}
