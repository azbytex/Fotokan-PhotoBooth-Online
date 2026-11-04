'use client';

import { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import CameraPreview, { CameraPreviewRef } from '@/components/studio/CameraPreview';
import FaceStickerControls from '@/components/studio/FaceStickerControls';
import CountdownOverlay from '@/components/studio/CountdownOverlay';
import ShutterFlash from '@/components/studio/ShutterFlash';
import FilterControls, { resolveFilterCss, resolveFilterOverlay } from '@/components/studio/FilterControls';
import LayoutSelector from '@/components/studio/LayoutSelector';
import PhotoStripCanvas from '@/components/studio/PhotoStripCanvas';
import ShootControls from '@/components/studio/ShootControls';
import ThemePicker from '@/components/studio/ThemePicker';
import ProcessingScreen from '@/components/studio/ProcessingScreen';
import { isAutosaveOn, saveToGallery } from '@/lib/gallery';
import { photosNeeded } from '@/lib/layouts';
import { saveResultSession } from '@/lib/resultSession';
import { getThemeById } from '@/lib/themes/themeCatalog';
import { LayoutType, ShotItem } from '@/lib/types';
import { sounds } from '@/lib/sound/audioEffects';

function StudioContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialThemeId = searchParams.get('theme') || 'jaring-merah';

  const [activeTheme, setActiveTheme] = useState(() => getThemeById(initialThemeId));
  const [layout, setLayout] = useState<LayoutType>('4-cut');
  const [isThemeLocked, setIsThemeLocked] = useState<boolean>(false);

  const [sessionStage, setSessionStage] = useState<
    'choose_theme' | 'ready_to_snap' | 'countdown' | 'paused_review' | 'processing'
  >('choose_theme');
  const [currentShotIndex, setCurrentShotIndex] = useState<number>(0);

  const [activeFilter, setActiveFilter] = useState<string>('normal');
  const [faceSticker, setFaceSticker] = useState<string | null>(null);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [countdownSecs, setCountdownSecs] = useState<number>(3);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [shots, setShots] = useState<ShotItem[]>([]);
  const [currentCountdown, setCurrentCountdown] = useState<number | null>(null);
  const [isFlashActive, setIsFlashActive] = useState<boolean>(false);
  const [isCameraNotReady, setIsCameraNotReady] = useState<boolean>(false);

  const cameraRef = useRef<CameraPreviewRef>(null);

  const totalRequiredShots = photosNeeded(layout);
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleLockThemeAndProceed = () => {
    setIsThemeLocked(true);
    setSessionStage('ready_to_snap');
    setCurrentShotIndex(0);
  };

  const handleTriggerSingleShot = async () => {
    setSessionStage('countdown');
    setIsCameraNotReady(false);

    for (let i = countdownSecs; i > 0; i--) {
      setCurrentCountdown(i);
      if (soundEnabled) sounds.playTick(i === 1);
      if (i === 2) cameraRef.current?.startBurst();
      await sleep(950);
    }

    setCurrentCountdown(null);
    setIsFlashActive(true);
    if (soundEnabled) {
      sounds.playShutter();
      sounds.playFlash();
    }

    const dataUrl = cameraRef.current?.captureFrame() || '';
    const burst = cameraRef.current?.takeBurst() ?? [];
    await sleep(80);
    setIsFlashActive(false);

    if (!dataUrl) {
      setIsCameraNotReady(true);
      setSessionStage(shots[currentShotIndex] ? 'paused_review' : 'ready_to_snap');
      return;
    }

    const newShot: ShotItem = {
      id: Math.random().toString(36).substring(2, 9),
      dataUrl,
      burst,
      timestamp: Date.now(),
    };

    setShots((prev) => {
      const next = [...prev];
      next[currentShotIndex] = newShot;
      return next;
    });

    setSessionStage('paused_review');
  };

  const finishSession = async () => {
    setSessionStage('processing');
    const session = { shots: shots.filter(Boolean), peerShots: [], stickers: [] };
    const started = Date.now();
    try {
      await saveResultSession({ ...session, themeId: activeTheme.id, layout });
      if (isAutosaveOn()) await saveToGallery(activeTheme.id, layout, session);
    } catch (err) {
      console.warn('Strip tidak tersimpan:', err);
    }
    await sleep(Math.max(0, 900 - (Date.now() - started)));
    router.push('/result');
  };

  const handleProceedNext = () => {
    const next = currentShotIndex + 1;
    if (next < totalRequiredShots) {
      setCurrentShotIndex(next);
      setSessionStage('ready_to_snap');
    } else {
      finishSession();
    }
  };

  const controlStage =
    sessionStage === 'paused_review' ? 'review' : sessionStage === 'countdown' ? 'countdown' : 'ready';

  return (
    <div className="page-wrap py-8 md:py-10">
      <ShutterFlash active={isFlashActive} />
      {sessionStage === 'processing' && <ProcessingScreen />}

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
        <div className="min-w-0">
          {sessionStage === 'choose_theme' && (
            <div className="space-y-7">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Pilih frame dan layout</h1>
                <p className="mt-2 text-muted">Frame tidak bisa diganti setelah sesi foto dimulai.</p>
              </div>

              <section>
                <h2 className="field-label">Frame</h2>
                <ThemePicker selectedId={activeTheme.id} onSelect={setActiveTheme} />
              </section>

              <section>
                <h2 className="field-label">Layout</h2>
                <LayoutSelector layout={layout} setLayout={setLayout} />
              </section>

              <button type="button" onClick={handleLockThemeAndProceed} className="btn-primary w-full px-6 py-3 text-base sm:w-auto">
                Lanjut ke kamera
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {isThemeLocked && (
            <div className="space-y-4">
              <div className="relative">
                <CameraPreview
                  ref={cameraRef}
                  filterCss={resolveFilterCss(activeFilter, activeTheme.filterCss)}
                  filterOverlay={resolveFilterOverlay(activeFilter)}
                  faceSticker={faceSticker}
                  brightness={brightness}
                  contrast={contrast}
                  saturation={saturation}
                  isMirrored={isMirrored}
                />
                <CountdownOverlay count={currentCountdown} />
              </div>

              {isCameraNotReady && (
                <p role="alert" className="rounded-lg bg-brand-soft p-3 text-sm text-brand-text">
                  Kamera belum siap, jadi foto belum diambil. Izinkan akses kamera atau tunggu sebentar, lalu coba lagi.
                </p>
              )}

              <ShootControls
                stage={controlStage}
                shotIndex={currentShotIndex}
                totalShots={totalRequiredShots}
                takenCount={shots.filter(Boolean).length}
                preview={shots[currentShotIndex]}
                countdownSecs={countdownSecs}
                setCountdownSecs={setCountdownSecs}
                isMirrored={isMirrored}
                setIsMirrored={setIsMirrored}
                soundEnabled={soundEnabled}
                setSoundEnabled={setSoundEnabled}
                onShoot={handleTriggerSingleShot}
                onRetake={handleTriggerSingleShot}
                onNext={handleProceedNext}
                nextLabel={
                  currentShotIndex + 1 < totalRequiredShots
                    ? `Lanjut ke foto ${currentShotIndex + 2}`
                    : 'Selesai'
                }
              >
                <FaceStickerControls theme={activeTheme} selected={faceSticker} onSelect={setFaceSticker} />
                <FilterControls
                  brightness={brightness}
                  setBrightness={setBrightness}
                  contrast={contrast}
                  setContrast={setContrast}
                  saturation={saturation}
                  setSaturation={setSaturation}
                  activeFilter={activeFilter}
                  setActiveFilter={setActiveFilter}
                />
              </ShootControls>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-24">
          <PhotoStripCanvas theme={activeTheme} layout={layout} shots={shots} />
        </aside>
      </div>
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-muted">Memuat studio...</div>}>
      <StudioContent />
    </Suspense>
  );
}
