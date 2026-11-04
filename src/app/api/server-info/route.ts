import { NextResponse } from 'next/server';
import os from 'os';

export const dynamic = 'force-dynamic';

/** Hanya untuk mode dev: alamat Wi-Fi laptop, supaya link undangan bisa dibuka dari HP di jaringan yang sama. */
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Tidak tersedia.' }, { status: 404 });
  }

  for (const addresses of Object.values(os.networkInterfaces())) {
    for (const net of addresses ?? []) {
      if (net.family === 'IPv4' && !net.internal && !net.address.startsWith('169.254')) {
        return NextResponse.json({ localIp: net.address });
      }
    }
  }
  return NextResponse.json({ localIp: null });
}
