'use client';

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Camera, ImagePlus, SwitchCamera } from 'lucide-react';
import { applyCssFilterToPixels, FilterOverlay, paintFilterOverlay } from '@/lib/canvas/filterEffects';
import { getSamplePhoto } from '@/lib/canvas/samplePhotos';
import { coverCrop, sourceSize, useFaceStickers } from '@/lib/face/useFaceStickers';
import { OverlayLayer } from './FilterControls';

export interface CameraPreviewRef {
  captureFrame: () => string; // returns dataUrl
  /** Mulai merekam frame kecil untuk GIF. Berhenti otomatis saat foto diambil. */
  startBurst: () => void;
  takeBurst: () => string[];
  isDemoMode: boolean;
  setManualImage: (dataUrl: string) => void;
  getStream: () => MediaStream | null;
}

interface CameraPreviewProps {
  filterCss?: string;
  filterOverlay?: FilterOverlay;
  faceSticker?: string | null;
  /** Lebar maksimum foto. Room memakai ukuran lebih kecil karena foto dikirim lewat internet. */
  maxCaptureWidth?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  isMirrored?: boolean;
  enableAudio?: boolean;
  onCameraReady?: () => void;
  onStreamReady?: (stream: MediaStream) => void;
  externalStream?: MediaStream | null;
  onManualCapture?: (dataUrl: string) => void;
}

