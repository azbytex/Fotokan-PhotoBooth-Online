'use client';

import { useEffect, useState } from 'react';
import StripPreview from '@/components/studio/StripPreview';
import { getThemeById, getThemesInCategory, THEME_CATEGORIES } from '@/lib/themes/themeCatalog';
import { ThemeDefinition } from '@/lib/types';

interface ThemePickerProps {
  selectedId: string;
  onSelect: (theme: ThemeDefinition) => void;
}

export default function ThemePicker({ selectedId, onSelect }: ThemePickerProps) {
  const selectedCategory = getThemeById(selectedId).category;
  const [category, setCategory] = useState(selectedCategory);

  // Frame bisa berganti dari luar, misalnya saat host room memuat pilihannya.
  useEffect(() => setCategory(selectedCategory), [selectedCategory]);

  return (
    <div>
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-3">
        {THEME_CATEGORIES.map(({ name }) => (
          <button
            key={name}
            type="button"
            onClick={() => setCategory(name)}
            aria-pressed={category === name}
            className={`chip ${category === name ? 'chip-on' : ''}`}
          >
            {name}
          </button>
        ))}
      </div>

      <div key={category} className="page-fade -mx-1 grid max-h-[560px] grid-cols-3 gap-x-3 gap-y-5 overflow-y-auto px-1 py-1 sm:grid-cols-4 lg:grid-cols-5">
        {getThemesInCategory(category).map((theme, i) => {
          const isActive = selectedId === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onSelect(theme)}
              aria-pressed={isActive}
              className="group text-left"
            >
              <span
                className={`block overflow-hidden rounded-md outline outline-2 outline-offset-2 transition-[outline-color,transform] duration-200 group-hover:-translate-y-0.5 ${
                  isActive ? 'outline-fg' : 'outline-transparent'
                }`}
              >
                <StripPreview theme={theme} offset={i} />
              </span>
              <span className={`mt-2 block text-xs leading-snug ${isActive ? 'font-bold' : 'font-medium'}`}>
                {theme.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
