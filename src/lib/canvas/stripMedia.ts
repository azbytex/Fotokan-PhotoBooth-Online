import { applyPalette, GIFEncoder, quantize } from 'gifenc';
import { paintDecorUnder } from './frameDecor';
import { renderPhotoStrip, RenderOptions } from './renderer';
import { ShotItem } from '../types';

const STORY_W = 1080;
const STORY_H = 1920;
const FRAME_MS = 110;

const breathe = () => new Promise((resolve) => setTimeout(resolve, 0));

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Gambar tidak bisa dibuat'))), type, quality);
  });
}

export function hasBurst(shots: ShotItem[]) {
  return shots.some((shot) => (shot?.burst?.length ?? 0) > 1);
}

export function canRecordVideo() {
  return typeof MediaRecorder !== 'undefined' && typeof HTMLCanvasElement.prototype.captureStream === 'function';
}

/** Latar Story memakai motif frame yang sama, jadi strip terlihat menyatu. */
function storyBackground(options: RenderOptions, width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = options.theme.bgColor;
  ctx.fillRect(0, 0, width, height);
  if (options.theme.decor) {
    const zoom = width / 1080;
    ctx.save();
    ctx.scale(zoom, zoom);
    paintDecorUnder(options.theme.decor, ctx, 1080, 1920, []);
    ctx.restore();
  }
  return canvas;
}

function placeOnStory(target: CanvasRenderingContext2D, background: HTMLCanvasElement, strip: HTMLCanvasElement) {
  const { width, height } = target.canvas;
  const fit = Math.min((width * 0.86) / strip.width, (height * 0.92) / strip.height);
  const w = strip.width * fit;
  const h = strip.height * fit;
  target.drawImage(background, 0, 0);
  target.save();
  target.shadowColor = 'rgba(0,0,0,0.38)';
  target.shadowBlur = width * 0.04;
  target.shadowOffsetY = width * 0.015;
  target.drawImage(strip, (width - w) / 2, (height - h) / 2, w, h);
  target.restore();
}

export async function renderStory(options: RenderOptions) {
  const strip = document.createElement('canvas');
  await renderPhotoStrip(strip, { ...options, scale: 2 });
  const canvas = document.createElement('canvas');
  canvas.width = STORY_W;
  canvas.height = STORY_H;
  placeOnStory(canvas.getContext('2d')!, storyBackground(options, STORY_W, STORY_H), strip);
  return canvas;
}

/** Urutan maju lalu mundur: 0 1 2 3 2 1. */
function bounceSequence(length: number) {
  const steps: number[] = [];
  for (let i = 0; i < length; i++) steps.push(i);
  for (let i = length - 2; i > 0; i--) steps.push(i);
  return steps;
}

function shotsAtStep(shots: ShotItem[], step: number) {
  return shots.map((shot) => {
    const burst = shot?.burst;
    if (!burst?.length) return shot;
    return { ...shot, burst: undefined, dataUrl: burst[Math.min(step, burst.length - 1)] };
  });
}

async function eachAnimationStep(options: RenderOptions, scale: number, use: (strip: HTMLCanvasElement, i: number, total: number) => void | Promise<void>) {
  const all = [...options.shots, ...(options.peerShots ?? [])];
  const longest = Math.max(...all.map((shot) => shot?.burst?.length ?? 0));
  const steps = bounceSequence(longest);
  const strip = document.createElement('canvas');
  for (let i = 0; i < steps.length; i++) {
    await renderPhotoStrip(strip, {
      ...options,
      scale,
      shots: shotsAtStep(options.shots, steps[i]),
      peerShots: shotsAtStep(options.peerShots ?? [], steps[i]),
    });
    await use(strip, i, steps.length);
    await breathe();
  }
}

export async function createGif(options: RenderOptions, onProgress?: (share: number) => void, scale = 0.45) {
  const gif = GIFEncoder();
  await eachAnimationStep(options, scale, (strip, i, total) => {
    const ctx = strip.getContext('2d', { willReadFrequently: true })!;
    const { data, width, height } = ctx.getImageData(0, 0, strip.width, strip.height);
    const palette = quantize(data, 256, { format: 'rgb565' });
    gif.writeFrame(applyPalette(data, palette, 'rgb565'), width, height, { palette, delay: FRAME_MS });
    onProgress?.((i + 1) / total);
  });
  gif.finish();
  return new Blob([gif.bytes() as BlobPart], { type: 'image/gif' });
}

function pickVideoFormat() {
  const formats = [
    { type: 'video/mp4;codecs=avc1.42E01E', extension: 'mp4' },
    { type: 'video/mp4', extension: 'mp4' },
    { type: 'video/webm;codecs=vp9', extension: 'webm' },
    { type: 'video/webm', extension: 'webm' },
  ];
  return formats.find((format) => MediaRecorder.isTypeSupported(format.type));
}

/** Video Story 9:16 selama sekitar 6 detik. Direkam sebagai MP4 kalau browser mendukung. */
export async function createStoryVideo(options: RenderOptions, onProgress?: (share: number) => void) {
  const format = pickVideoFormat();
  if (!format) throw new Error('Browser ini tidak bisa merekam video');

  const width = 720;
  const height = 1280;
  const background = storyBackground(options, width, height);
  const frames: HTMLCanvasElement[] = [];
  await eachAnimationStep(options, 1, (strip, i, total) => {
    const frame = document.createElement('canvas');
    frame.width = width;
    frame.height = height;
    placeOnStory(frame.getContext('2d')!, background, strip);
    frames.push(frame);
    onProgress?.(((i + 1) / total) * 0.5);
  });

  const stage = document.createElement('canvas');
  stage.width = width;
  stage.height = height;
  const ctx = stage.getContext('2d')!;
  ctx.drawImage(frames[0], 0, 0);

  const recorder = new MediaRecorder(stage.captureStream(30), { mimeType: format.type, videoBitsPerSecond: 5_000_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size) chunks.push(event.data);
  };
  const finished = new Promise<void>((resolve) => {
    recorder.onstop = () => resolve();
  });
  recorder.start();

  const duration = Math.max(6000, frames.length * FRAME_MS * 2);
  const start = performance.now();
  await new Promise<void>((resolve) => {
    const timer = setInterval(() => {
      const elapsed = performance.now() - start;
      ctx.drawImage(frames[Math.floor(elapsed / FRAME_MS) % frames.length], 0, 0);
      onProgress?.(0.5 + Math.min(1, elapsed / duration) * 0.5);
      if (elapsed >= duration) {
        clearInterval(timer);
        resolve();
      }
    }, FRAME_MS / 2);
  });
  recorder.stop();
  await finished;

  return { blob: new Blob(chunks, { type: format.type.split(';')[0] }), extension: format.extension };
}
