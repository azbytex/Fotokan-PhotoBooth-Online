'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2, UserPlus } from 'lucide-react';
import RoomInviteModal from '@/components/multiplayer/RoomInviteModal';
import FaceStickerControls from '@/components/studio/FaceStickerControls';
import CountdownOverlay from '@/components/studio/CountdownOverlay';
import ShutterFlash from '@/components/studio/ShutterFlash';
import LayoutSelector from '@/components/studio/LayoutSelector';
import PhotoStripCanvas from '@/components/studio/PhotoStripCanvas';
import FilterControls, { resolveFilterCss, resolveFilterOverlay } from '@/components/studio/FilterControls';
import CameraPreview, { CameraPreviewRef } from '@/components/studio/CameraPreview';
import ShootControls from '@/components/studio/ShootControls';
import ThemePicker from '@/components/studio/ThemePicker';
import ProcessingScreen from '@/components/studio/ProcessingScreen';
import { isAutosaveOn, saveToGallery } from '@/lib/gallery';
import { photosNeeded } from '@/lib/layouts';
import { loadRoomShots, saveResultSession, saveRoomShots } from '@/lib/resultSession';
import { forgetRoomToken, getRoomToken, joinRoomRequest, RoomView } from '@/lib/roomClient';
import { getThemeById } from '@/lib/themes/themeCatalog';
import { LayoutType, ShotItem } from '@/lib/types';
import { sounds } from '@/lib/sound/audioEffects';

type Access = 'checking' | 'join' | 'ready' | 'gone' | 'failed';

