export type LayoutType = 
  | '1-cut'
  | '2-cut'
  | '3-cut'
  | '4-cut'
  | '6-cut'
  | '2x2'
  | 'grid'
  | 'duo-split'
  | 'duo-alternating'
  | 'duo-double';

export type FilterType = 
  | 'normal'
  | 'noir'
  | 'gold'
  | 'cyan'
  | 'rose'
  | 'vintage'
  | 'grain'
  | 'cyberpunk'
  | 'warm'
  | 'dreamy';

export type DecorId =
  | 'webHero'
  | 'comicPow'
  | 'nightCity'
  | 'merahPutih'
  | 'kawung'
  | 'goldOrnate'
  | 'pressedFloral'
  | 'tropical'
  | 'pixelArcade'
  | 'galaxy'
  | 'corkboard'
  | 'gingham'
  | 'retroSunset'
  | 'birthday'
  | 'sky'
  | 'checker'
  | 'ribbon'
  | 'hearts'
  | 'catEars'
  | 'bunnyEars'
  | 'strawberryMilk'
  | 'teddy'
  | 'cherry'
  | 'butterflyLilac'
  | 'glitterStar'
  | 'princess'
  | 'daisyField'
  | 'rainbowCloud'
  | 'candyStripe'
  | 'bobaMilk'
  | 'orangeCat'
  | 'dino'
  | 'duckPond'
  | 'panda'
  | 'frogPond'
  | 'snacks'
  | 'ninja'
  | 'wizard'
  | 'parang'
  | 'lebaran'
  | 'imlek'
  | 'graduation'
  | 'christmas'
  | 'fireworks'
  | 'halloween'
  | 'handheld'
  | 'disco'
  | 'sakura'
  | 'beach'
  | 'notebook'
  | 'loveLetter'
  | 'seoulCafe';

export interface ThemeDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  bgColor: string;
  inkColor: string;
  accentColor: string;
  filterCss: string;
  frameStyle: 'classic' | 'modern' | 'polaroid' | 'film' | 'cute' | 'y2k' | 'editorial';
  filmGrain?: boolean;
  dateStamp?: boolean;
  badgeText?: string;
  samplePhotoUrls?: string[];
  stickers: string[];
  decor?: DecorId;
  frameInset?: number;
  photoRadius?: number;
  photoShape?: 'rect' | 'arch' | 'oval' | 'scallop';
  /** Jarak antarfoto, untuk frame yang punya hiasan di atas setiap foto. */
  photoGap?: number;
  photoBorder?: { color: string; width: number };
  plateColor?: string;
  captionFont?: string;
}

export interface ShotItem {
  id: string;
  dataUrl: string;
  timestamp: number;
  participantId?: string;
  participantName?: string;
  slot?: number; // 0 for host, 1 for peer
  /** Beberapa frame kecil sebelum shutter, untuk GIF dan video. Hanya ada di perangkat pemotret. */
  burst?: string[];
}

export interface PlacedSticker {
  id: string;
  symbol: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  scale: number;
  rotation: number;
}

export interface RoomParticipant {
  id: string;
  name: string;
  peerId: string;
  isHost: boolean;
  isReady: boolean;
  stream?: MediaStream;
  slot: number; // 0 or 1
}

export interface MultiplayerRoomState {
  code: string;
  hostId: string;
  themeId: string;
  layout: LayoutType;
  countdownSeconds: number;
  totalShots: number;
  status: 'lobby' | 'countdown' | 'shooting' | 'review' | 'completed';
  currentShotIndex: number;
  targetTimestamp?: number;
}

