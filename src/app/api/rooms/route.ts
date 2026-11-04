import { NextRequest, NextResponse } from 'next/server';
import { allowRequest, cleanName, createRoom, viewRoom } from '@/lib/server/roomStore';
import { getThemeById } from '@/lib/themes/themeCatalog';

const noStore = { 'Cache-Control': 'no-store' };
const clientAddress = (req: NextRequest) => req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'lokal';

export async function POST(req: NextRequest) {
  if (!allowRequest(`create:${clientAddress(req)}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Terlalu banyak room baru. Coba lagi beberapa menit lagi.' }, { status: 429, headers: noStore });
  }

  const body = await req.json().catch(() => null);
  const themeId = getThemeById(String(body?.themeId ?? '')).id;
  const created = createRoom(cleanName(body?.hostName, 'Host'), themeId);
  if (!created) {
    return NextResponse.json({ error: 'Server sedang penuh. Coba lagi nanti.' }, { status: 503, headers: noStore });
  }

  return NextResponse.json(
    { code: created.room.code, token: created.token, room: viewRoom(created.room, 'host', 0, false) },
    { headers: noStore }
  );
}
