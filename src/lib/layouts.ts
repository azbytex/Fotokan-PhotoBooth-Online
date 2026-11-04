import { LayoutType } from './types';

const SLOTS: Partial<Record<LayoutType, number>> = {
  '1-cut': 1,
  '2-cut': 2,
  '3-cut': 3,
  '6-cut': 6,
  grid: 6,
};

/**
 * Jumlah foto yang perlu diambil tiap orang.
 * Saat berdua, layout bersebelahan dan dua strip memakai 4 foto per orang,
 * sedangkan layout lain berbagi slot secara bergantian.
 */
export function photosNeeded(layout: LayoutType, isDuo = false) {
  const slots = SLOTS[layout] ?? 4;
  if (!isDuo || layout === 'duo-split' || layout === 'duo-double') return slots;
  return Math.ceil(slots / 2);
}
