'use client';

import { photosNeeded } from '@/lib/layouts';
import { LayoutType } from '@/lib/types';

interface LayoutSelectorProps {
  layout: LayoutType;
  setLayout: (l: LayoutType) => void;
  isMultiplayer?: boolean;
  /** Foto yang sudah ada per orang. Layout yang butuh lebih banyak tidak ditawarkan. */
  availablePhotos?: number;
}

const SOLO_LAYOUTS: { id: LayoutType; label: string; desc: string }[] = [
  { id: '4-cut', label: 'Strip 4 foto', desc: 'Strip klasik' },
  { id: '3-cut', label: 'Strip 3 foto', desc: 'Lebih pendek' },
  { id: '2-cut', label: 'Strip 2 foto', desc: 'Foto lebih besar' },
  { id: '6-cut', label: 'Strip 6 foto', desc: 'Paling panjang' },
  { id: '2x2', label: 'Kolase 2 × 2', desc: '4 foto, hampir persegi' },
  { id: 'grid', label: 'Kolase 2 × 3', desc: '6 foto' },
];

const DUO_LAYOUTS: { id: LayoutType; label: string; desc: string }[] = [
  { id: 'duo-split', label: 'Bersebelahan', desc: 'Tiap frame terbagi dua, kamu di kiri dan temanmu di kanan' },
  { id: 'duo-alternating', label: 'Bergantian', desc: 'Foto kamu dan temanmu berselang-seling, masing-masing 2 foto' },
  { id: 'duo-double', label: 'Dua strip', desc: 'Dua strip 4 foto berdampingan' },
  { id: '4-cut', label: 'Strip 4 foto', desc: 'Strip klasik, masing-masing 2 foto' },
  { id: '2x2', label: 'Kolase 2 × 2', desc: 'Hampir persegi, masing-masing 2 foto' },
];

export default function LayoutSelector({ layout, setLayout, isMultiplayer = false, availablePhotos }: LayoutSelectorProps) {
  const all = isMultiplayer ? DUO_LAYOUTS : SOLO_LAYOUTS;
  const list = availablePhotos === undefined ? all : all.filter((item) => photosNeeded(item.id, isMultiplayer) <= availablePhotos);

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {list.map((item) => {
        const active = layout === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setLayout(item.id)}
            aria-pressed={active}
            className={`option p-2.5 ${active ? 'option-on' : ''}`}
          >
            <span className="block text-sm font-semibold">{item.label}</span>
            <span className="mt-0.5 block text-xs leading-snug text-muted">{item.desc}</span>
          </button>
        );
      })}
    </div>
  );
}
