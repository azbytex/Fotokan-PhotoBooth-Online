import { heart, sparkle, star } from './decorCute';
import { Ctx, seeded } from './decorKit';

export type FilterOverlay =
  | 'hearts'
  | 'sparkles'
  | 'bokeh'
  | 'leak'
  | 'rainbow'
  | 'grain'
  | 'vignette'
  | 'snow'
  | 'petals'
  | 'halftone'
  | 'stars';

// Hiasan yang menempel di foto. Digambar dengan seed, jadi pratinjau sama dengan hasil.
const painters: Record<FilterOverlay, (ctx: Ctx, w: number, h: number) => void> = {
  hearts(ctx, w, h) {
    const random = seeded(5);
    for (let i = 0; i < 16; i++) {
      // Ditaruh di pinggir supaya tidak menutupi wajah di tengah.
      const side = i % 2 ? random() * 0.26 : 0.74 + random() * 0.26;
      const x = side * w;
      const y = random() * h;
      ctx.globalAlpha = 0.65 + random() * 0.3;
      heart(ctx, x, y, w * (0.035 + random() * 0.06), ['#FF5FA8', '#FF8DC4', '#FFFFFF'][i % 3], (random() - 0.5) * 0.8);
    }
    ctx.globalAlpha = 1;
  },
  sparkles(ctx, w, h) {
    const random = seeded(9);
    for (let i = 0; i < 20; i++) {
      ctx.globalAlpha = 0.6 + random() * 0.4;
      const side = i % 3 === 0 ? random() : i % 2 ? random() * 0.24 : 0.76 + random() * 0.24;
      const y = i % 3 === 0 ? random() * 0.16 : random();
      sparkle(ctx, side * w, y * h, w * (0.012 + random() * 0.035), '#FFFFFF');
    }
    ctx.globalAlpha = 1;
  },
  stars(ctx, w, h) {
    const random = seeded(13);
    for (let i = 0; i < 12; i++) {
      const x = (i % 2 ? random() * 0.22 : 0.78 + random() * 0.22) * w;
      ctx.globalAlpha = 0.85;
      star(ctx, x, random() * h, w * (0.02 + random() * 0.03), ['#FFE45C', '#FFFFFF', '#FF9DE2'][i % 3], random());
    }
    ctx.globalAlpha = 1;
  },
  bokeh(ctx, w, h) {
    const random = seeded(17);
    const colors = ['255,190,220', '255,235,170', '190,220,255', '255,255,255'];
    for (let i = 0; i < 14; i++) {
      const x = random() * w;
      const y = random() * h;
      const r = w * (0.03 + random() * 0.07);
      const glow = ctx.createRadialGradient(x, y, r * 0.6, x, y, r);
      const color = colors[i % 4];
      glow.addColorStop(0, `rgba(${color},0.26)`);
      glow.addColorStop(0.9, `rgba(${color},0.34)`);
      glow.addColorStop(1, `rgba(${color},0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  leak(ctx, w, h) {
    const left = ctx.createRadialGradient(0, h * 0.3, 0, 0, h * 0.3, w * 0.62);
    left.addColorStop(0, 'rgba(255,120,40,0.7)');
    left.addColorStop(0.5, 'rgba(255,60,90,0.28)');
    left.addColorStop(1, 'rgba(255,60,90,0)');
    ctx.fillStyle = left;
    ctx.fillRect(0, 0, w, h);
    const right = ctx.createRadialGradient(w, h, 0, w, h, w * 0.45);
    right.addColorStop(0, 'rgba(255,214,90,0.55)');
    right.addColorStop(1, 'rgba(255,214,90,0)');
    ctx.fillStyle = right;
    ctx.fillRect(0, 0, w, h);
  },
  rainbow(ctx, w, h) {
    const band = ctx.createLinearGradient(0, 0, w, h * 0.7);
    const colors = ['255,80,120', '255,180,70', '255,240,110', '110,240,150', '90,190,255', '190,120,255'];
    colors.forEach((color, i) => band.addColorStop(i / (colors.length - 1), `rgba(${color},0.34)`));
    ctx.fillStyle = band;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.04);
    ctx.lineTo(w * 0.42, 0);
    ctx.lineTo(0, h * 0.82);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w, h * 0.2);
    ctx.lineTo(w, h);
    ctx.lineTo(w * 0.72, h);
    ctx.closePath();
    ctx.fill();
  },
  grain(ctx, w, h) {
    const random = seeded(23);
    const count = Math.round((w * h) / 110);
    for (let i = 0; i < count; i++) {
      ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.16)';
      ctx.fillRect(random() * w, random() * h, 1.5, 1.5);
    }
  },
  vignette(ctx, w, h) {
    const shade = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.34, w / 2, h / 2, Math.hypot(w, h) * 0.56);
    shade.addColorStop(0, 'rgba(0,0,0,0)');
    shade.addColorStop(1, 'rgba(0,0,0,0.62)');
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, w, h);
  },
  snow(ctx, w, h) {
    const random = seeded(29);
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 90; i++) {
      ctx.globalAlpha = 0.45 + random() * 0.55;
      ctx.beginPath();
      ctx.arc(random() * w, random() * h, w * (0.002 + random() * 0.008), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  },
  petals(ctx, w, h) {
    const random = seeded(31);
    for (let i = 0; i < 34; i++) {
      ctx.save();
      const x = (i % 3 === 0 ? random() : i % 2 ? random() * 0.26 : 0.74 + random() * 0.26) * w;
      ctx.translate(x, random() * h);
      ctx.rotate(random() * 6);
      ctx.fillStyle = i % 2 ? 'rgba(255,170,200,0.86)' : 'rgba(255,214,228,0.9)';
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 0.016, w * 0.009, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },
  halftone(ctx, w, h) {
    const step = w / 64;
    ctx.fillStyle = 'rgba(20,20,20,0.24)';
    for (let y = 0, row = 0; y < h; y += step, row++) {
      for (let x = row % 2 ? step / 2 : 0; x < w; x += step) {
        const edge = Math.hypot((x - w / 2) / w, (y - h / 2) / h);
        const r = step * 0.46 * Math.min(1, edge * 1.5);
        if (r > 0.4) {
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  },
};

export function paintFilterOverlay(overlay: FilterOverlay, ctx: Ctx, w: number, h: number) {
  ctx.save();
  painters[overlay](ctx, w, h);
  ctx.restore();
}

const NUMBER = /(grayscale|sepia|saturate|hue-rotate|brightness|contrast)\(([-\d.]+)(%|deg)?\)/g;

/** Safari belum mendukung ctx.filter, jadi filter dihitung langsung per piksel di sana. */
export function applyCssFilterToPixels(ctx: Ctx, w: number, h: number, filter: string) {
  const steps = Array.from(filter.matchAll(NUMBER)).map((m) => ({
    name: m[1],
    amount: m[3] === '%' ? Number(m[2]) / 100 : Number(m[2]),
  }));
  if (!steps.length) return;

  // Semua filter warna bisa digabung menjadi satu matriks 3x3 dan satu geseran.
  const image = ctx.getImageData(0, 0, w, h);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    for (const { name, amount } of steps) {
      if (name === 'brightness') {
        r *= amount;
        g *= amount;
        b *= amount;
      } else if (name === 'contrast') {
        r = (r - 127.5) * amount + 127.5;
        g = (g - 127.5) * amount + 127.5;
        b = (b - 127.5) * amount + 127.5;
      } else if (name === 'saturate' || name === 'grayscale') {
        const keep = name === 'saturate' ? amount : 1 - amount;
        const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        r = gray + (r - gray) * keep;
        g = gray + (g - gray) * keep;
        b = gray + (b - gray) * keep;
      } else if (name === 'sepia') {
        const sr = 0.393 * r + 0.769 * g + 0.189 * b;
        const sg = 0.349 * r + 0.686 * g + 0.168 * b;
        const sb = 0.272 * r + 0.534 * g + 0.131 * b;
        r += (sr - r) * amount;
        g += (sg - g) * amount;
        b += (sb - b) * amount;
      } else if (name === 'hue-rotate') {
        const a = (amount * Math.PI) / 180;
        const c = Math.cos(a);
        const s = Math.sin(a);
        const nr = r * (0.213 + c * 0.787 - s * 0.213) + g * (0.715 - c * 0.715 - s * 0.715) + b * (0.072 - c * 0.072 + s * 0.928);
        const ng = r * (0.213 - c * 0.213 + s * 0.143) + g * (0.715 + c * 0.285 + s * 0.14) + b * (0.072 - c * 0.072 - s * 0.283);
        const nb = r * (0.213 - c * 0.213 - s * 0.787) + g * (0.715 - c * 0.715 + s * 0.715) + b * (0.072 + c * 0.928 + s * 0.072);
        r = nr;
        g = ng;
        b = nb;
      }
    }
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
  ctx.putImageData(image, 0, 0);
}
