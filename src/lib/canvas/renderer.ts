import { LayoutType, PlacedSticker, ShotItem, ThemeDefinition } from '../types';
import { seeded } from './decorKit';
import { paintDecorOver, paintDecorUnder, PhotoSlot } from './frameDecor';

export interface RenderOptions {
  theme: ThemeDefinition;
  layout: LayoutType;
  shots: ShotItem[];
  peerShots?: ShotItem[]; // For remote duo multiplayer
  stickers?: PlacedSticker[];
  customCaption?: string;
  customDate?: string;
  watermark?: boolean;
  scale?: number; // 1 for preview, 2 or 3 for HD export
  hostName?: string;
  peerName?: string;
}

const imageCache = new Map<string, Promise<HTMLImageElement>>();

export async function renderPhotoStrip(
  canvas: HTMLCanvasElement,
  options: RenderOptions
): Promise<void> {
  const {
    theme,
    layout,
    shots,
    peerShots = [],
    stickers = [],
    customCaption,
    customDate,
    watermark = true,
    scale = 2,
    hostName = 'You',
    peerName = 'Friend',
  } = options;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Halaman tidak memakai font ini di DOM, jadi browser belum tentu sudah memuatnya.
  await Promise.all([
    document.fonts.load('400 38px "Instrument Serif"'),
    document.fonts.load('500 12px "JetBrains Mono"'),
    ...(theme.captionFont ? [document.fonts.load(theme.captionFont)] : []),
    ...(theme.decor === 'comicPow' ? [document.fonts.load('40px Bangers')] : []),
  ]).catch(() => {});

  // Semua gambar dimuat sebelum kanvas disentuh. Dari sini sampai selesai menggambar tidak ada await,
  // jadi dua proses gambar tidak bisa saling menyela dan menumpuk di kanvas yang sama.
  // Pre-load images
  const loadedImages: HTMLImageElement[] = [];
  const loadedPeerImages: HTMLImageElement[] = [];

  const loadImage = (url: string): Promise<HTMLImageElement> => {
    const cached = imageCache.get(url);
    if (cached) return cached;
    const pending = new Promise<HTMLImageElement>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        img.decode().catch(() => {}).finally(() => resolve(img));
      };
      img.onerror = () => resolve(img);
      img.src = url;
    });
    // Foto contoh dipakai berulang oleh banyak pratinjau frame.
    if (!url.startsWith('data:')) imageCache.set(url, pending);
    return pending;
  };

  for (const shot of shots) {
    if (shot && shot.dataUrl) {
      loadedImages.push(await loadImage(shot.dataUrl));
    }
  }

  for (const shot of peerShots) {
    if (shot && shot.dataUrl) {
      loadedPeerImages.push(await loadImage(shot.dataUrl));
    }
  }

  // Base dimensions (will be multiplied by `scale`)
  let baseWidth = 600;
  let baseHeight = 1800;

  let photoCount = 4;
  let cols = 1;
  let rows = 4;

  if (layout === '1-cut') {
    // Satu foto utuh 4:3 di dalam frame.
    const inset = theme.frameInset ?? (theme.frameStyle === 'film' ? 44 : 36);
    baseHeight = Math.round((theme.frameInset ?? 38) + (baseWidth - inset * 2) * 0.75 + 140);
    photoCount = 1;
    rows = 1;
  } else if (layout === '2-cut') {
    baseWidth = 600;
    baseHeight = 1100;
    photoCount = 2;
    rows = 2;
  } else if (layout === '3-cut') {
    baseWidth = 600;
    baseHeight = 1450;
    photoCount = 3;
    rows = 3;
  } else if (layout === '4-cut' || layout === 'duo-split' || layout === 'duo-alternating') {
    baseWidth = 600;
    baseHeight = 1800;
    photoCount = 4;
    rows = 4;
  } else if (layout === '6-cut') {
    baseWidth = 600;
    baseHeight = 2400;
    photoCount = 6;
    rows = 6;
  } else if (layout === '2x2') {
    baseWidth = 800;
    baseHeight = 1000;
    photoCount = 4;
    cols = 2;
    rows = 2;
  } else if (layout === 'grid') {
    baseWidth = 800;
    baseHeight = 1350;
    photoCount = 6;
    cols = 2;
    rows = 3;
  } else if (layout === 'duo-double') {
    // 2 full 4-cut strips side by side
    baseWidth = 1150;
    baseHeight = 1800;
    photoCount = 4;
    cols = 2;
    rows = 4;
  }

  const width = baseWidth * scale;
  const height = baseHeight * scale;

  canvas.width = width;
  canvas.height = height;

  ctx.save();
  ctx.scale(scale, scale);

  // 1. Draw Background
  ctx.fillStyle = theme.bgColor;
  ctx.fillRect(0, 0, baseWidth, baseHeight);

  // Subtle paper texture / noise simulation
  if (theme.frameStyle === 'classic' || theme.filmGrain) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
    // Pakai seed supaya bintik kertas tidak berkedip di GIF dan video.
    const random = seeded(11);
    for (let i = 0; i < 400; i++) {
      const rx = random() * baseWidth;
      const ry = random() * baseHeight;
      ctx.fillRect(rx, ry, 1.5, 1.5);
    }
  }

  // Film Camera Sprocket Holes
  if (theme.frameStyle === 'film') {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 28, baseHeight);
    ctx.fillRect(baseWidth - 28, 0, 28, baseHeight);

    // Sprocket cutouts
    ctx.fillStyle = theme.bgColor;
    const holeHeight = 18;
    const holeGap = 24;
    const count = Math.floor(baseHeight / (holeHeight + holeGap));
    for (let i = 0; i < count; i++) {
      const hy = 16 + i * (holeHeight + holeGap);
      ctx.beginPath();
      ctx.roundRect(6, hy, 16, holeHeight, 3);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(baseWidth - 22, hy, 16, holeHeight, 3);
      ctx.fill();
    }
  }

  const padX = theme.frameInset ?? (theme.frameStyle === 'film' ? 44 : 36);
  const padTop = theme.frameInset ?? 38;
  const footerHeight = 140;
  const gap = theme.photoGap ?? 18;

  const availableHeight = baseHeight - padTop - footerHeight;
  const availableWidth = baseWidth - padX * 2;

  const photoWidth = cols === 1 ? availableWidth : (availableWidth - gap * (cols - 1)) / cols;
  const photoHeight = (availableHeight - gap * (rows - 1)) / rows;

  const slots: PhotoSlot[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      slots.push({
        x: padX + c * (photoWidth + gap),
        y: padTop + r * (photoHeight + gap),
        w: photoWidth,
        h: photoHeight,
      });
    }
  }

  if (theme.decor) paintDecorUnder(theme.decor, ctx, baseWidth, baseHeight, slots);


  // Render individual slots
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const slotIndex = r * cols + c;
      const x = padX + c * (photoWidth + gap);
      const y = padTop + r * (photoHeight + gap);

      const radius = theme.photoRadius ?? 0;
      const shape = theme.photoShape ?? 'rect';
      ctx.save();
      if (radius || shape !== 'rect') {
        tracePhotoShape(ctx, shape, x, y, photoWidth, photoHeight, radius);
        ctx.clip();
      }

      // Frame background / placeholder
      ctx.fillStyle = theme.inkColor + '10';
      if (theme.frameStyle === 'polaroid') {
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(0,0,0,0.08)';
        ctx.shadowBlur = 6;
      }
      ctx.fillRect(x, y, photoWidth, photoHeight);
      ctx.shadowBlur = 0;

      // Handle Duo Modes vs Solo Modes
      if (layout === 'duo-split') {
        // Left half: Host, Right half: Peer
        const halfWidth = photoWidth / 2;
        const hostImg = loadedImages[r];
        const peerImg = loadedPeerImages[r];

        // Draw Left (Host)
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, halfWidth - 1, photoHeight);
        ctx.clip();
        if (hostImg && hostImg.complete && hostImg.naturalWidth > 0) {
          drawCover(ctx, hostImg, x, y, halfWidth, photoHeight);
        } else {
          ctx.fillStyle = theme.inkColor + '15';
          ctx.fillRect(x, y, halfWidth, photoHeight);
          ctx.fillStyle = theme.inkColor + '60';
          ctx.font = '500 13px var(--font-mono, monospace)';
          ctx.textAlign = 'center';
          ctx.fillText(hostName, x + halfWidth / 2, y + photoHeight / 2);
        }
        ctx.restore();

        // Draw Right (Peer)
        ctx.save();
        ctx.beginPath();
        ctx.rect(x + halfWidth + 1, y, halfWidth - 1, photoHeight);
        ctx.clip();
        if (peerImg && peerImg.complete && peerImg.naturalWidth > 0) {
          drawCover(ctx, peerImg, x + halfWidth, y, halfWidth, photoHeight);
        } else {
          ctx.fillStyle = theme.inkColor + '20';
          ctx.fillRect(x + halfWidth, y, halfWidth, photoHeight);
          ctx.fillStyle = theme.inkColor + '60';
          ctx.font = '500 13px var(--font-mono, monospace)';
          ctx.textAlign = 'center';
          ctx.fillText(peerName, x + halfWidth + halfWidth / 2, y + photoHeight / 2);
        }
        ctx.restore();

        // Elegant center split line
        ctx.strokeStyle = theme.bgColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + halfWidth, y);
        ctx.lineTo(x + halfWidth, y + photoHeight);
        ctx.stroke();

      } else if (layout === 'duo-alternating') {
        // Alternating: Even rows Host, Odd rows Peer
        const isHost = r % 2 === 0;
        const imgIndex = Math.floor(r / 2);
        const targetImg = isHost ? loadedImages[imgIndex] : loadedPeerImages[imgIndex];
        const targetName = isHost ? hostName : peerName;

        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, photoWidth, photoHeight);
        ctx.clip();
        if (targetImg && targetImg.complete && targetImg.naturalWidth > 0) {
          drawCover(ctx, targetImg, x, y, photoWidth, photoHeight);
        } else {
          ctx.fillStyle = theme.inkColor + '18';
          ctx.fillRect(x, y, photoWidth, photoHeight);
          ctx.fillStyle = theme.inkColor + '70';
          ctx.font = '500 14px var(--font-mono, monospace)';
          ctx.textAlign = 'center';
          ctx.fillText(`${targetName} (Shot ${imgIndex + 1})`, x + photoWidth / 2, y + photoHeight / 2);
        }
        ctx.restore();

      } else if (layout === 'duo-double') {
        // Col 0: Host shots, Col 1: Peer shots
        const isHost = c === 0;
        const targetImg = isHost ? loadedImages[r] : loadedPeerImages[r];
        const targetName = isHost ? hostName : peerName;

        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, photoWidth, photoHeight);
        ctx.clip();
        if (targetImg && targetImg.complete && targetImg.naturalWidth > 0) {
          drawCover(ctx, targetImg, x, y, photoWidth, photoHeight);
        } else {
          ctx.fillStyle = theme.inkColor + '15';
          ctx.fillRect(x, y, photoWidth, photoHeight);
          ctx.fillStyle = theme.inkColor + '60';
          ctx.font = '500 13px var(--font-mono, monospace)';
          ctx.textAlign = 'center';
          ctx.fillText(`${targetName} #${r + 1}`, x + photoWidth / 2, y + photoHeight / 2);
        }
        ctx.restore();

      } else {
        // Layout biasa. Kalau ada foto teman, slot diisi bergantian supaya foto kalian berdua masuk.
        const turn = Math.floor(slotIndex / 2);
        const targetImg =
          peerShots.length > 0
            ? slotIndex % 2 === 0
              ? loadedImages[turn]
              : loadedPeerImages[turn]
            : loadedImages[slotIndex];

        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, photoWidth, photoHeight);
        ctx.clip();
        if (targetImg && targetImg.complete && targetImg.naturalWidth > 0) {
          drawCover(ctx, targetImg, x, y, photoWidth, photoHeight);
        } else {
          // Placeholder with slot number
          ctx.fillStyle = theme.inkColor + '12';
          ctx.fillRect(x, y, photoWidth, photoHeight);
          ctx.fillStyle = theme.inkColor + '50';
          ctx.font = '500 24px var(--font-mono, monospace)';
          ctx.textAlign = 'center';
          ctx.fillText(`0${slotIndex + 1}`, x + photoWidth / 2, y + photoHeight / 2 + 8);
        }
        ctx.restore();
      }

      ctx.restore();

      if (theme.photoBorder) {
        ctx.strokeStyle = theme.photoBorder.color;
        ctx.lineWidth = theme.photoBorder.width;
        tracePhotoShape(ctx, shape, x, y, photoWidth, photoHeight, radius);
        ctx.stroke();
      }

      // Outer photo frame border
      if (theme.frameStyle === 'y2k') {
        ctx.strokeStyle = theme.accentColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, photoWidth, photoHeight);
      } else if (theme.frameStyle === 'cute') {
        ctx.strokeStyle = theme.accentColor + '80';
        ctx.lineWidth = 3;
        tracePhotoShape(ctx, shape, x, y, photoWidth, photoHeight, radius);
        ctx.stroke();
      }
    }
  }

  if (theme.decor) paintDecorOver(theme.decor, ctx, baseWidth, baseHeight, slots);

  // 3. Footer Section (Branding, Date, Custom Caption)
  const footerY = baseHeight - footerHeight + 25;
  if (theme.plateColor) {
    ctx.fillStyle = theme.plateColor;
    ctx.beginPath();
    ctx.roundRect(padX - 12, footerY - 2, baseWidth - padX * 2 + 24, 90, 12);
    ctx.fill();
  }
  ctx.fillStyle = theme.inkColor;
  ctx.textAlign = 'left';

  // Title / Logo
  ctx.font = theme.captionFont ?? '400 38px "Instrument Serif", Georgia, serif';
  const logoText = customCaption || 'FOTOKAN';
  ctx.fillText(logoText, padX, footerY + 36, availableWidth);

  // Subtitle / Theme Badge & Date
  ctx.font = '500 12px "JetBrains Mono", monospace';
  ctx.fillStyle = theme.inkColor + 'AA';
  const now = new Date();
  const dateStr =
    customDate ||
    now.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).toUpperCase();

  const duoTag = (layout.startsWith('duo-') || peerShots.length > 0)
    ? ` • ${hostName.toUpperCase()} & ${peerName.toUpperCase()} (DUO)`
    : '';

  const badge = theme.badgeText ? `${theme.badgeText} • ` : '';
  ctx.fillText(`${badge}${dateStr}${duoTag}`, padX, footerY + 68, watermark ? availableWidth - 150 : availableWidth);

  // Optional Watermark on bottom right
  if (watermark) {
    ctx.textAlign = 'right';
    ctx.font = '500 11px "JetBrains Mono", monospace';
    ctx.fillStyle = theme.inkColor + '66';
    ctx.fillText('FOTOKAN', baseWidth - padX, footerY + 68);
  }

  // 4. Render User Placed Stickers
  for (const st of stickers) {
    ctx.save();
    const sx = (st.x / 100) * baseWidth;
    const sy = (st.y / 100) * baseHeight;
    ctx.translate(sx, sy);
    ctx.rotate((st.rotation * Math.PI) / 180);
    const fontSize = 42 * (st.scale || 1);
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(st.symbol, 0, 0);
    ctx.restore();
  }

  ctx.restore();
}

