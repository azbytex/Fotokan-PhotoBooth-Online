import { createHash, randomBytes, randomInt, timingSafeEqual } from 'crypto';
import { LayoutType, ShotItem } from '../types';

export type RoomRole = 'host' | 'guest';

interface ServerRoom {
  code: string;
  themeId: string;
  layout: LayoutType;
  isLocked: boolean;
  hostName: string;
  guestName: string;
  hostTokenHash: Buffer;
  guestTokenHash: Buffer | null;
  hostShots: ShotItem[];
  guestShots: ShotItem[];
  hostRevision: number;
  guestRevision: number;
  updatedAt: number;
}

const ROOM_LIFETIME_MS = 24 * 60 * 60 * 1000;
const MAX_ROOMS = 500;
// Foto room disimpan di memori server, jadi batas ini harus lebih kecil dari memori paket hosting.
const MAX_TOTAL_BYTES = 256 * 1024 * 1024;
const MAX_SHOTS = 6;
const MAX_SHOT_CHARS = 2 * 1024 * 1024;
export const MAX_BODY_BYTES = (MAX_SHOTS + 1) * MAX_SHOT_CHARS;

const LAYOUTS: LayoutType[] = ['2-cut', '3-cut', '4-cut', '6-cut', '2x2', 'grid', 'duo-split', 'duo-alternating', 'duo-double'];
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTVWXYZ23456789';
const JPEG_DATA_URL = /^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/;
const SAMPLE_PHOTO = /^\/samples\/sample-[1-6]\.jpg$/;

// Disimpan di global supaya tetap ada saat modul dimuat ulang di mode dev.
const globalStore = global as unknown as {
  __booth_rooms?: Map<string, ServerRoom>;
  __booth_hits?: Map<string, number[]>;
};
const rooms = (globalStore.__booth_rooms ??= new Map<string, ServerRoom>());
const hits = (globalStore.__booth_hits ??= new Map<string, number[]>());

const hashToken = (token: string) => createHash('sha256').update(token).digest();
const shotsSize = (shots: ShotItem[]) => shots.reduce((sum, shot) => sum + shot.dataUrl.length, 0);
const roomSize = (room: ServerRoom) => shotsSize(room.hostShots) + shotsSize(room.guestShots);

function removeExpiredRooms() {
  const oldest = Date.now() - ROOM_LIFETIME_MS;
  rooms.forEach((room, code) => {
    if (room.updatedAt < oldest) rooms.delete(code);
  });
}

function totalSize() {
  let total = 0;
  rooms.forEach((room) => {
    total += roomSize(room);
  });
  return total;
}

function makeCode() {
  const part = () => Array.from({ length: 4 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join('');
  return `${part()}-${part()}`;
}

export function cleanName(value: unknown, fallback: string) {
  if (typeof value !== 'string') return fallback;
  const name = value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 30);
  return name || fallback;
}

/** Hanya foto JPEG dari kamera atau foto contoh situs ini yang diterima. */
export function cleanShots(value: unknown, name: string): ShotItem[] | null {
  if (!Array.isArray(value) || value.length > MAX_SHOTS) return null;
  const shots: ShotItem[] = [];
  for (const item of value) {
    const dataUrl = item?.dataUrl;
    if (typeof dataUrl !== 'string' || dataUrl.length > MAX_SHOT_CHARS) return null;
    if (!JPEG_DATA_URL.test(dataUrl) && !SAMPLE_PHOTO.test(dataUrl)) return null;
    shots.push({ id: randomBytes(6).toString('hex'), dataUrl, timestamp: Date.now(), participantName: name });
  }
  return shots;
}

export function cleanLayout(value: unknown) {
  return LAYOUTS.includes(value as LayoutType) ? (value as LayoutType) : null;
}

export function createRoom(hostName: string, themeId: string) {
  removeExpiredRooms();
  if (rooms.size >= MAX_ROOMS || totalSize() >= MAX_TOTAL_BYTES) return null;
  let code = makeCode();
  while (rooms.has(code)) code = makeCode();
  const token = randomBytes(24).toString('base64url');
  const room: ServerRoom = {
    code,
    themeId,
    layout: 'duo-split',
    isLocked: false,
    hostName,
    guestName: '',
    hostTokenHash: hashToken(token),
    guestTokenHash: null,
    hostShots: [],
    guestShots: [],
    hostRevision: 0,
    guestRevision: 0,
    updatedAt: Date.now(),
  };
  rooms.set(code, room);
  return { room, token };
}

export function findRoom(code: string) {
  removeExpiredRooms();
  return rooms.get(code.toUpperCase());
}

export function roleOf(room: ServerRoom, token: string | null): RoomRole | null {
  if (!token) return null;
  const hash = hashToken(token);
  if (timingSafeEqual(hash, room.hostTokenHash)) return 'host';
  if (room.guestTokenHash && timingSafeEqual(hash, room.guestTokenHash)) return 'guest';
  return null;
}

/** Kursi tamu hanya satu. Setelah terisi, kode room saja tidak cukup untuk masuk. */
export function joinRoom(room: ServerRoom, guestName: string) {
  if (room.guestTokenHash) return null;
  const token = randomBytes(24).toString('base64url');
  room.guestTokenHash = hashToken(token);
  room.guestName = guestName;
  room.updatedAt = Date.now();
  return token;
}

export function canStoreShots(room: ServerRoom, role: RoomRole, shots: ShotItem[]) {
  const current = shotsSize(role === 'host' ? room.hostShots : room.guestShots);
  return totalSize() - current + shotsSize(shots) <= MAX_TOTAL_BYTES;
}

export function storeShots(room: ServerRoom, role: RoomRole, shots: ShotItem[]) {
  if (role === 'host') {
    room.hostShots = shots;
    room.hostRevision += 1;
  } else {
    room.guestShots = shots;
    room.guestRevision += 1;
  }
}

export function touchRoom(room: ServerRoom) {
  room.updatedAt = Date.now();
}

export function deleteRoom(code: string) {
  rooms.delete(code.toUpperCase());
}

/** Yang dilihat peserta. Token tidak pernah keluar, dan foto hanya dikirim kalau ada yang baru. */
export function viewRoom(room: ServerRoom, role: RoomRole, knownRevision: number, includeMine: boolean) {
  const isHost = role === 'host';
  const partnerRevision = isHost ? room.guestRevision : room.hostRevision;
  return {
    code: room.code,
    role,
    themeId: room.themeId,
    layout: room.layout,
    isLocked: room.isLocked,
    myName: isHost ? room.hostName : room.guestName,
    partnerName: isHost ? room.guestName : room.hostName,
    partnerRevision,
    partnerShots: partnerRevision !== knownRevision ? (isHost ? room.guestShots : room.hostShots) : undefined,
    myShots: includeMine ? (isHost ? room.hostShots : room.guestShots) : undefined,
    expiresAt: room.updatedAt + ROOM_LIFETIME_MS,
  };
}

/** Batas percobaan per alamat. Kembali false kalau sudah terlalu sering. */
export function allowRequest(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    hits.forEach((times, name) => {
      if (!times.some((time) => now - time < windowMs)) hits.delete(name);
    });
  }
  return true;
}
