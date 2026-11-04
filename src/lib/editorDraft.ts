import { run } from './localStore';
import { LayoutType, PlacedSticker, ShotItem } from './types';

export interface EditorDraft {
  themeId: string;
  layout: LayoutType;
  shots: ShotItem[];
  peerShots: ShotItem[];
  hostName?: string;
  peerName?: string;
  stickers?: PlacedSticker[];
  customCaption?: string;
  customDate?: string;
  watermark?: boolean;
  bgColor?: string;
}

// Salinan di memori tab, untuk browser yang menolak penyimpanan.
let latestDraft: EditorDraft | null = null;

/** Membawa foto dari sesi ke halaman editor. */
export function saveEditorDraft(draft: EditorDraft) {
  latestDraft = draft;
  run('draft', 'readwrite', (tx) => {
    tx.objectStore('draft').put(draft, 'current');
  }).catch((err) => console.warn('Foto tidak bisa dibawa ke editor:', err));
}

export async function loadEditorDraft(): Promise<EditorDraft | null> {
  if (latestDraft) return latestDraft;
  try {
    const draft = await run<EditorDraft>('draft', 'readonly', (tx) => tx.objectStore('draft').get('current'));
    return draft ?? null;
  } catch {
    return null;
  }
}
