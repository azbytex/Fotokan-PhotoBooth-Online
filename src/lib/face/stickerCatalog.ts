import { DecorId, ThemeDefinition } from '../types';

export const FACE_STICKERS: { id: string; name: string }[] = [
  { id: 'bigBow', name: 'Pita Satin' },
  { id: 'catEars', name: 'Kucing' },
  { id: 'bunnyEars', name: 'Kelinci' },
  { id: 'bearEars', name: 'Beruang' },
  { id: 'blush', name: 'Pipi Merona' },
  { id: 'heartGlasses', name: 'Kacamata Hati' },
  { id: 'crown', name: 'Mahkota Emas' },
  { id: 'flowerCrown', name: 'Mahkota Bunga' },
  { id: 'sakuraCrown', name: 'Sakura' },
  { id: 'orangeEars', name: 'Si Oren' },
  { id: 'pandaEars', name: 'Panda' },
  { id: 'frogEyes', name: 'Katak' },
  { id: 'dinoSpikes', name: 'Dino' },
  { id: 'heroMask', name: 'Topeng Pahlawan' },
  { id: 'ninjaBand', name: 'Ikat Ninja' },
  { id: 'wizardHat', name: 'Topi Penyihir' },
  { id: 'peci', name: 'Peci' },
  { id: 'gradCap', name: 'Toga' },
  { id: 'santaHat', name: 'Topi Santa' },
  { id: 'partyHat', name: 'Topi Pesta' },
  { id: 'devilHorns', name: 'Tanduk' },
  { id: 'starGlasses', name: 'Kacamata Bintang' },
  { id: 'pixelGlasses', name: 'Kacamata Pixel' },
  { id: 'sunglasses', name: 'Kacamata Hitam' },
];

const BY_CATEGORY: Record<string, string[]> = {
  'Imut & Girly': ['bigBow', 'catEars', 'bunnyEars', 'blush', 'heartGlasses', 'crown'],
  'Lucu & Kocak': ['orangeEars', 'dinoSpikes', 'frogEyes', 'pandaEars', 'bearEars', 'partyHat'],
  'Karakter & Komik': ['heroMask', 'ninjaBand', 'wizardHat', 'devilHorns', 'sunglasses'],
  Indonesia: ['peci', 'flowerCrown', 'crown', 'blush'],
  Pesta: ['partyHat', 'gradCap', 'santaHat', 'devilHorns', 'crown', 'starGlasses'],
  'Game & Retro': ['pixelGlasses', 'sunglasses', 'starGlasses', 'devilHorns'],
  Alam: ['flowerCrown', 'sakuraCrown', 'sunglasses', 'frogEyes'],
  Scrapbook: ['heartGlasses', 'bigBow', 'blush', 'flowerCrown'],
  'Film & Korea': ['sunglasses', 'blush', 'bigBow', 'crown'],
};

const BY_DECOR: Partial<Record<DecorId, string>> = {
  ribbon: 'bigBow',
  hearts: 'heartGlasses',
  catEars: 'catEars',
  bunnyEars: 'bunnyEars',
  teddy: 'bearEars',
  princess: 'crown',
  glitterStar: 'starGlasses',
  orangeCat: 'orangeEars',
  dino: 'dinoSpikes',
  panda: 'pandaEars',
  frogPond: 'frogEyes',
  webHero: 'heroMask',
  ninja: 'ninjaBand',
  wizard: 'wizardHat',
  merahPutih: 'peci',
  kawung: 'peci',
  parang: 'peci',
  lebaran: 'peci',
  birthday: 'partyHat',
  graduation: 'gradCap',
  christmas: 'santaHat',
  halloween: 'devilHorns',
  pixelArcade: 'pixelGlasses',
  handheld: 'pixelGlasses',
  sakura: 'sakuraCrown',
  beach: 'sunglasses',
  daisyField: 'flowerCrown',
};

/** Stiker yang cocok dengan frame ditaruh paling depan. */
export function stickersForTheme(theme: ThemeDefinition) {
  const first = theme.decor ? BY_DECOR[theme.decor] : undefined;
  const picks = [...(first ? [first] : []), ...(BY_CATEGORY[theme.category] ?? [])];
  const order = Array.from(new Set([...picks, ...FACE_STICKERS.map((s) => s.id)]));
  return {
    matched: Array.from(new Set(picks)).length,
    stickers: order.map((id) => FACE_STICKERS.find((s) => s.id === id)!),
  };
}
