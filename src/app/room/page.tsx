'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { THEME_CATEGORIES, getThemeById, getThemesInCategory } from '@/lib/themes/themeCatalog';
import { getRoomToken, joinRoomRequest, normalizeRoomCode, saveRoomToken } from '@/lib/roomClient';

export default function RoomLobbyPage() {
  const router = useRouter();

  const [createName, setCreateName] = useState('');
  const [selectedThemeId, setSelectedThemeId] = useState('korean-haru');
  const [joinCode, setJoinCode] = useState('');
  const [joinName, setJoinName] = useState('');
  const [createError, setCreateError] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    const themeId = new URLSearchParams(window.location.search).get('theme');
    if (themeId) setSelectedThemeId(getThemeById(themeId).id);
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsWorking(true);
    setCreateError('');
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostName: createName.trim() || 'Host', themeId: selectedThemeId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      saveRoomToken(data.code, data.token);
      router.push(`/room/${data.code}`);
    } catch (err) {
      setCreateError(err instanceof Error && err.message ? err.message : 'Room tidak bisa dibuat. Cek koneksi internetmu.');
      setIsWorking(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = normalizeRoomCode(joinCode);
    if (!code) return;
    if (getRoomToken(code)) {
      router.push(`/room/${code}`);
      return;
    }
    setIsWorking(true);
    setJoinError('');
    try {
      const result = await joinRoomRequest(code, joinName.trim() || 'Teman');
      if (result.error) {
        setJoinError(result.error);
        setIsWorking(false);
        return;
      }
      router.push(`/room/${result.code}`);
    } catch {
      setJoinError('Tidak bisa bergabung. Cek koneksi internetmu.');
      setIsWorking(false);
    }
  };

  return (
    <div className="page-wrap py-10 md:py-14">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Foto berdua dari jauh</h1>
        <p className="mt-3 text-lg leading-relaxed text-muted">
          Satu orang membuat room, lalu mengirim kodenya. Kalian foto dari perangkat masing-masing, dan
          hasilnya bergabung di satu strip.
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <form onSubmit={handleCreateRoom} className="flex flex-col rounded-xl border border-line p-5 sm:p-6">
          <h2 className="text-xl font-bold">Buat room baru</h2>
          <p className="mt-1 text-sm text-muted">Kamu akan mendapat kode untuk dikirim ke temanmu.</p>

          <div className="mt-5 flex-1 space-y-4">
            <div>
              <label htmlFor="create-name" className="field-label">Nama kamu</label>
              <input
                id="create-name"
                type="text"
                required
                autoComplete="given-name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                className="field"
              />
            </div>
            <div>
              <label htmlFor="create-theme" className="field-label">Frame</label>
              <select
                id="create-theme"
                value={selectedThemeId}
                onChange={(e) => setSelectedThemeId(e.target.value)}
                className="field"
              >
                {THEME_CATEGORIES.map(({ name }) => (
                  <optgroup key={name} label={name}>
                    {getThemesInCategory(name).map((theme) => (
                      <option key={theme.id} value={theme.id}>
                        {theme.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {createError && (
            <p role="alert" className="mt-4 text-sm font-medium">
              {createError}
            </p>
          )}
          <button type="submit" disabled={isWorking} className="btn-primary mt-6 w-full py-3">Buat room</button>
        </form>

        <form onSubmit={handleJoinRoom} className="flex flex-col rounded-xl border border-line p-5 sm:p-6">
          <h2 className="text-xl font-bold">Gabung ke room</h2>
          <p className="mt-1 text-sm text-muted">Masukkan kode atau link yang kamu terima dari temanmu.</p>

          <div className="mt-5 flex-1 space-y-4">
            <div>
              <label htmlFor="join-name" className="field-label">Nama kamu</label>
              <input
                id="join-name"
                type="text"
                required
                autoComplete="given-name"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                className="field"
              />
            </div>
            <div>
              <label htmlFor="join-code" className="field-label">Kode atau link room</label>
              <input
                id="join-code"
                type="text"
                required
                autoComplete="off"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="ABCD-EFGH"
                className="field"
              />
            </div>
          </div>

          {joinError && (
            <p role="alert" className="mt-4 text-sm font-medium">
              {joinError}
            </p>
          )}
          <button type="submit" disabled={isWorking} className="btn-secondary mt-6 w-full py-3">Gabung</button>
        </form>
      </div>
    </div>
  );
}
