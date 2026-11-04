import { NextRequest, NextResponse } from 'next/server';
import { allowRequest, cleanName, findRoom, joinRoom, viewRoom } from '@/lib/server/roomStore';

const noStore = { 'Cache-Control': 'no-store' };
const fail = (error: string, status: number) => NextResponse.json({ error }, { status, headers: noStore });
const clientAddress = (req: NextRequest) => req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'lokal';

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  // Dibatasi supaya kode room tidak bisa ditebak dengan mencoba terus-menerus.
  if (!allowRequest(`join:${clientAddress(req)}`, 30, 10 * 60 * 1000)) {
    return fail('Terlalu banyak percobaan. Coba lagi beberapa menit lagi.', 429);
  }

  const room = findRoom(params.code);
  if (!room) return fail('Room tidak ditemukan atau sudah kedaluwarsa. Cek lagi kodenya.', 404);

  const body = await req.json().catch(() => null);
  const token = joinRoom(room, cleanName(body?.name, 'Teman'));
  if (!token) return fail('Room ini sudah penuh. Satu room hanya untuk dua orang.', 409);

  return NextResponse.json({ code: room.code, token, room: viewRoom(room, 'guest', -1, false) }, { headers: noStore });
}