export default function DuoRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = (params.code as string)?.toUpperCase() || '';

  const [access, setAccess] = useState<Access>('checking');
  const [isHost, setIsHost] = useState(false);
  const [isRoomGone, setIsRoomGone] = useState(false);
  const [joinName, setJoinName] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isOpeningResult, setIsOpeningResult] = useState(false);

  const [activeTheme, setActiveTheme] = useState(() => getThemeById('korean-haru'));
  const [layout, setLayout] = useState<LayoutType>('duo-split');
  const [isThemeLocked, setIsThemeLocked] = useState<boolean>(false);

  const [sessionStage, setSessionStage] = useState<
    'choose_theme' | 'ready_to_snap' | 'countdown' | 'paused_review' | 'submitted'
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

  const [userName, setUserName] = useState<string>('Kamu');
  const [remoteUserName, setRemoteUserName] = useState<string>('Teman');

  const [myShots, setMyShots] = useState<ShotItem[]>([]);
  const [partnerShots, setPartnerShots] = useState<ShotItem[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveFailed, setSaveFailed] = useState<boolean>(false);

  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [currentCountdown, setCurrentCountdown] = useState<number | null>(null);
  const [isFlashActive, setIsFlashActive] = useState<boolean>(false);
  const [isCameraNotReady, setIsCameraNotReady] = useState<boolean>(false);

  const localCameraRef = useRef<CameraPreviewRef>(null);
  const partnerRevision = useRef(-1);
  const hasLoadedOnce = useRef(false);
  const totalRequiredShots = photosNeeded(layout, true);

  const applyRoom = useCallback((room: RoomView) => {
    const hostSide = room.role === 'host';
    const isFirstLoad = !hasLoadedOnce.current;
    hasLoadedOnce.current = true;

    setIsHost(hostSide);
    setUserName(room.myName);
    if (room.partnerName) setRemoteUserName(room.partnerName);
    partnerRevision.current = room.partnerRevision;
    if (room.partnerShots) setPartnerShots(room.partnerShots);

    // Host menentukan frame dan layout, jadi nilai server hanya dipakai saat halaman baru dibuka.
    if (!hostSide || isFirstLoad) {
      setActiveTheme(getThemeById(room.themeId));
      setLayout(room.layout);
    }
    if (room.isLocked) {
      setIsThemeLocked(true);
      setSessionStage((stage) => (stage === 'choose_theme' ? 'ready_to_snap' : stage));
    }
    // Fotomu kembali setelah halaman dimuat ulang.
    if (room.myShots?.length) {
      const fromServer = room.myShots;
      setMyShots(fromServer);
      setSessionStage('submitted');
      // Frame GIF hanya ada di perangkat ini, jadi dipasangkan lagi ke foto yang sama.
      loadRoomShots(room.code)
        .then((saved) => {
          if (!saved) return;
          setMyShots((current) =>
            current === fromServer
              ? fromServer.map((shot, i) => (saved[i]?.dataUrl === shot.dataUrl ? { ...shot, burst: saved[i].burst } : shot))
              : current
          );
        })
        .catch(() => {});
    }
    setAccess('ready');
  }, []);

  const fetchRoomState = useCallback(
    async (includeMine = false) => {
      const token = getRoomToken(roomCode);
      if (!token) {
        setAccess('join');
        return;
      }
      try {
        const query = `partnerRevision=${partnerRevision.current}${includeMine ? '&mine=1' : ''}`;
        const res = await fetch(`/api/rooms/${encodeURIComponent(roomCode)}?${query}`, {
          headers: { 'x-room-token': token },
        });
        if (res.status === 404) {
          // Foto yang sudah ada tetap bisa diunduh walau room di server sudah terhapus.
          if (hasLoadedOnce.current) setIsRoomGone(true);
          else setAccess('gone');
          return;
        }
        if (res.status === 401) {
          forgetRoomToken(roomCode);
          setAccess('join');
          return;
        }
        if (!res.ok) {
          if (!hasLoadedOnce.current) setAccess('failed');
          return;
        }
        const data = await res.json();
        applyRoom(data.room);
      } catch (e) {
        console.warn('Sync poll error:', e);
        if (!hasLoadedOnce.current) setAccess('failed');
      }
    },
    [roomCode, applyRoom]
  );

  useEffect(() => {
    fetchRoomState(true);
  }, [fetchRoomState]);

  useEffect(() => {
    if (access !== 'ready' || isRoomGone) return;
    const interval = setInterval(() => fetchRoomState(), 2000);
    return () => clearInterval(interval);
  }, [access, isRoomGone, fetchRoomState]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoining(true);
    setJoinError('');
    try {
      const result = await joinRoomRequest(roomCode, joinName.trim() || 'Teman');
      if (result.error) setJoinError(result.error);
      else await fetchRoomState(true);
    } catch {
      setJoinError('Tidak bisa bergabung. Cek koneksi internetmu.');
    } finally {
      setIsJoining(false);
    }
  };

  const postToRoom = (body: object) =>
    fetch(`/api/rooms/${encodeURIComponent(roomCode)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-room-token': getRoomToken(roomCode) ?? '' },
      body: JSON.stringify(body),
    });

  const handleDeleteRoom = async () => {
    await fetch(`/api/rooms/${encodeURIComponent(roomCode)}`, {
      method: 'DELETE',
      headers: { 'x-room-token': getRoomToken(roomCode) ?? '' },
    }).catch(() => {});
    forgetRoomToken(roomCode);
    setIsConfirmingDelete(false);
    setIsRoomGone(true);
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleLockThemeAndProceed = () => {
    setIsThemeLocked(true);
    setSessionStage('ready_to_snap');
    setCurrentShotIndex(0);
    postToRoom({ themeId: activeTheme.id, layout, isLocked: true }).catch(() => {});
  };

  const handleTriggerSingleShot = async () => {
    setSessionStage('countdown');
    setIsCameraNotReady(false);

    for (let i = countdownSecs; i > 0; i--) {
      setCurrentCountdown(i);
      if (soundEnabled) sounds.playTick(i === 1);
      if (i === 2) localCameraRef.current?.startBurst();
      await sleep(950);
    }

    setCurrentCountdown(null);
    setIsFlashActive(true);
    if (soundEnabled) {
      sounds.playShutter();
      sounds.playFlash();
    }

    const myDataUrl = localCameraRef.current?.captureFrame() || '';
    const burst = localCameraRef.current?.takeBurst() ?? [];
    await sleep(80);
    setIsFlashActive(false);

    if (!myDataUrl) {
      setIsCameraNotReady(true);
      setSessionStage(myShots[currentShotIndex] ? 'paused_review' : 'ready_to_snap');
      return;
    }

    const shot: ShotItem = {
      id: Math.random().toString(36).substring(2, 9),
      dataUrl: myDataUrl,
      burst,
      timestamp: Date.now(),
      participantName: userName,
    };

    setMyShots((prev) => {
      const next = [...prev];
      next[currentShotIndex] = shot;
      return next;
    });

    setSessionStage('paused_review');
  };

  const handleSaveShotsToDatabase = async () => {
    setIsSaving(true);
    setSaveFailed(false);
    try {
      // Frame untuk GIF tetap di perangkat ini.
      const shots = myShots.map(({ dataUrl }) => ({ dataUrl }));
      const res = await postToRoom({ shots, name: userName });

      if (res.ok) {
        await saveRoomShots(roomCode, myShots).catch((err) => console.warn('Frame GIF tidak tersimpan:', err));
        setSessionStage('submitted');
        await fetchRoomState();
      } else if (res.status === 404) {
        setIsRoomGone(true);
      } else {
        setSaveFailed(true);
      }
    } catch (e) {
      console.error('Failed to submit shots:', e);
      setSaveFailed(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProceedNext = () => {
    const next = currentShotIndex + 1;
    if (next < totalRequiredShots) {
      setCurrentShotIndex(next);
      setSessionStage('ready_to_snap');
    } else {
      handleSaveShotsToDatabase();
    }
  };

  const everyoneFinished = myShots.length >= totalRequiredShots && partnerShots.length >= totalRequiredShots;
  const roomSession = () => ({
    shots: isHost ? myShots : partnerShots,
    peerShots: isHost ? partnerShots : myShots,
    stickers: [],
    hostName: isHost ? userName : remoteUserName,
    peerName: isHost ? remoteUserName : userName,
  });

  const openResult = async () => {
    setIsOpeningResult(true);
    await saveResultSession({ ...roomSession(), themeId: activeTheme.id, layout }).catch((err) => console.warn('Hasil tidak tersimpan:', err));
    router.push(`/result?from=${encodeURIComponent(`/room/${roomCode}`)}`);
  };

  // Hanya sekali per room di tab ini, supaya kembali dari halaman hasil tidak terlempar lagi ke sana.
  useEffect(() => {
    if (!everyoneFinished || sessionStage !== 'submitted') return;
    const key = `fotokan_room_done_${roomCode}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    (async () => {
      if (isAutosaveOn()) {
        await saveToGallery(activeTheme.id, layout, roomSession()).catch((err) => console.warn('Strip tidak tersimpan ke galeri:', err));
      }
      await sleep(900);
      await openResult();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [everyoneFinished, sessionStage]);

  const displayHostShots = isHost ? myShots : partnerShots;
  const displayGuestShots = isHost ? partnerShots : myShots;
  const bothFinished = myShots.length >= totalRequiredShots && partnerShots.length >= totalRequiredShots;
  const isSubmitted = sessionStage === 'submitted';
  const controlStage =
    sessionStage === 'paused_review' ? 'review' : sessionStage === 'countdown' ? 'countdown' : 'ready';

  if (access === 'checking') {
    return <p className="page-wrap py-16 text-center text-muted">Membuka room...</p>;
  }

  if (access === 'failed') {
    return (
      <div className="page-wrap max-w-lg py-16 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">Room belum bisa dibuka</h1>
        <p className="mt-3 leading-relaxed text-muted">Cek koneksi internetmu, lalu coba lagi.</p>
        <button
          type="button"
          onClick={() => {
            setAccess('checking');
            fetchRoomState(true);
          }}
          className="btn-primary mt-6 px-6 py-3 text-base"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  if (access === 'gone') {
    return (
      <div className="page-wrap max-w-lg py-16 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">Room tidak ditemukan</h1>
        <p className="mt-3 leading-relaxed text-muted">
          Kodenya salah, atau room ini sudah terhapus. Room terhapus otomatis 24 jam setelah terakhir dipakai.
        </p>
        <Link href="/room" className="btn-primary mt-6 px-6 py-3 text-base">
          Buat room baru
        </Link>
      </div>
    );
  }

  if (access === 'join') {
    return (
      <div className="page-wrap max-w-md py-16">
        <h1 className="text-3xl font-extrabold tracking-tight">Gabung ke room {roomCode}</h1>
        <p className="mt-2 text-muted">Tulis namamu supaya temanmu tahu ini kamu.</p>
        <form onSubmit={handleJoin} className="mt-6">
          <label htmlFor="room-join-name" className="field-label">Nama kamu</label>
          <input
            id="room-join-name"
            type="text"
            required
            maxLength={30}
            autoComplete="given-name"
            value={joinName}
            onChange={(e) => setJoinName(e.target.value)}
            className="field"
          />
          {joinError && (
            <p role="alert" className="mt-3 text-sm font-medium">
              {joinError}
            </p>
          )}
          <button type="submit" disabled={isJoining} className="btn-primary mt-5 w-full py-3">
            Gabung
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="page-wrap py-8 md:py-10">
      <ShutterFlash active={isFlashActive} />
      {isOpeningResult && <ProcessingScreen />}
      <RoomInviteModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} roomCode={roomCode} />

      {isRoomGone && (
        <p role="status" className="mb-6 rounded-lg bg-surface p-4 text-sm">
          Room ini sudah terhapus dari server. Foto yang masih terlihat di sini ada di perangkatmu, jadi unduh sebelum menutup halaman.
        </p>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
        <div>
          <p className="text-sm text-muted">{isHost ? 'Room kamu' : `Room bersama ${remoteUserName}`}</p>
          <p className="text-xl font-bold tracking-tight">{roomCode}</p>
        </div>
        <button type="button" onClick={() => setShowInviteModal(true)} disabled={isRoomGone} className="btn-secondary">
          <UserPlus className="h-4 w-4" />
          Undang teman
        </button>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
        <div className="min-w-0">
          {sessionStage === 'choose_theme' && !isHost && (
            <p className="rounded-xl bg-surface p-5 text-muted">Menunggu {remoteUserName} memilih frame...</p>
          )}

          {sessionStage === 'choose_theme' && isHost && (
            <div className="space-y-7">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Pilih frame dan layout</h1>
                <p className="mt-2 text-muted">
                  Pilihanmu berlaku untuk kalian berdua dan tidak bisa diganti setelah sesi dimulai.
                </p>
              </div>

              <section>
                <h2 className="field-label">Frame</h2>
                <ThemePicker selectedId={activeTheme.id} onSelect={setActiveTheme} />
              </section>

              <section>
                <h2 className="field-label">Layout</h2>
                <LayoutSelector layout={layout} setLayout={setLayout} isMultiplayer />
              </section>

              <button type="button" onClick={handleLockThemeAndProceed} className="btn-primary w-full px-6 py-3 text-base sm:w-auto">
                Lanjut ke kamera
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {isSubmitted && (
            <div className="mb-6 rounded-xl border border-line p-5">
              <div className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-brand-text" />
                <div>
                  <h1 className="text-xl font-bold">
                    {bothFinished ? 'Strip kalian sudah lengkap' : 'Fotomu sudah terkirim'}
                  </h1>
                  <p className="mt-1 text-muted">
                    {bothFinished
                      ? 'Kalian berdua bisa mengunduh hasilnya sekarang.'
                      : `Sekarang giliran ${remoteUserName}. Strip akan terisi otomatis saat fotonya masuk, jadi halaman ini boleh tetap terbuka.`}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {!bothFinished && !isRoomGone && (
                  <button type="button" onClick={() => setShowInviteModal(true)} className="btn-primary">
                    Kirim link ke {remoteUserName}
                  </button>
                )}
                {bothFinished && (
                  <button type="button" onClick={openResult} className="btn-primary">
                    Lihat hasil
                  </button>
                )}
                {!isRoomGone && (
                  <button
                    type="button"
                    onClick={() => {
                      setMyShots([]);
                      setSessionStage('ready_to_snap');
                      setCurrentShotIndex(0);
                    }}
                    className="btn-secondary"
                  >
                    Foto ulang
                  </button>
                )}
                {!isRoomGone &&
                  (isConfirmingDelete ? (
                    <>
                      <button type="button" onClick={() => setIsConfirmingDelete(false)} className="btn-secondary">
                        Batal
                      </button>
                      <button type="button" onClick={handleDeleteRoom} className="btn-primary">
                        Ya, hapus untuk kalian berdua
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={() => setIsConfirmingDelete(true)} className="btn-secondary">
                      Hapus room dari server
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Setelah foto terkirim, kamera dilepas supaya tidak menyala tanpa terlihat. */}
          {isThemeLocked && !isSubmitted && (
            <div className="space-y-4">
              {partnerShots.length > 0 && !bothFinished && (
                <div>
                  <p className="mb-2 text-sm font-medium">Foto dari {remoteUserName}, untuk contoh pose</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {partnerShots.map((shot, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={shot.id ?? i}
                        src={shot.dataUrl}
                        alt={`Pose ${i + 1} dari ${remoteUserName}`}
                        className="h-16 w-16 shrink-0 rounded-md object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="relative">
                <CameraPreview
                  ref={localCameraRef}
                  filterCss={resolveFilterCss(activeFilter, activeTheme.filterCss)}
                  filterOverlay={resolveFilterOverlay(activeFilter)}
                  faceSticker={faceSticker}
                  maxCaptureWidth={1280}
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

              {saveFailed && (
                <p role="alert" className="rounded-lg bg-brand-soft p-3 text-sm text-brand-text">
                  Fotomu belum terkirim. Cek koneksi internet, lalu coba lagi.
                </p>
              )}

              <ShootControls
                stage={controlStage}
                shotIndex={currentShotIndex}
                totalShots={totalRequiredShots}
                takenCount={myShots.filter(Boolean).length}
                preview={myShots[currentShotIndex]}
                countdownSecs={countdownSecs}
                setCountdownSecs={setCountdownSecs}
                isMirrored={isMirrored}
                setIsMirrored={setIsMirrored}
                soundEnabled={soundEnabled}
                setSoundEnabled={setSoundEnabled}
                onShoot={handleTriggerSingleShot}
                onRetake={handleTriggerSingleShot}
                onNext={handleProceedNext}
                isBusy={isSaving}
                nextLabel={
                  currentShotIndex + 1 < totalRequiredShots
                    ? `Lanjut ke foto ${currentShotIndex + 2}`
                    : 'Kirim foto'
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
          <PhotoStripCanvas
            theme={activeTheme}
            layout={layout}
            shots={displayHostShots}
            peerShots={displayGuestShots}
            hostName={isHost ? userName : remoteUserName}
            peerName={isHost ? remoteUserName : userName}
          />
        </aside>
      </div>
    </div>
  );
}