function tracePhotoShape(
  ctx: CanvasRenderingContext2D,
  shape: NonNullable<ThemeDefinition['photoShape']>,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  ctx.beginPath();
  if (shape === 'oval') {
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  } else if (shape === 'arch') {
    const r = Math.min(w / 2, h * 0.55);
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.ellipse(x + w / 2, y + r, w / 2, r, 0, Math.PI, 0);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
  } else if (shape === 'scallop') {
    // Tepi bergelombang: lengkung kecil berurutan di keempat sisi.
    const across = Math.max(6, Math.round(w / 46));
    const down = Math.max(4, Math.round(h / 46));
    const sx = w / across;
    const sy = h / down;
    ctx.moveTo(x, y);
    for (let i = 0; i < across; i++) ctx.quadraticCurveTo(x + (i + 0.5) * sx, y - sx * 0.36, x + (i + 1) * sx, y);
    for (let i = 0; i < down; i++) ctx.quadraticCurveTo(x + w + sy * 0.36, y + (i + 0.5) * sy, x + w, y + (i + 1) * sy);
    for (let i = across; i > 0; i--) ctx.quadraticCurveTo(x + (i - 0.5) * sx, y + h + sx * 0.36, x + (i - 1) * sx, y + h);
    for (let i = down; i > 0; i--) ctx.quadraticCurveTo(x - sy * 0.36, y + (i - 0.5) * sy, x, y + (i - 1) * sy);
    ctx.closePath();
  } else {
    ctx.roundRect(x, y, w, h, radius);
  }
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgW = img.naturalWidth || img.width;
  const imgH = img.naturalHeight || img.height;
  if (!imgW || !imgH) return;

  const targetRatio = w / h;
  const imgRatio = imgW / imgH;

  let sourceW = imgW;
  let sourceH = imgH;
  let sourceX = 0;
  let sourceY = 0;

  if (imgRatio > targetRatio) {
    sourceW = imgH * targetRatio;
    sourceX = (imgW - sourceW) / 2;
  } else {
    sourceH = imgW / targetRatio;
    sourceY = (imgH - sourceH) / 2;
  }

  ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, x, y, w, h);
}