const CameraPreview = forwardRef<CameraPreviewRef, CameraPreviewProps>(
  (
    {
      filterCss = 'none',
      filterOverlay,
      faceSticker = null,
      maxCaptureWidth = 1600,
      brightness = 100,
      contrast = 100,
      saturation = 100,
      isMirrored = true,
      enableAudio = false,
      onCameraReady,
      onStreamReady,
      externalStream = null,
      onManualCapture,
    },
    ref
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const stillRef = useRef<HTMLImageElement>(null);
    const canvasHiddenRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [isDemo, setIsDemo] = useState(false);
    const [manualImage, setManualImage] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
    const [demoFrameIndex, setDemoFrameIndex] = useState(0);
    const [isHttpMobileWarning, setIsHttpMobileWarning] = useState(false);
    const burstTimer = useRef<number | null>(null);
    const burstFrames = useRef<string[]>([]);

    const getSource = () => (manualImage || isDemo || !stream ? stillRef.current : videoRef.current);
    const face = useFaceStickers(faceSticker, getSource);

    const stopBurst = () => {
      if (burstTimer.current !== null) clearInterval(burstTimer.current);
      burstTimer.current = null;
    };

    useEffect(() => stopBurst, []);

    /** Menggambar frame saat ini lengkap dengan filter, stiker wajah, dan hiasan filter. */
    const drawFrame = (canvas: HTMLCanvasElement, width: number) => {
      const source = getSource();
      const [sourceW, sourceH] = sourceSize(source);
      const ctx = canvas.getContext('2d');
      if (!source || !sourceW || !sourceH || !ctx) return false;

      const height = Math.round(width * 0.75);
      canvas.width = width;
      canvas.height = height;
      const { sx, sy, cropW, cropH } = coverCrop(sourceW, sourceH, width, height);
      const filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${
        filterCss !== 'none' ? filterCss : ''
      }`;
      const canFilter = 'filter' in ctx;
      const mirror = () => {
        if (isMirrored) {
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
        }
      };

      ctx.save();
      mirror();
      if (canFilter) ctx.filter = filter;
      ctx.drawImage(source, sx, sy, cropW, cropH, 0, 0, width, height);
      ctx.restore();

      if (!canFilter) applyCssFilterToPixels(ctx, width, height, filter);

      if (faceSticker) {
        ctx.save();
        mirror();
        face.paintOnto(ctx, width, height);
        ctx.restore();
      }

      if (filterOverlay) paintFilterOverlay(filterOverlay, ctx, width, height);
      return true;
    };

    // Initialize camera
    const initCamera = async (facing: 'user' | 'environment', isCurrent: () => boolean) => {
      // Check if accessed over non-localhost HTTP on mobile
      if (typeof window !== 'undefined') {
        const isSecure =
          window.location.protocol === 'https:' ||
          window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1';
        if (!isSecure && !navigator.mediaDevices?.getUserMedia) {
          setIsHttpMobileWarning(true);
          setIsDemo(true);
          onCameraReady?.();
          return;
        }
      }

      if (externalStream) {
        setStream(externalStream);
        if (videoRef.current) {
          videoRef.current.srcObject = externalStream;
          videoRef.current.play().catch(() => {});
        }
        setIsDemo(false);
        onCameraReady?.();
        onStreamReady?.(externalStream);
        return;
      }

      try {
        streamRef.current?.getTracks().forEach((track) => track.stop());

        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('getUserMedia not supported on this origin');
        }

        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing,
            width: { ideal: 1600 },
            height: { ideal: 1200 },
          },
          audio: enableAudio
            ? {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              }
            : false,
        });

        // Halaman sudah ditinggalkan atau kamera sudah diganti saat izin masih ditunggu.
        if (!isCurrent()) {
          newStream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = newStream;
        setStream(newStream);
        setIsDemo(false);
        setIsHttpMobileWarning(false);

        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
          // Kegagalan play bukan berarti kamera gagal, dan atribut autoPlay akan mencoba lagi.
          videoRef.current.play().catch(() => {});
        }

        onCameraReady?.();
        onStreamReady?.(newStream);
      } catch (err: any) {
        if (!isCurrent()) return;
        console.warn('Camera access denied or unavailable:', err);
        setIsDemo(true);
        if (
          typeof window !== 'undefined' &&
          window.location.protocol !== 'https:' &&
          window.location.hostname !== 'localhost'
        ) {
          setIsHttpMobileWarning(true);
        }
        onCameraReady?.();
      }
    };

    useEffect(() => {
      let isActive = true;
      initCamera(facingMode, () => isActive);
      return () => {
        isActive = false;
        // Lewat ref, karena nilai state di sini masih yang lama dan kamera tidak akan mati.
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };
    }, [facingMode]);

    // Handle mobile file/camera upload
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      // Dikosongkan supaya file yang sama bisa dipilih lagi.
      e.target.value = '';
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setManualImage(result);
          onManualCapture?.(result);
        }
      };
      reader.readAsDataURL(file);
    };

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      captureFrame: () => {
        stopBurst();
        const isStill = Boolean(manualImage) || isDemo;
        // Kamera yang belum siap mengembalikan kosong, supaya foto contoh tidak masuk diam-diam.
        const fallback = isStill ? manualImage ?? getSamplePhoto(demoFrameIndex) : '';
        if (isStill && !manualImage) setDemoFrameIndex((prev) => prev + 1);

        const [sourceW, sourceH] = sourceSize(getSource());
        if (!sourceW || !sourceH) return fallback;

        // Mengikuti ketajaman kamera. Tidak diperbesar melebihi aslinya, kecuali kamera sangat kecil.
        const cropWidth = coverCrop(sourceW, sourceH, 4, 3).cropW;
        const width = Math.round(Math.min(maxCaptureWidth, Math.max(640, cropWidth)));
        const canvas = canvasHiddenRef.current || document.createElement('canvas');
        if (!drawFrame(canvas, width)) return fallback;

        const photo = canvas.toDataURL('image/jpeg', 0.92);
        return photo.length > 1_900_000 ? canvas.toDataURL('image/jpeg', 0.75) : photo;
      },
      startBurst: () => {
        stopBurst();
        burstFrames.current = [];
        if (manualImage || isDemo || !stream) return;
        const canvas = document.createElement('canvas');
        burstTimer.current = window.setInterval(() => {
          if (!drawFrame(canvas, 480)) return;
          burstFrames.current.push(canvas.toDataURL('image/jpeg', 0.72));
          if (burstFrames.current.length > 10) burstFrames.current.shift();
        }, 120);
      },
      takeBurst: () => {
        stopBurst();
        const frames = burstFrames.current;
        burstFrames.current = [];
        return frames;
      },
      isDemoMode: isDemo,
      setManualImage: (url: string) => setManualImage(url),
      getStream: () => stream,
    }));

    const combinedFilterStyle = {
      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${
        filterCss !== 'none' ? filterCss : ''
      }`,
      transform: isMirrored ? 'scaleX(-1)' : 'none',
    };

    return (
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-neutral-900">
        {/* Hidden Canvas & File Input */}
        <canvas ref={canvasHiddenRef} className="hidden" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Live Video Feed (Always muted locally to prevent echo feedback!) */}
        {/* Tetap terpasang saat memakai foto unggahan, supaya kamera bisa langsung dipakai lagi. */}
        {!isDemo && (
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            style={combinedFilterStyle}
            className={`h-full w-full object-cover transition-[filter] duration-200 ${manualImage ? 'hidden' : ''}`}
          />
        )}

        {/* Manual Captured Image (from file or mobile camera upload) */}
        {manualImage && (
          <div className="relative w-full h-full">
            <img
              ref={stillRef}
              src={manualImage}
              alt="Foto yang kamu unggah"
              style={combinedFilterStyle}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 right-3 z-20 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setManualImage(null)}
                className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-200"
              >
                <Camera className="h-4 w-4" />
                <span>{isDemo ? 'Hapus foto' : 'Pakai kamera'}</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-200"
              >
                <ImagePlus className="h-4 w-4" />
                <span>Ganti foto</span>
              </button>
            </div>
          </div>
        )}

        {/* Demo / Mobile HTTP Notice Screen */}
        {isDemo && !manualImage && (
          <div className="relative flex h-full w-full flex-col items-center justify-center p-4 text-center">
            <img
              ref={stillRef}
              src={getSamplePhoto(demoFrameIndex)}
              alt=""
              style={combinedFilterStyle}
              className="absolute inset-0 h-full w-full object-cover opacity-50"
            />
            <div className="relative z-10 max-w-sm space-y-2 rounded-xl bg-white p-4 text-neutral-900 shadow-lg">
              <p className="font-semibold">
                {isHttpMobileWarning ? 'Browser memblokir kamera' : 'Kamera belum aktif'}
              </p>
              <p className="text-sm leading-relaxed text-neutral-600">
                {isHttpMobileWarning
                  ? 'Kamera live butuh koneksi HTTPS. Kamu tetap bisa memotret lewat kamera HP atau memilih foto dari galeri.'
                  : 'Izinkan akses kamera di browser, atau pilih foto dari galeri. Tanpa keduanya, strip akan memakai foto contoh.'}
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn w-full bg-neutral-900 text-white hover:bg-neutral-700"
              >
                <ImagePlus className="h-4 w-4" />
                Pilih foto
              </button>
            </div>
          </div>
        )}

        <canvas
          ref={face.canvasRef}
          aria-hidden="true"
          style={{ transform: isMirrored ? 'scaleX(-1)' : 'none' }}
          className="pointer-events-none absolute inset-0 z-10 h-full w-full"
        />
        {filterOverlay && <OverlayLayer overlay={filterOverlay} className="z-10" />}

        {faceSticker && face.status !== 'off' && !(face.status === 'ready' && face.hasFace) && (
          <span role="status" className="absolute bottom-3 left-3 z-20 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white">
            {face.status === 'loading'
              ? 'Menyiapkan stiker wajah...'
              : face.status === 'failed'
                ? 'Stiker wajah tidak bisa dimuat di perangkat ini'
                : 'Arahkan wajah ke kamera'}
          </span>
        )}

        {/* Status dan tombol kamera */}
        <div className="absolute left-3 right-3 top-3 z-20 flex items-center justify-between">
          <span className="flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
            <span className={`h-2 w-2 rounded-full ${manualImage ? 'bg-white' : isDemo ? 'bg-amber-400' : 'bg-red-500'}`} />
            {manualImage ? 'Foto' : isDemo ? 'Contoh' : 'Live'}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Pilih foto dari galeri"
              aria-label="Pilih foto dari galeri"
              className="rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
            >
              <ImagePlus className="h-4 w-4" />
            </button>

            {!isDemo && (
              <button
                type="button"
                onClick={() => setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))}
                title="Ganti kamera depan atau belakang"
                aria-label="Ganti kamera depan atau belakang"
                className="rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
              >
                <SwitchCamera className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

CameraPreview.displayName = 'CameraPreview';

export default CameraPreview;
