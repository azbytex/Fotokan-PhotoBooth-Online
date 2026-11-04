import { GalleryContent } from './gallery';
import { run } from './localStore';
import { LayoutType, ShotItem } from './types';

export interface ResultSession extends GalleryContent {
  themeId: string;
  layout: LayoutType;
}

// Salinan di memori tab. Kalau browser menolak penyimpanan, hasil foto tetap bisa dibuka dan diunduh.
let latestSession: ResultSession | null = null;

/** Menyimpan sesi terakhir, supaya halaman hasil tetap ada saat dimuat ulang. */
export async function saveResultSession(session: ResultSession) {
  latestSession = session;
  await run('draft', 'readwrite', (tx) => {
    tx.objectStore('draft').put(session, 'result');
  });
}

export async function loadResultSession() {
  if (latestSession) return latestSession;
  return run<ResultSession>('draft', 'readonly', (tx) => tx.objectStore('draft').get('result'));
}

export interface SavedRoomShots {
  code: string;
  shots: ShotItem[];
}

/** Frame GIF tidak dikirim ke server, jadi disimpan di perangkat. Hanya room terakhir yang disimpan. */
export async function saveRoomShots(code: string, shots: ShotItem[]) {
  await run('draft', 'readwrite', (tx) => {
    tx.objectStore('draft').put({ code, shots }, 'roomShots');
  });
}

export async function loadRoomShots(code: string) {
  const saved = await run<SavedRoomShots>('draft', 'readonly', (tx) => tx.objectStore('draft').get('roomShots'));
  return saved?.code === code ? saved.shots : null;
}
