'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import {
  clearGallery,
  GalleryEntry,
  isAutosaveOn,
  listGallery,
  setAutosave,
} from '@/lib/gallery';
import { getThemeById } from '@/lib/themes/themeCatalog';

const formatDate = (time: number) =>
  new Date(time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function Thumb({ entry }: { entry: GalleryEntry }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(entry.thumb);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [entry.thumb]);

  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={`Strip dengan frame ${getThemeById(entry.themeId).name}`} decoding="async" className="block w-full" />
  ) : null;
}

export default function GalleryPage() {
  const [entries, setEntries] = useState<GalleryEntry[] | null>(null);
  const [hasFailed, setHasFailed] = useState(false);
  const [autosave, setAutosaveState] = useState(true);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setEntries(await listGallery());
    } catch (err) {
      console.warn('Galeri tidak bisa dibuka:', err);
      setHasFailed(true);
      setEntries([]);
    }
  }, []);

  useEffect(() => {
    setAutosaveState(isAutosaveOn());
    refresh();
  }, [refresh]);

  const removeAll = async () => {
    await clearGallery();
    setIsConfirmingClear(false);
    refresh();
  };

  return (
    <div className="page-wrap py-10 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">Galeri</h1>
          <p className="mt-3 max-w-xl leading-relaxed text-muted">
            Strip tersimpan hanya di browser ini, paling banyak 40 strip. Membersihkan data browser juga menghapusnya, jadi unduh yang
            ingin kamu simpan selamanya.
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={autosave}
            onChange={(e) => {
              setAutosaveState(e.target.checked);
              setAutosave(e.target.checked);
            }}
            className="h-4 w-4 accent-[rgb(var(--fg))]"
          />
          Simpan otomatis setelah foto
        </label>
      </div>

      {hasFailed && (
        <p role="alert" className="mt-6 rounded-lg bg-surface p-4 text-sm">
          Browser ini tidak mengizinkan penyimpanan, misalnya karena mode privat. Unduh stripmu langsung setelah selesai foto.
        </p>
      )}

      {entries && entries.length === 0 && !hasFailed && (
        <div className="py-20 text-center">
          <p className="text-lg font-semibold">Belum ada strip di sini</p>
          <p className="mt-1 text-muted">Strip yang selesai kamu foto akan muncul di galeri ini.</p>
          <Link href="/studio" className="btn-primary mt-5 px-6 py-3 text-base">
            Mulai foto
          </Link>
        </div>
      )}

      {entries && entries.length > 0 && (
        <>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {entries.map((entry) => (
              <Link key={entry.id} href={`/result?gallery=${encodeURIComponent(entry.id)}`} className="block text-left">
                <span className="strip-lift block overflow-hidden rounded-[3px]">
                  <Thumb entry={entry} />
                </span>
                <span className="mt-2 block text-sm font-semibold">{getThemeById(entry.themeId).name}</span>
                <span className="block text-xs text-muted">{formatDate(entry.createdAt)}</span>
              </Link>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-2 border-t border-line pt-6">
            {isConfirmingClear ? (
              <>
                <span className="text-sm font-medium">Hapus {entries.length} strip dari browser ini?</span>
                <button type="button" onClick={() => setIsConfirmingClear(false)} className="btn-secondary">
                  Batal
                </button>
                <button type="button" onClick={removeAll} className="btn-primary">
                  Ya, hapus semua
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setIsConfirmingClear(true)} className="btn-secondary">
                <Trash2 className="h-4 w-4" />
                Hapus semua
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
