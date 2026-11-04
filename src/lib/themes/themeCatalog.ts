import { ThemeDefinition } from '../types';
import { EXTRA_THEMES } from './extraThemes';
import { THEME_CATEGORIES } from './categories';

export { THEME_CATEGORIES } from './categories';

const BASE_THEMES: ThemeDefinition[] = [
  {
    "id": "jaring-merah",
    "name": "Jaring Merah",
    "category": "Karakter & Komik",
    "description": "Merah dan biru penuh jaring, lengkap dengan laba-laba yang menggantung di sudut.",
    "bgColor": "#C8102E",
    "inkColor": "#FFFFFF",
    "accentColor": "#12307A",
    "filterCss": "contrast(1.08) saturate(1.12)",
    "frameStyle": "modern",
    "decor": "webHero",
    "frameInset": 46,
    "photoBorder": {
      "color": "#111111",
      "width": 4
    },
    "plateColor": "rgba(12,28,84,0.92)",
    "captionFont": "36px Bangers",
    "badgeText": "SELAMATKAN KOTA",
    "stickers": [
      "🕷️",
      "🕸️",
      "💥",
      "⚡",
      "🦸",
      "🏙️"
    ]
  },
  {
    "id": "komik-pow",
    "name": "Komik Pow",
    "category": "Karakter & Komik",
    "description": "Halaman komik kuning dengan titik halftone dan ledakan POW di atas foto.",
    "bgColor": "#FFD400",
    "inkColor": "#111111",
    "accentColor": "#E8112D",
    "filterCss": "contrast(1.18) saturate(1.3)",
    "frameStyle": "modern",
    "decor": "comicPow",
    "frameInset": 46,
    "photoBorder": {
      "color": "#111111",
      "width": 6
    },
    "plateColor": "#FFFFFF",
    "captionFont": "40px Bangers",
    "badgeText": "EDISI SPESIAL",
    "stickers": [
      "💥",
      "⚡",
      "💬",
      "🦸",
      "⭐",
      "🔥"
    ]
  },
  {
    "id": "kota-malam",
    "name": "Kota Malam",
    "category": "Karakter & Komik",
    "description": "Gedung-gedung gelap, bulan penuh, dan sorot lampu untuk pahlawan malam.",
    "bgColor": "#0B1233",
    "inkColor": "#FFFFFF",
    "accentColor": "#FFD65C",
    "filterCss": "contrast(1.14) brightness(0.98) saturate(0.92)",
    "frameStyle": "modern",
    "decor": "nightCity",
    "frameInset": 46,
    "photoBorder": {
      "color": "#FFD65C",
      "width": 3
    },
    "plateColor": "rgba(6,9,25,0.86)",
    "captionFont": "36px Bangers",
    "badgeText": "PATROLI MALAM",
    "stickers": [
      "🌙",
      "🦇",
      "🌃",
      "⚡",
      "🦸",
      "⭐"
    ]
  },
  {
    "id": "merah-putih",
    "name": "Merah Putih",
    "category": "Indonesia",
    "description": "Bendera kecil di atas dan pinggiran merah, pas untuk tujuh belasan.",
    "bgColor": "#FFFFFF",
    "inkColor": "#B80F1A",
    "accentColor": "#D0121F",
    "filterCss": "contrast(1.05) saturate(1.1)",
    "frameStyle": "modern",
    "decor": "merahPutih",
    "frameInset": 58,
    "photoRadius": 10,
    "plateColor": "#FFFFFF",
    "captionFont": "36px Bangers",
    "badgeText": "MERDEKA",
    "stickers": [
      "🇮🇩",
      "🎉",
      "⭐",
      "🏆",
      "🎈",
      "🦅"
    ]
  },
  {
    "id": "batik-kawung",
    "name": "Batik Kawung",
    "category": "Indonesia",
    "description": "Motif kawung cokelat dan emas, cocok untuk acara keluarga dan wisuda.",
    "bgColor": "#3F2412",
    "inkColor": "#F6E7CF",
    "accentColor": "#B9863F",
    "filterCss": "sepia(0.14) contrast(1.05) saturate(1.05)",
    "frameStyle": "classic",
    "decor": "kawung",
    "frameInset": 48,
    "photoBorder": {
      "color": "#E6C27C",
      "width": 4
    },
    "plateColor": "#3F2412",
    "badgeText": "BATIK KAWUNG",
    "stickers": [
      "🌺",
      "🪷",
      "🎓",
      "✨",
      "🌾",
      "🥥"
    ]
  },
  {
    "id": "bingkai-emas",
    "name": "Bingkai Emas",
    "category": "Pesta",
    "description": "Bingkai emas berlapis dengan sudut melengkung, untuk pernikahan dan gala.",
    "bgColor": "#1D1409",
    "inkColor": "#F4D98B",
    "accentColor": "#B9872F",
    "filterCss": "sepia(0.1) contrast(1.06) brightness(1.03)",
    "frameStyle": "classic",
    "decor": "goldOrnate",
    "frameInset": 52,
    "photoBorder": {
      "color": "#E8C873",
      "width": 3
    },
    "badgeText": "EXCLUSIVE",
    "stickers": [
      "👑",
      "🥂",
      "💍",
      "✨",
      "🕊️",
      "🌹"
    ]
  },
  {
    "id": "ulang-tahun",
    "name": "Ulang Tahun",
    "category": "Pesta",
    "description": "Konfeti warna-warni dan balon di setiap sudut atas.",
    "bgColor": "#FFF3C9",
    "inkColor": "#C2185B",
    "accentColor": "#FF5C8A",
    "filterCss": "brightness(1.05) saturate(1.2)",
    "frameStyle": "cute",
    "decor": "birthday",
    "frameInset": 50,
    "photoRadius": 18,
    "photoBorder": {
      "color": "#FFFFFF",
      "width": 6
    },
    "plateColor": "#FFF3C9",
    "captionFont": "36px Pacifico",
    "badgeText": "HAPPY BIRTHDAY",
    "stickers": [
      "🎂",
      "🎈",
      "🎉",
      "🎁",
      "🥳",
      "🍰"
    ]
  },
  {
    "id": "pixel-arcade",
    "name": "Pixel Arcade",
    "category": "Game & Retro",
    "description": "Tiga nyawa, koin, dan alien pixel di latar game lawas.",
    "bgColor": "#25175C",
    "inkColor": "#FFFFFF",
    "accentColor": "#FF4F9A",
    "filterCss": "contrast(1.14) saturate(1.28)",
    "frameStyle": "modern",
    "decor": "pixelArcade",
    "frameInset": 50,
    "photoBorder": {
      "color": "#62E8FF",
      "width": 5
    },
    "plateColor": "#25175C",
    "captionFont": "22px \"Press Start 2P\"",
    "badgeText": "PLAYER 2 READY",
    "stickers": [
      "👾",
      "🕹️",
      "🎮",
      "❤️",
      "🪙",
      "⭐"
    ]
  },
  {
    "id": "sunset-80",
    "name": "Sunset 80-an",
    "category": "Game & Retro",
    "description": "Matahari besar dan garis neon ala poster synthwave.",
    "bgColor": "#2A0E5E",
    "inkColor": "#FFFFFF",
    "accentColor": "#FF3D81",
    "filterCss": "contrast(1.1) saturate(1.3) hue-rotate(-6deg)",
    "frameStyle": "modern",
    "decor": "retroSunset",
    "frameInset": 46,
    "photoRadius": 8,
    "photoBorder": {
      "color": "#FFFFFF",
      "width": 3
    },
    "plateColor": "rgba(42,14,94,0.78)",
    "captionFont": "36px Pacifico",
    "badgeText": "SUMMER 1986",
    "stickers": [
      "🌴",
      "🕶️",
      "📼",
      "🌅",
      "🛹",
      "💜"
    ]
  },
  {
    "id": "checker-y2k",
    "name": "Checker",
    "category": "Game & Retro",
    "description": "Kotak hitam putih penuh, tegas seperti sepatu slip-on.",
    "bgColor": "#FFFFFF",
    "inkColor": "#111111",
    "accentColor": "#111111",
    "filterCss": "grayscale(0.25) contrast(1.15)",
    "frameStyle": "modern",
    "decor": "checker",
    "frameInset": 44,
    "photoBorder": {
      "color": "#FFFFFF",
      "width": 6
    },
    "plateColor": "#FFFFFF",
    "badgeText": "OFF THE GRID",
    "stickers": [
      "🛹",
      "🖤",
      "🤍",
      "⚡",
      "🎧",
      "🕶️"
    ]
  },
  {
    "id": "bunga-kering",
    "name": "Bunga Kering",
    "category": "Alam",
    "description": "Rangkaian bunga di empat sudut, di atas kertas krem yang lembut.",
    "bgColor": "#FBF5EA",
    "inkColor": "#5B4636",
    "accentColor": "#D98F6C",
    "filterCss": "brightness(1.04) saturate(0.96) sepia(0.08)",
    "frameStyle": "classic",
    "decor": "pressedFloral",
    "frameInset": 56,
    "photoRadius": 6,
    "plateColor": "#FBF5EA",
    "badgeText": "FLORAL",
    "stickers": [
      "🌸",
      "🌷",
      "🌿",
      "🦋",
      "🌼",
      "🍃"
    ]
  },
  {
    "id": "daun-tropis",
    "name": "Daun Tropis",
    "category": "Alam",
    "description": "Daun lebat dan bunga kecil, seperti berfoto di tengah hutan.",
    "bgColor": "#0D3B2C",
    "inkColor": "#F1F7E9",
    "accentColor": "#2FA56F",
    "filterCss": "contrast(1.06) saturate(1.16)",
    "frameStyle": "modern",
    "decor": "tropical",
    "frameInset": 50,
    "photoRadius": 12,
    "plateColor": "#0D3B2C",
    "badgeText": "INTO THE WILD",
    "stickers": [
      "🌿",
      "🦜",
      "🌺",
      "🍃",
      "🐒",
      "🦋"
    ]
  },
  {
    "id": "langit-cerah",
    "name": "Langit Cerah",
    "category": "Alam",
    "description": "Biru langit dengan awan tebal yang mengintip dari balik foto.",
    "bgColor": "#BFE3FF",
    "inkColor": "#124B74",
    "accentColor": "#6EC3FF",
    "filterCss": "brightness(1.06) saturate(1.1)",
    "frameStyle": "cute",
    "decor": "sky",
    "frameInset": 50,
    "photoRadius": 24,
    "photoBorder": {
      "color": "#FFFFFF",
      "width": 6
    },
    "plateColor": "rgba(255,255,255,0.75)",
    "captionFont": "36px Pacifico",
    "badgeText": "CLOUD NINE",
    "stickers": [
      "☁️",
      "🌈",
      "☀️",
      "🪁",
      "🕊️",
      "✈️"
    ]
  },
  {
    "id": "galaksi",
    "name": "Galaksi",
    "category": "Alam",
    "description": "Bintang, nebula, dan planet bercincin di luar angkasa.",
    "bgColor": "#0A0626",
    "inkColor": "#FFFFFF",
    "accentColor": "#FF46AA",
    "filterCss": "contrast(1.14) saturate(1.2)",
    "frameStyle": "modern",
    "decor": "galaxy",
    "frameInset": 48,
    "photoRadius": 10,
    "photoBorder": {
      "color": "rgba(255,255,255,0.75)",
      "width": 2
    },
    "badgeText": "ORBIT 2026",
    "stickers": [
      "🪐",
      "🌟",
      "👽",
      "🚀",
      "🌙",
      "☄️"
    ]
  },
  {
    "id": "papan-gabus",
    "name": "Papan Gabus",
    "category": "Scrapbook",
    "description": "Foto ditempel dengan selotip dan paku payung di papan gabus.",
    "bgColor": "#C29461",
    "inkColor": "#3A2412",
    "accentColor": "#E2342F",
    "filterCss": "sepia(0.1) contrast(1.05) saturate(1.05)",
    "frameStyle": "polaroid",
    "decor": "corkboard",
    "frameInset": 48,
    "photoBorder": {
      "color": "#FFFFFF",
      "width": 9
    },
    "plateColor": "#FFF8E7",
    "captionFont": "36px Pacifico",
    "badgeText": "KENANGAN",
    "stickers": [
      "📌",
      "📎",
      "✂️",
      "💌",
      "📝",
      "⭐"
    ]
  },
  {
    "id": "piknik",
    "name": "Piknik",
    "category": "Scrapbook",
    "description": "Kain kotak-kotak merah untuk sore santai bersama teman.",
    "bgColor": "#FFFFFF",
    "inkColor": "#A5161F",
    "accentColor": "#D02030",
    "filterCss": "brightness(1.04) saturate(1.1) sepia(0.06)",
    "frameStyle": "cute",
    "decor": "gingham",
    "frameInset": 48,
    "photoRadius": 18,
    "photoBorder": {
      "color": "#FFFFFF",
      "width": 7
    },
    "plateColor": "#FFFFFF",
    "captionFont": "36px Pacifico",
    "badgeText": "SORE DI TAMAN",
    "stickers": [
      "🍓",
      "🧺",
      "🥪",
      "🌼",
      "🍉",
      "🐝"
    ]
  },
  // 1. Korean Photobooth
  {
    id: 'korean-haru',
    name: 'Haru Film Pastel',
    category: 'Film & Korea',
    description: 'Frame biru muda dan warna foto yang lembut, seperti studio foto di Korea.',
    bgColor: '#E2EEF8',
    inkColor: '#2B4257',
    accentColor: '#6B90B5',
    filterCss: 'brightness(1.06) contrast(0.98) saturate(1.1) hue-rotate(-5deg)',
    frameStyle: 'cute',
    dateStamp: true,
    badgeText: '하루 필름 • HARU FILM',
    stickers: ['☁️', '✨', '🫧', '🤍', '🌸', '💫', '🧸', '🎀'],
  },
  {
    id: 'korean-life4cuts',
    name: 'Life4Cuts Dream',
    category: 'Film & Korea',
    description: 'Frame lavender dengan warna kulit yang lebih cerah.',
    bgColor: '#F4ECF8',
    inkColor: '#4A3B53',
    accentColor: '#C494D9',
    filterCss: 'brightness(1.08) saturate(1.15) contrast(1.02)',
    frameStyle: 'cute',
    dateStamp: true,
    badgeText: '인생네컷 • LIFE FOUR CUTS',
    stickers: ['🐰', '💖', '⭐️', '🌷', '🎀', '🪄', '🍓', '🍭'],
  },

  // 2. Classic Photobooth
  {
    id: 'classic-strip',
    name: 'Classic 1928',
    category: 'Film & Korea',
    description: 'Frame krem, foto sedikit sepia, dan judul serif.',
    bgColor: '#F2EEE7',
    inkColor: '#1B1A18',
    accentColor: '#B8873B',
    filterCss: 'sepia(0.2) contrast(1.08) brightness(1.02)',
    frameStyle: 'classic',
    dateStamp: true,
    badgeText: 'ORIGINAL AUTOMATIC PHOTOBOOTH',
    stickers: ['🎞️', '⭐', '✌️', '🏷️', '✒️', '🥂'],
  },
  {
    id: 'classic-warm-gold',
    name: 'Warm Gold Emulsion',
    category: 'Film & Korea',
    description: 'Kuning madu dengan bayangan hangat, mirip film era 90-an.',
    bgColor: '#EBDCB9',
    inkColor: '#3A2E1C',
    accentColor: '#9E6D24',
    filterCss: 'sepia(0.35) saturate(1.2) contrast(1.06) brightness(1.04)',
    frameStyle: 'classic',
    dateStamp: true,
    badgeText: 'GOLD 200 MEMORIES',
    stickers: ['✨', '🌻', '☕', '🌟', '🍯', '☀️'],
  },

  // 3. Retro & Vintage
  {
    id: 'retro-polaroid',
    name: '90s Polaroid Flash',
    category: 'Game & Retro',
    description: 'Frame putih dan warna kontras ala kamera instan.',
    bgColor: '#FAFAF7',
    inkColor: '#222222',
    accentColor: '#FF6B35',
    filterCss: 'contrast(1.15) brightness(1.05) saturate(1.15) sepia(0.12)',
    frameStyle: 'polaroid',
    dateStamp: true,
    badgeText: 'INSTANT PRINT 600',
    stickers: ['📼', '🛹', '👾', '🔥', '🕶️', '⚡', '🍕'],
  },

  // 4. Y2K
  {
    id: 'y2k-cyber',
    name: 'Cyber Metallic 2000',
    category: 'Game & Retro',
    description: 'Frame perak, garis cyan, dan warna foto yang lebih tajam.',
    bgColor: '#E6EBF0',
    inkColor: '#0E1726',
    accentColor: '#00F0FF',
    filterCss: 'contrast(1.22) brightness(1.08) saturate(1.25) hue-rotate(10deg)',
    frameStyle: 'y2k',
    dateStamp: true,
    badgeText: 'CYBERSTUDIO // Y2K VIBES',
    stickers: ['💿', '🦋', '👽', '🛸', '⚡', '💖', '🎧', '💫', '🔮'],
  },

  // 5. Cute & Pastel
  {
    id: 'cute-strawberry',
    decor: 'strawberryMilk',
    frameInset: 54,
    photoRadius: 18,
    photoBorder: { color: '#FFFFFF', width: 6 },
    plateColor: '#FFF4F7',
    captionFont: '36px Pacifico',
    name: 'Strawberry Milk',
    category: 'Imut & Girly',
    description: 'Frame pink muda dengan garis merah muda di setiap foto.',
    bgColor: '#FFEAEF',
    inkColor: '#5C2D37',
    accentColor: '#E25B78',
    filterCss: 'brightness(1.07) saturate(1.2) hue-rotate(-8deg)',
    frameStyle: 'cute',
    dateStamp: true,
    badgeText: 'SWEET STRAWBERRY MOMENT',
    stickers: ['🍓', '🧁', '🧸', '🎀', '💌', '🌸', '🍒', '💕'],
  },

  // 6. Minimalist
  {
    id: 'minimalist-swiss',
    name: 'Swiss Editorial',
    category: 'Film & Korea',
    description: 'Frame putih polos tanpa hiasan, warna foto sedikit diredam.',
    bgColor: '#FFFFFF',
    inkColor: '#0A0A0A',
    accentColor: '#4A4A4A',
    filterCss: 'contrast(1.1) brightness(1.02) saturate(0.9)',
    frameStyle: 'editorial',
    dateStamp: true,
    badgeText: 'ARCHIVE // ISSUE N° 08',
    stickers: ['▪️', '▫️', '🔲', '⚪', '✖️', '🖤'],
  },

  // 7. Black & White
  {
    id: 'bw-noir',
    name: 'Film Noir Silver',
    category: 'Film & Korea',
    description: 'Foto hitam putih kontras tinggi di atas frame arang.',
    bgColor: '#1B1A18',
    inkColor: '#E9E4DA',
    accentColor: '#9C978C',
    filterCss: 'grayscale(1) contrast(1.25) brightness(1.02)',
    frameStyle: 'modern',
    dateStamp: true,
    filmGrain: true,
    badgeText: 'SILVER GELATIN PRINT',
    stickers: ['🎬', '🎩', '🌙', '🍷', '♟️', '🎞️'],
  },

  // 8. Film Camera
  {
    id: 'film-portra',
    name: 'Portra 400 Roll',
    category: 'Film & Korea',
    description: 'Frame gelap dengan lubang film 35mm dan warna hangat.',
    bgColor: '#1C1917',
    inkColor: '#F5F5F0',
    accentColor: '#EAB308',
    filterCss: 'contrast(1.05) saturate(1.12) sepia(0.22) brightness(1.03)',
    frameStyle: 'film',
    dateStamp: true,
    filmGrain: true,
    badgeText: 'KODAK PORTRA 400 • EXP 24',
    stickers: ['🎞️', '📷', '☀️', '🌾', '🕊️', '🕰️'],
  },

  // 9. Romantic
  {
    id: 'romantic-rose',
    name: 'Vintage Rosé & Wine',
    category: 'Film & Korea',
    description: 'Frame krem mawar dengan warna foto yang hangat.',
    bgColor: '#F5EBE6',
    inkColor: '#4A2828',
    accentColor: '#B75D69',
    filterCss: 'sepia(0.18) saturate(1.1) brightness(1.04) hue-rotate(-12deg)',
    frameStyle: 'classic',
    dateStamp: true,
    badgeText: 'AMOUR TOUJOURS • DUO',
    stickers: ['🌹', '🍷', '💌', '🕯️', '🥂', '💍', '🕊️', '❤️'],
  },

  // 10. Dark Aesthetic
  {
    id: 'dark-midnight',
    name: 'Midnight Neon Slate',
    category: 'Film & Korea',
    description: 'Frame hampir hitam dan warna foto bernuansa ungu.',
    bgColor: '#121214',
    inkColor: '#F0EFF4',
    accentColor: '#A855F7',
    filterCss: 'contrast(1.2) brightness(0.95) saturate(1.2) hue-rotate(20deg)',
    frameStyle: 'modern',
    dateStamp: true,
    badgeText: 'MIDNIGHT COUTURE STUDIO',
    stickers: ['🦇', '🕷️', '🔮', '⚡', '🖤', '🗡️', '⛓️', '🌙'],
  },

  // 11. Seasonal & Special Edition
  {
    id: 'seasonal-celebration',
    name: 'Golden Gala Celebration',
    category: 'Pesta',
    description: 'Frame gelap dengan stiker pesta, cocok untuk ulang tahun atau tahun baru.',
    bgColor: '#1F1B18',
    inkColor: '#FDFBF7',
    accentColor: '#D4AF37',
    filterCss: 'contrast(1.12) brightness(1.06) saturate(1.18)',
    frameStyle: 'classic',
    dateStamp: true,
    badgeText: 'SPECIAL EDITION • CELEBRATION',
    stickers: ['🎉', '🍾', '🥂', '✨', '👑', '🌟', '🪩', '🎊'],
  },
];

const categoryOrder = (theme: ThemeDefinition) => THEME_CATEGORIES.findIndex((c) => c.name === theme.category);

// Urut per kategori. sort di JavaScript stabil, jadi urutan di dalam kategori tetap.
export const THEMES: ThemeDefinition[] = [...BASE_THEMES, ...EXTRA_THEMES].sort(
  (a, b) => categoryOrder(a) - categoryOrder(b)
);

export function getThemesInCategory(name: string) {
  return THEMES.filter((theme) => theme.category === name);
}

export function getThemeById(id: string): ThemeDefinition {
  const found = THEMES.find((t) => t.id === id);
  return found || THEMES[0];
}

