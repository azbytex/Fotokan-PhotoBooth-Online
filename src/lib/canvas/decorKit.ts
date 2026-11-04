import { DecorId } from '../types';

export interface PhotoSlot {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type Ctx = CanvasRenderingContext2D;
export type Painter = (ctx: Ctx, w: number, h: number, slots: PhotoSlot[]) => void;
export type DecorSet = Partial<Record<DecorId, Painter>>;

// Generator acak dengan seed, supaya frame terlihat sama di pratinjau dan hasil unduhan.
export function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function withState(ctx: Ctx, draw: () => void) {
  ctx.save();
  draw();
  ctx.restore();
}

export function verticalGradient(ctx: Ctx, h: number, stops: [number, string][]) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  stops.forEach(([at, color]) => g.addColorStop(at, color));
  return g;
}

export function webFan(ctx: Ctx, cx: number, cy: number, radius: number, from: number, to: number, spokes: number, rings: number, color: string, lineWidth: number) {
  const point = (r: number, i: number) => {
    const angle = from + ((to - from) * i) / (spokes - 1);
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
  };
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  for (let i = 0; i < spokes; i++) {
    const [x, y] = point(radius, i);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  for (let ring = 1; ring <= rings; ring++) {
    const r = (radius * ring) / rings;
    for (let i = 0; i < spokes - 1; i++) {
      const [x1, y1] = point(r, i);
      const [x2, y2] = point(r, i + 1);
      const midAngle = from + ((to - from) * (i + 0.5)) / (spokes - 1);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(cx + Math.cos(midAngle) * r * 0.86, cy + Math.sin(midAngle) * r * 0.86, x2, y2);
      ctx.stroke();
    }
  }
}

export function spider(ctx: Ctx, x: number, y: number, size: number, color: string) {
  withState(ctx, () => {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = size * 0.1;
    ctx.lineCap = 'round';
    for (const side of [-1, 1]) {
      for (let i = 0; i < 4; i++) {
        const lift = -0.7 + i * 0.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + side * size * 0.8, y + lift * size * 0.9, x + side * size * 1.15, y + (lift + 0.45) * size);
        ctx.stroke();
      }
    }
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.1, size * 0.34, size * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y - size * 0.42, size * 0.22, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function burst(ctx: Ctx, x: number, y: number, radius: number, fill: string, text: string, rotation: number) {
  withState(ctx, () => {
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    const points = 13;
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? radius : radius * 0.68;
      const angle = (Math.PI * i) / points;
      ctx.lineTo(Math.cos(angle) * r * 1.25, Math.sin(angle) * r);
    }
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#111111';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${radius * 0.62}px Bangers, Impact, sans-serif`;
    ctx.fillText(text, 0, 2);
  });
}

export function flower(ctx: Ctx, x: number, y: number, r: number, color: string, centre: string, petals = 6) {
  withState(ctx, () => {
    ctx.translate(x, y);
    ctx.fillStyle = color;
    for (let i = 0; i < petals; i++) {
      ctx.rotate((Math.PI * 2) / petals);
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.62, r * 0.36, r * 0.62, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = centre;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.26, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function leaf(ctx: Ctx, x: number, y: number, length: number, angle: number, color: string, rib: string) {
  withState(ctx, () => {
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(length * 0.3, -length * 0.34, length * 0.78, -length * 0.26, length, 0);
    ctx.bezierCurveTo(length * 0.78, length * 0.26, length * 0.3, length * 0.34, 0, 0);
    ctx.fill();
    ctx.strokeStyle = rib;
    ctx.lineWidth = Math.max(1.5, length * 0.016);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length * 0.94, 0);
    for (let i = 1; i < 5; i++) {
      const px = (length * i) / 5.2;
      const spread = length * 0.17 * Math.sin((Math.PI * i) / 5);
      ctx.moveTo(px, 0);
      ctx.lineTo(px + spread, -spread);
      ctx.moveTo(px, 0);
      ctx.lineTo(px + spread, spread);
    }
    ctx.stroke();
  });
}

export function cloud(ctx: Ctx, x: number, y: number, s: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 30 * s, 0, Math.PI * 2);
  ctx.arc(x + 36 * s, y - 16 * s, 38 * s, 0, Math.PI * 2);
  ctx.arc(x + 80 * s, y, 32 * s, 0, Math.PI * 2);
  ctx.rect(x - 2 * s, y, 84 * s, 30 * s);
  ctx.fill();
}

export function pixelArt(ctx: Ctx, x: number, y: number, unit: number, rows: string[], palette: Record<string, string>) {
  rows.forEach((row, ry) => {
    row.split('').forEach((cell, rx) => {
      if (palette[cell]) {
        ctx.fillStyle = palette[cell];
        ctx.fillRect(x + rx * unit, y + ry * unit, unit, unit);
      }
    });
  });
}

export const PIXEL_HEART = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];
export const PIXEL_COIN = ['..YYY..', '.YWYYY.', 'YWYYYOY', 'YWYYYOY', 'YWYYYOY', '.YYYOO.', '..OOO..'];
export const PIXEL_ALIEN = ['..G.....G..', '...G...G...', '..GGGGGGG..', '.GG.GGG.GG.', 'GGGGGGGGGGG', 'G.GGGGGGG.G', 'G.G.....G.G', '...GG.GG...'];

export function balloon(ctx: Ctx, x: number, y: number, r: number, color: string) {
  withState(ctx, () => {
    ctx.strokeStyle = '#7A6A58';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + r * 1.25);
    ctx.bezierCurveTo(x - 16, y + r * 2, x + 16, y + r * 2.4, x, y + r * 3.1);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 1.22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 8, y + r * 1.3);
    ctx.lineTo(x + 8, y + r * 1.3);
    ctx.lineTo(x, y + r * 1.16);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.ellipse(x - r * 0.34, y - r * 0.42, r * 0.17, r * 0.3, 0.5, 0, Math.PI * 2);
    ctx.fill();
  });
}

