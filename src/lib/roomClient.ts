import { LayoutType, ShotItem } from './types';

export interface RoomView {
  code: string;
  role: 'host' | 'guest';
  themeId: string;
  layout: LayoutType;
  isLocked: boolean;
  myName: string;
  partnerName: string;
  partnerRevision: number;
  partnerShots?: ShotItem[];
  myShots?: ShotItem[];
  expiresAt: number;
}

const tokenKey = (code: string) => `virtuabooth_room_${code.toUpperCase()}`;

export function getRoomToken(code: string) {
  try {
    return localStorage.getItem(tokenKey(code));
  } catch {
    return null;
  }
}

export function saveRoomToken(code: string, token: string) {
  try {
    localStorage.setItem(tokenKey(code), token);
  } catch {}
}

export function forgetRoomToken(code: string) {
  try {
    localStorage.removeItem(tokenKey(code));
  } catch {}
}

/** Menerima kode atau link undangan, dengan atau tanpa tanda hubung. */
export function normalizeRoomCode(input: string) {
  let code = input.trim().toUpperCase();
  if (code.includes('/ROOM/')) code = code.split('/ROOM/')[1].split(/[?#/]/)[0];
  const compact = code.replace(/[^A-Z0-9]/g, '');
  return compact.length === 8 ? `${compact.slice(0, 4)}-${compact.slice(4)}` : code;
}

export async function joinRoomRequest(code: string, name: string) {
  const res = await fetch(`/api/rooms/${encodeURIComponent(code)}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: (data.error as string) || 'Tidak bisa bergabung. Coba lagi.' };
  saveRoomToken(data.code, data.token);
  return { code: data.code as string };
}
