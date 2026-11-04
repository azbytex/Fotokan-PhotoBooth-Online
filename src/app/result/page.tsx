'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ResultView from '@/components/studio/ResultView';
import { deleteGalleryEntry, getGalleryEntry, loadGalleryContent } from '@/lib/gallery';
import { loadResultSession, ResultSession } from '@/lib/resultSession';

export default function ResultPage() {
  const router = useRouter();
  const [session, setSession] = useState<ResultSession | null>(null);
  const [isMissing, setIsMissing] = useState(false);
  const [galleryId, setGalleryId] = useState<string | null>(null);
  const [closeHref, setCloseHref] = useState('/');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('gallery');
    const from = params.get('from');
    // Hanya menerima tujuan di dalam situs ini.
    if (from?.startsWith('/room/') || from === '/editor') setCloseHref(from);
    if (id) {
      setGalleryId(id);
      setCloseHref('/gallery');
    }

    (async () => {
      if (id) {
        const [entry, content] = await Promise.all([getGalleryEntry(id), loadGalleryContent(id)]);
        return entry && content ? { ...content, themeId: entry.themeId, layout: entry.layout } : null;
      }
      return (await loadResultSession()) ?? null;
    })()
      .then((loaded) => {
        if (loaded) setSession(loaded);
        else setIsMissing(true);
      })
      .catch(() => setIsMissing(true));
  }, []);

  if (isMissing) {
    return (
      <div className="page-wrap max-w-lg py-16 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">Belum ada hasil foto</h1>
        <p className="mt-3 text-muted">Ambil foto dulu, hasilnya akan muncul di sini.</p>
        <Link href="/studio" className="btn-primary mt-6 px-6 py-3 text-base">
          Mulai foto
        </Link>
      </div>
    );
  }

  if (!session) {
    return <div className="fixed inset-0 z-50 bg-page" aria-hidden="true" />;
  }

  return (
    <ResultView
      session={session}
      closeHref={closeHref}
      retakeHref={closeHref.startsWith('/room/') ? undefined : `/studio?theme=${session.themeId}`}
      onDelete={
        galleryId
          ? async () => {
              await deleteGalleryEntry(galleryId);
              router.push('/gallery');
            }
          : undefined
      }
    />
  );
}
