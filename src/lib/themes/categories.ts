export interface ThemeCategory {
  name: string;
  slug: string;
  blurb: string;
  /** Warna panel di beranda dan pita judul di halaman frame. */
  color: string;
  ink: string;
  /** Font judul kategori. */
  font: string;
  /** Tiga frame yang tampil di panel beranda. */
  showcase: [string, string, string];
}

export const THEME_CATEGORIES: ThemeCategory[] = [
  {
    name: 'Imut & Girly',
    slug: 'imut-girly',
    blurb: 'Pita, telinga kucing, stroberi, dan kupu-kupu pastel.',
    color: '#FFB3D1',
    ink: '#4A0D2B',
    font: 'Pacifico, cursive',
    showcase: ['pita-pink', 'kucing-manis', 'kupu-lilac'],
  },
  {
    name: 'Lucu & Kocak',
    slug: 'lucu-kocak',
    blurb: 'Kucing oren, dino, bebek, dan jajanan buat foto bareng teman.',
    color: '#FFD84D',
    ink: '#2E1C00',
    font: 'Fredoka, sans-serif',
    showcase: ['kucing-oren', 'dino-hijau', 'jajan-pasar'],
  },
  {
    name: 'Karakter & Komik',
    slug: 'karakter-komik',
    blurb: 'Jaring, ledakan POW, ninja, dan penyihir kecil.',
    color: '#E0162F',
    ink: '#FFFFFF',
    font: 'Bangers, sans-serif',
    showcase: ['jaring-merah', 'komik-pow', 'penyihir-kecil'],
  },
  {
    name: 'Indonesia',
    slug: 'indonesia',
    blurb: 'Batik, tujuh belasan, Lebaran, dan Imlek.',
    color: '#6B3A1C',
    ink: '#F8E8CE',
    font: '"Instrument Serif", serif',
    showcase: ['batik-kawung', 'merah-putih', 'lebaran'],
  },
  {
    name: 'Pesta',
    slug: 'pesta',
    blurb: 'Ulang tahun, wisuda, Natal, Halloween, dan tahun baru.',
    color: '#27114C',
    ink: '#FFE27A',
    font: 'Pacifico, cursive',
    showcase: ['ulang-tahun', 'kembang-api', 'wisuda'],
  },
  {
    name: 'Game & Retro',
    slug: 'game-retro',
    blurb: 'Pixel, konsol saku, disko, dan neon 80-an.',
    color: '#3A1C9C',
    ink: '#7DF9FF',
    font: '"Press Start 2P", monospace',
    showcase: ['pixel-arcade', 'konsol-saku', 'sunset-80'],
  },
  {
    name: 'Alam',
    slug: 'alam',
    blurb: 'Sakura, pantai, daun tropis, sampai luar angkasa.',
    color: '#0F6B4C',
    ink: '#E9FBD9',
    font: '"Instrument Serif", serif',
    showcase: ['sakura', 'pantai', 'daun-tropis'],
  },
  {
    name: 'Scrapbook',
    slug: 'scrapbook',
    blurb: 'Papan gabus, buku catatan, dan surat cinta.',
    color: '#D9B48A',
    ink: '#3A2412',
    font: 'Caveat, cursive',
    showcase: ['papan-gabus', 'surat-cinta', 'buku-catatan'],
  },
  {
    name: 'Film & Korea',
    slug: 'film-korea',
    blurb: 'Strip ala studio Seoul, roll film, dan hitam putih.',
    color: '#111111',
    ink: '#F4F1EA',
    font: '"Instrument Serif", serif',
    showcase: ['kafe-seoul', 'korean-haru', 'bw-noir'],
  },
];
