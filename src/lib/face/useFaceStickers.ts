'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FaceLandmarker } from '@mediapipe/tasks-vision';
import type { Color } from 'three';
import type { FaceInput, FaceScene } from './face3d';

export type TrackerStatus = 'off' | 'loading' | 'ready' | 'failed';
type Source = HTMLVideoElement | HTMLImageElement | null;

interface Engine {
  landmarker: FaceLandmarker;
  triangles: number[];
  createScene: (canvas: HTMLCanvasElement, triangles: number[]) => FaceScene;
  makeColor: () => Color;
}

let loading: Promise<Engine> | null = null;

// Model dan mesin 3D hanya diunduh saat stiker wajah pertama kali dipilih.
// Pengenalan wajah berjalan di perangkat, jadi video tidak dikirim ke mana pun.
function loadEngine() {
  loading ??= (async () => {
    const [{ FaceLandmarker: Landmarker, FilesetResolver }, face3d, three] = await Promise.all([
      import('@mediapipe/tasks-vision'),
      import('./face3d'),
      import('three'),
    ]);
    const vision = await FilesetResolver.forVisionTasks('/mediapipe/wasm');
    const options = (delegate: 'GPU' | 'CPU') => ({
      baseOptions: { modelAssetPath: '/mediapipe/face_landmarker.task', delegate },
      runningMode: 'VIDEO' as const,
      numFaces: 2,
      outputFacialTransformationMatrixes: true,
    });
    let landmarker: FaceLandmarker;
    try {
      landmarker = await Landmarker.createFromOptions(vision, options('GPU'));
    } catch {
      landmarker = await Landmarker.createFromOptions(vision, options('CPU'));
    }
    // Setiap tiga garis pada daftar ini membentuk satu segitiga permukaan wajah.
    const triangles = Landmarker.FACE_LANDMARKS_TESSELATION.map((line) => line.start);
    return {
      landmarker,
      triangles,
      createScene: (canvas: HTMLCanvasElement, indices: number[]) => new face3d.FaceScene(canvas, indices),
      makeColor: () => new three.Color(),
    };
  })().catch((err) => {
    loading = null;
    throw err;
  });
  return loading;
}

/** Potongan 4:3 yang dipakai pratinjau dan hasil foto. */
export function coverCrop(sourceW: number, sourceH: number, targetW: number, targetH: number) {
  const zoom = Math.max(targetW / sourceW, targetH / sourceH);
  const cropW = targetW / zoom;
  const cropH = targetH / zoom;
  return { sx: (sourceW - cropW) / 2, sy: (sourceH - cropH) / 2, cropW, cropH, zoom };
}

export function sourceSize(source: Source) {
  if (!source) return [0, 0];
  return source instanceof HTMLVideoElement ? [source.videoWidth, source.videoHeight] : [source.naturalWidth, source.naturalHeight];
}

export function useFaceStickers(sticker: string | null | undefined, getSource: () => Source) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<FaceScene | null>(null);
  const sourceRef = useRef(getSource);
  sourceRef.current = getSource;
  const [status, setStatus] = useState<TrackerStatus>('off');
  const [hasFace, setHasFace] = useState(false);

  useEffect(() => {
    if (!sticker) {
      setStatus('off');
      sceneRef.current?.setSticker(null);
      sceneRef.current?.update([], 1, 1);
      sceneRef.current?.clear();
      return;
    }

    let isActive = true;
    let timer = 0;
    let frame = 0;
    let lastStamp = 0;
    let lastLightMs = 0;
    setStatus('loading');

    const sampler = document.createElement('canvas');
    sampler.width = 16;
    sampler.height = 12;
    const samplerCtx = sampler.getContext('2d', { willReadFrequently: true });

    const matchRoomLight = (engine: Engine, source: Exclude<Source, null>) => {
      const scene = sceneRef.current;
      if (!samplerCtx || !scene) return;
      samplerCtx.drawImage(source, 0, 0, 16, 12);
      const data = samplerCtx.getImageData(0, 0, 16, 12).data;
      let r = 0;
      let g = 0;
      let b = 0;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }
      const n = data.length / 4;
      r /= n * 255;
      g /= n * 255;
      b /= n * 255;
      const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const peak = Math.max(r, g, b, 0.01);
      // Warna ruangan dipakai sedikit saja, supaya model tidak ikut berubah warna.
      const tint = engine.makeColor().setRGB(0.7 + (0.3 * r) / peak, 0.7 + (0.3 * g) / peak, 0.7 + (0.3 * b) / peak);
      scene.matchLighting(brightness, tint);
    };

    const detect = (engine: Engine) => {
      if (!isActive) return;
      const source = sourceRef.current();
      const [w, h] = sourceSize(source);
      let wait = 120;
      if (source && w && h && !document.hidden) {
        const start = performance.now();
        const stamp = Math.max(lastStamp + 1, start);
        lastStamp = stamp;
        try {
          const result = engine.landmarker.detectForVideo(source, stamp);
          const faces: FaceInput[] = result.faceLandmarks.map((landmarks, i) => ({
            landmarks,
            matrix: result.facialTransformationMatrixes?.[i]?.data ?? [],
          }));
          const usable = faces.filter((face) => face.matrix.length === 16);
          sceneRef.current?.update(usable, w, h);
          setHasFace(usable.length > 0);
        } catch (err) {
          console.warn('Deteksi wajah gagal:', err);
        }
        if (start - lastLightMs > 500) {
          lastLightMs = start;
          matchRoomLight(engine, source);
        }
        // Kalau perangkat lambat, jeda antar deteksi otomatis lebih panjang.
        wait = Math.max(50, (performance.now() - start) * 2.5);
      }
      timer = window.setTimeout(() => detect(engine), wait);
    };

    const draw = () => {
      if (!isActive) return;
      const canvas = canvasRef.current;
      const scene = sceneRef.current;
      const [sourceW, sourceH] = sourceSize(sourceRef.current());
      if (canvas && scene && sourceW && sourceH && !document.hidden) {
        const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
        const width = Math.round(canvas.clientWidth * ratio);
        const height = Math.round(canvas.clientHeight * ratio);
        if (width && height) scene.tick(width, height, sourceW, sourceH, coverCrop(sourceW, sourceH, width, height));
      }
      frame = requestAnimationFrame(draw);
    };

    loadEngine()
      .then((engine) => {
        if (!isActive || !canvasRef.current) return;
        sceneRef.current ??= engine.createScene(canvasRef.current, engine.triangles);
        sceneRef.current.setSticker(sticker);
        setStatus('ready');
        detect(engine);
        draw();
      })
      .catch((err) => {
        console.warn('Stiker wajah tidak bisa dimuat:', err);
        if (isActive) setStatus('failed');
      });

    return () => {
      isActive = false;
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [sticker]);

  useEffect(
    () => () => {
      sceneRef.current?.dispose();
      sceneRef.current = null;
    },
    []
  );

  /** Menempelkan model ke kanvas foto, dengan pose wajah terbaru. */
  const paintOnto = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const scene = sceneRef.current;
    const [sourceW, sourceH] = sourceSize(sourceRef.current());
    if (scene && sourceW && sourceH) scene.paintOnto(ctx, width, height, sourceW, sourceH, coverCrop(sourceW, sourceH, width, height));
  }, []);

  return { canvasRef, status, hasFace, paintOnto };
}
