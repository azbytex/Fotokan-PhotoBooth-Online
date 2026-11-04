'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Download, Pencil, RotateCcw, Share2, Trash2, X } from 'lucide-react';
import { Logo } from '@/components/layout/Navbar';
import { renderPhotoStrip, RenderOptions } from '@/lib/canvas/renderer';
import { canRecordVideo, canvasToBlob, createGif, createStoryVideo, downloadBlob, hasBurst, renderStory } from '@/lib/canvas/stripMedia';
import { saveEditorDraft } from '@/lib/editorDraft';
import { ResultSession } from '@/lib/resultSession';
import { getThemeById } from '@/lib/themes/themeCatalog';
import { ShotItem } from '@/lib/types';

interface Slide {
  key: string;
  label: string;
  fileLabel: string;
  isGif: boolean;
  options: RenderOptions;
  gifScale: number;
  previewScale: number;
}

function buildSlides(session: ResultSession): Slide[] {
  const base = getThemeById(session.themeId);
  const theme = { ...base, bgColor: session.bgColor ?? base.bgColor };
  const whole: RenderOptions = {
    theme,
    layout: session.layout,
    shots: session.shots,
    peerShots: session.peerShots,
    stickers: session.stickers,
    customCaption: session.customCaption,
    customDate: session.customDate,
    watermark: session.watermark,
    hostName: session.hostName,
    peerName: session.peerName,
  };
  const slides: Slide[] = [
    { key: 'strip', label: 'Strip foto', fileLabel: 'strip', isGif: false, options: whole, gifScale: 0, previewScale: 1.2 },
  ];
  if (hasBurst([...session.shots, ...session.peerShots])) {
    slides.push({ key: 'strip-gif', label: 'GIF strip', fileLabel: 'strip', isGif: true, options: whole, gifScale: 0.45, previewScale: 0 });
  }

  const single = (shot: ShotItem): RenderOptions => ({
    theme,
    layout: '1-cut',
    shots: [shot],
    customCaption: session.customCaption,
    customDate: session.customDate,
    watermark: session.watermark,
  });
  const people: [ShotItem[], string | undefined][] = [
    [session.shots, session.peerShots.length ? session.hostName : undefined],
    [session.peerShots, session.peerName],
  ];
  people.forEach(([shots, owner], side) => {
    shots.filter(Boolean).forEach((shot, i) => {
      const name = `Foto ${i + 1}${owner ? ` ${owner}` : ''}`;
      const file = `foto-${side ? 'b-' : ''}${i + 1}`;
      slides.push({ key: `${side}-${i}`, label: name, fileLabel: file, isGif: false, options: single(shot), gifScale: 0, previewScale: 1.5 });
      if ((shot.burst?.length ?? 0) > 1) {
        slides.push({ key: `${side}-${i}-gif`, label: `GIF ${name.toLowerCase()}`, fileLabel: file, isGif: true, options: single(shot), gifScale: 0.8, previewScale: 0 });
      }
    });
  });
  return slides;
}

type SlideMedia = { url: string; blob: Blob };

interface ResultViewProps {
  session: ResultSession;
  closeHref: string;
  retakeHref?: string;
  onDelete?: () => Promise<void>;
}

