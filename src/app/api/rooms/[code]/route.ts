import { NextRequest, NextResponse } from 'next/server';
import {
  canStoreShots,
  cleanLayout,
  cleanName,
  cleanShots,
  deleteRoom,
  findRoom,
  MAX_BODY_BYTES,
  roleOf,
  storeShots,
  touchRoom,
  viewRoom,
} from '@/lib/server/roomStore';
import { getThemeById } from '@/lib/themes/themeCatalog';

const noStore = { 'Cache-Control': 'no-store' };
const fail = (error: string, status: number) => NextResponse.json({ error }, { status, headers: noStore });

function authorize(req: NextRequest, code: string) {
  const room = findRoom(code);
  if (!room) return { response: fail('Room tidak ditemukan atau sudah kedaluwarsa.', 404) };
  const role = roleOf(room, req.headers.get('x-room-token'));
  if (!role) return { response: fail('Kamu belum bergabung ke room ini.', 401) };
  return { room, role };
}

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  const { room, role, response } = authorize(req, params.code);
  if (!room || !role) return response;

  const known = Number(req.nextUrl.searchParams.get('partnerRevision') ?? -1);
  const includeMine = req.nextUrl.searchParams.get('mine') === '1';
  return NextResponse.json({ room: viewRoom(room, role, known, includeMine) }, { headers: noStore });
}

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  const { room, role, response } = authorize(req, params.code);
  if (!room || !role) return response;

  if (Number(req.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) return fail('Foto terlalu besar.', 413);
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return fail('Foto terlalu besar.', 413);

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail('Data tidak valid.', 400);
  }

  // Setiap peserta hanya boleh mengubah miliknya. Frame dan layout milik host.
  if (role === 'host') {
    if (body.themeId !== undefined) room.themeId = getThemeById(String(body.themeId)).id;
    const layout = cleanLayout(body.layout);
    if (layout) room.layout = layout;
    if (body.isLocked === true) room.isLocked = true;
    if (body.name !== undefined) room.hostName = cleanName(body.name, room.hostName);
  } else if (body.name !== undefined) {
    room.guestName = cleanName(body.name, room.guestName);
  }

  if (body.shots !== undefined) {
    const shots = cleanShots(body.shots, role === 'host' ? room.hostName : room.guestName);
    if (!shots) return fail('Foto tidak valid atau terlalu besar.', 400);
    if (!canStoreShots(room, role, shots)) return fail('Server sedang penuh. Coba lagi nanti.', 503);
    storeShots(room, role, shots);
  }

  touchRoom(room);
  return NextResponse.json({ room: viewRoom(room, role, -1, false) }, { headers: noStore });
}

export async function DELETE(req: NextRequest, { params }: { params: { code: string } }) {
  const { room, role, response } = authorize(req, params.code);
  if (!room || !role) return response;
  deleteRoom(room.code);
  return NextResponse.json({ ok: true }, { headers: noStore });
}
