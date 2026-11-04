import { renderPhotoStrip } from './canvas/renderer';
import { run } from './localStore';
import { getThemeById } from './themes/themeCatalog';
import { LayoutType, PlacedSticker, ShotItem } from './types';

const MAX_ENTRIES = 40;
const AUTOSAVE_KEY = 'virtuabooth_autosave';

export interface GalleryEntry {
  id: string;
  createdAt: number;
  themeId: string;
  layout: LayoutType;
  thumb: Blob;
}

export interface GalleryContent {
  shots: ShotItem[];
  peerShots: ShotItem[];
  stickers: PlacedSticker[];
  customCaption?: string;
  customDate?: string;
  watermark?: boolean;
  hostName?: string;
  peerName?: string;
  bgColor?: string;
}

export function isAutosaveOn() {
  try {
    return localStorage.getItem(AUTOSAVE_KEY) !== 'off';
  } catch {
    return true;
  }
}

export function setAutosave(isOn: boolean) {
  try {
    localStorage.setItem(AUTOSAVE_KEY, isOn ? 'on' : 'off');
  } catch {}
}

export async function listGallery() {
  const entries = (await run<GalleryEntry[]>('galleryIndex', 'readonly', (tx) => tx.objectStore('galleryIndex').getAll())) ?? [];
  return entries.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getGalleryEntry(id: string) {
  return run<GalleryEntry>('galleryIndex', 'readonly', (tx) => tx.objectStore('galleryIndex').get(id));
}

export async function loadGalleryContent(id: string) {
  return run<GalleryContent>('galleryData', 'readonly', (tx) => tx.objectStore('galleryData').get(id));
}

export async function deleteGalleryEntry(id: string) {
  await run(['galleryIndex', 'galleryData'], 'readwrite', (tx) => {
    tx.objectStore('galleryIndex').delete(id);
    tx.objectStore('galleryData').delete(id);
  });
}

export async function clearGallery() {
  await run(['galleryIndex', 'galleryData'], 'readwrite', (tx) => {
    tx.objectStore('galleryIndex').clear();
    tx.objectStore('galleryData').clear();
  });
}

export async function saveToGallery(themeId: string, layout: LayoutType, content: GalleryContent) {
  const canvas = document.createElement('canvas');
  const theme = getThemeById(themeId);
  await renderPhotoStrip(canvas, { ...content, theme: { ...theme, bgColor: content.bgColor ?? theme.bgColor }, layout, scale: 0.4 });
  const thumb = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
  if (!thumb) throw new Error('Gambar kecil tidak bisa dibuat');

  const entry: GalleryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    themeId,
    layout,
    thumb,
  };
  await run(['galleryIndex', 'galleryData'], 'readwrite', (tx) => {
    tx.objectStore('galleryIndex').put(entry);
    tx.objectStore('galleryData').put(content, entry.id);
  });

  // Minta browser tidak menghapus galeri saat ruang penyimpanan menipis.
  navigator.storage?.persist?.().catch(() => {});

  const entries = await listGallery();
  await Promise.all(entries.slice(MAX_ENTRIES).map((old) => deleteGalleryEntry(old.id)));
  return entry;
}