export default function ResultView({ session, closeHref, retakeHref, onDelete }: ResultViewProps) {
  const slides = useMemo(() => buildSlides(session), [session]);
  const [current, setCurrent] = useState(0);
  const [media, setMedia] = useState<Record<string, SlideMedia>>({});
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [canVideo, setCanVideo] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const started = useRef(new Set<string>());
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const allUrls = useRef<string[]>([]);

  const theme = getThemeById(session.themeId);
  const slide = slides[current];
  const fileName = (label: string, extension: string) =>
    `FOTOKAN-${theme.name.replace(/\s+/g, '-')}-${label}.${extension}`;
  const isAnimated = hasBurst([...session.shots, ...session.peerShots]);

  useEffect(() => setCanVideo(canRecordVideo()), []);
  useEffect(() => {
    const urls = allUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  // Slide dibuat satu per satu saat mendekati layar, jadi halaman tidak berat sejak awal.
  const requestSlide = useCallback((target: Slide) => {
    if (started.current.has(target.key)) return;
    started.current.add(target.key);
    queue.current = queue.current.then(async () => {
      try {
        let blob: Blob;
        if (target.isGif) {
          blob = await createGif(
            target.options,
            (share) => setProgress((value) => ({ ...value, [target.key]: share })),
            target.gifScale
          );
        } else {
          const canvas = document.createElement('canvas');
          await renderPhotoStrip(canvas, { ...target.options, scale: target.previewScale });
          blob = await canvasToBlob(canvas, 'image/jpeg', 0.9);
        }
        const url = URL.createObjectURL(blob);
        allUrls.current.push(url);
        setMedia((value) => ({ ...value, [target.key]: { url, blob } }));
      } catch (err) {
        console.error('Slide tidak bisa dibuat:', err);
      }
    });
  }, []);

  useEffect(() => {
    requestSlide(slides[current]);
    if (slides[current + 1]) requestSlide(slides[current + 1]);
    if (slides[current - 1]) requestSlide(slides[current - 1]);
  }, [current, slides, requestSlide]);

  const goTo = useCallback(
    (index: number) => {
      const box = scroller.current;
      if (!box || index < 0 || index >= slides.length) return;
      const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      box.scrollTo({ left: box.clientWidth * index, behavior: smooth ? 'smooth' : 'auto' });
    },
    [slides.length]
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') goTo(current + 1);
      if (event.key === 'ArrowLeft') goTo(current - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, goTo]);

  const handleScroll = () => {
    const box = scroller.current;
    if (!box || !box.clientWidth) return;
    const index = Math.round(box.scrollLeft / box.clientWidth);
    if (index !== current) {
      setCurrent(index);
      setNotice(null);
    }
  };

  const makeFile = async (target: Slide, format: 'png' | 'jpeg') => {
    if (target.isGif) {
      const ready = media[target.key];
      if (!ready) return null;
      return { blob: ready.blob, name: fileName(`${target.fileLabel}-gif`, 'gif') };
    }
    const canvas = document.createElement('canvas');
    await renderPhotoStrip(canvas, { ...target.options, scale: 3 });
    const blob = await canvasToBlob(canvas, format === 'png' ? 'image/png' : 'image/jpeg', 0.95);
    return { blob, name: fileName(target.fileLabel, format === 'png' ? 'png' : 'jpg') };
  };

  const run = async (label: string, work: () => Promise<string | void>) => {
    setStatus(label);
    setNotice(null);
    try {
      setNotice((await work()) || null);
    } catch (err) {
      console.error('Export error:', err);
      setNotice('File tidak bisa dibuat di browser ini. Coba format lain.');
    } finally {
      setStatus(null);
    }
  };

  const handleDownload = (format: 'png' | 'jpeg') =>
    run('Menyiapkan file...', async () => {
      const file = await makeFile(slide, format);
      if (file) downloadBlob(file.blob, file.name);
    });

  const handleShare = () =>
    run('Menyiapkan file...', async () => {
      const made = await makeFile(slide, 'png');
      if (!made) return;
      const file = new File([made.blob], made.name, { type: made.blob.type });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Hasil fotoku di Fotokan' }).catch(() => {});
        return;
      }
      if (made.blob.type === 'image/png' && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': made.blob })]);
        return 'Gambar tersalin. Tempel di aplikasi tujuan.';
      }
      downloadBlob(made.blob, made.name);
      return 'Browser ini belum bisa membagikan file langsung, jadi file ini diunduh.';
    });

  const handleStory = () =>
    run('Menyiapkan Story...', async () => {
      const canvas = await renderStory(slides[0].options);
      downloadBlob(await canvasToBlob(canvas, 'image/png'), fileName('story', 'png'));
    });

  const handleVideo = () =>
    run('Membuat video...', async () => {
      const { blob, extension } = await createStoryVideo(slides[0].options, (share) =>
        setStatus(`Membuat video ${Math.round(share * 100)}%`)
      );
      downloadBlob(blob, fileName('story', extension));
      if (extension === 'webm') return 'Browser ini hanya bisa membuat WebM, dan Instagram belum tentu menerimanya.';
    });

  const handleEdit = () => {
    saveEditorDraft({
      themeId: session.themeId,
      layout: session.layout,
      shots: session.shots,
      peerShots: session.peerShots,
      hostName: session.hostName,
      peerName: session.peerName,
      stickers: session.stickers,
      customCaption: session.customCaption,
      customDate: session.customDate,
      watermark: session.watermark,
      bgColor: session.bgColor,
    });
  };

  const isBusy = status !== null;
  const isSlideReady = Boolean(media[slide.key]);

  return (
    <div className="page-fade fixed inset-0 z-50 flex flex-col overflow-y-auto bg-page">
      <header className="page-wrap flex h-16 shrink-0 items-center justify-between">
        <Logo />
        <Link href={closeHref} aria-label="Tutup hasil" className="-mr-2 rounded-lg p-2 text-fg hover:bg-surface">
          <X className="h-6 w-6" />
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center pb-8">
        <h1 className="px-4 text-center text-2xl font-extrabold tracking-tight md:text-3xl">Fotomu sudah jadi</h1>

        <div
          ref={scroller}
          onScroll={handleScroll}
          aria-label="Hasil foto"
          className="result-slides mt-4 flex h-[min(62svh,680px)] min-h-[320px] w-full shrink-0 snap-x snap-mandatory overflow-x-auto"
        >
          {slides.map((item, index) => {
            const ready = media[item.key];
            const share = progress[item.key];
            return (
              <div key={item.key} className="flex h-full w-full shrink-0 snap-center items-center justify-center px-4 py-3">
                {ready ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={ready.url}
                    alt={item.label}
                    draggable={false}
                    className={`result-media max-h-full max-w-full rounded-[3px] shadow-[0_24px_50px_-22px_rgb(0_0_0/0.55)] ${
                      index === current ? 'is-current' : ''
                    }`}
                  />
                ) : (
                  <div role="status" className="flex flex-col items-center gap-3 text-sm text-muted">
                    <span className="result-loader" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                    {item.isGif ? `Membuat GIF ${Math.round((share ?? 0) * 100)}%` : 'Menyiapkan foto...'}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center gap-4">
          <button
            type="button"
            onClick={() => goTo(current - 1)}
            disabled={current === 0}
            aria-label="Slide sebelumnya"
            className="rounded-full p-2 text-fg hover:bg-surface disabled:opacity-25"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <p className="min-w-[8.5rem] text-center" aria-live="polite">
            <span className="block text-sm font-semibold capitalize">{slide.label}</span>
            <span className="block text-xs tabular-nums text-muted">
              {current + 1} dari {slides.length}
            </span>
          </p>
          <button
            type="button"
            onClick={() => goTo(current + 1)}
            disabled={current === slides.length - 1}
            aria-label="Slide berikutnya"
            className="rounded-full p-2 text-fg hover:bg-surface disabled:opacity-25"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2 px-4">
          <button
            type="button"
            onClick={() => handleDownload('png')}
            disabled={isBusy || (slide.isGif && !isSlideReady)}
            className="btn-primary min-w-[9.5rem] px-6 py-3 text-base"
          >
            <Download className="h-5 w-5" />
            Unduh {slide.isGif ? 'GIF' : 'PNG'}
          </button>
          <button
            type="button"
            onClick={handleShare}
            disabled={isBusy || (slide.isGif && !isSlideReady)}
            className="btn-secondary min-w-[9.5rem] px-6 py-3 text-base"
          >
            <Share2 className="h-5 w-5" />
            Bagikan
          </button>
        </div>

        <p role="status" className="mt-2 min-h-5 px-4 text-center text-sm text-muted">
          {status ?? notice}
        </p>

        <div className="mt-3 flex flex-wrap justify-center gap-2 px-4">
          {!slide.isGif && (
            <button type="button" onClick={() => handleDownload('jpeg')} disabled={isBusy} className="chip">
              Unduh JPG
            </button>
          )}
          <button type="button" onClick={handleStory} disabled={isBusy} className="chip">
            Story 9:16
          </button>
          {isAnimated && canVideo && (
            <button type="button" onClick={handleVideo} disabled={isBusy} className="chip">
              Video Story
            </button>
          )}
          <Link href="/editor" onClick={handleEdit} className="chip inline-flex items-center gap-1.5">
            <Pencil className="h-3.5 w-3.5" />
            Tambah stiker dan teks
          </Link>
          {retakeHref && (
            <Link href={retakeHref} className="chip inline-flex items-center gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
              Foto lagi
            </Link>
          )}
          {onDelete &&
            (isConfirmingDelete ? (
              <button type="button" onClick={onDelete} className="chip chip-on">
                Ya, hapus dari galeri
              </button>
            ) : (
              <button type="button" onClick={() => setIsConfirmingDelete(true)} className="chip inline-flex items-center gap-1.5">
                <Trash2 className="h-3.5 w-3.5" />
                Hapus dari galeri
              </button>
            ))}
        </div>
      </main>
    </div>
  );
}
