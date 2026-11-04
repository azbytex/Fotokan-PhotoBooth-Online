'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';

/** Alat pembuat gambar pilihan stiker di public/face-stickers. Hanya aktif di mode dev. */
export default function StickerThumbsPage() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    (async () => {
      const [{ renderStickerThumbnail }, { FACE_STICKERS }] = await Promise.all([import('@/lib/face/face3d'), import('@/lib/face/stickerCatalog')]);
      const result: Record<string, string> = {};
      for (const { id } of FACE_STICKERS) result[id] = renderStickerThumbnail(id, 216);
      (window as unknown as { __thumbs: Record<string, string> }).__thumbs = result;
      setCount(Object.keys(result).length);
    })();
  }, []);

  if (process.env.NODE_ENV === 'production') notFound();

  return <p>{count}</p>;
}
