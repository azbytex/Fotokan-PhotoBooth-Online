import { cloud, Ctx, DecorSet, flower, leaf, PhotoSlot, seeded, verticalGradient, withState } from './decorKit';

/* Bentuk kecil yang dipakai bersama */

export function heart(ctx: Ctx, x: number, y: number, s: number, color: string, rotation = 0, outline?: string) {
  withState(ctx, () => {
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.moveTo(0, s * 0.32);
    ctx.bezierCurveTo(-s * 0.1, s * 0.05, -s * 0.62, -s * 0.05, -s * 0.5, -s * 0.36);
    ctx.bezierCurveTo(-s * 0.4, -s * 0.62, -s * 0.08, -s * 0.56, 0, -s * 0.26);
    ctx.bezierCurveTo(s * 0.08, -s * 0.56, s * 0.4, -s * 0.62, s * 0.5, -s * 0.36);
    ctx.bezierCurveTo(s * 0.62, -s * 0.05, s * 0.1, s * 0.05, 0, s * 0.32);
    ctx.closePath();
    if (outline) {
      ctx.lineWidth = Math.max(3, s * 0.12);
      ctx.strokeStyle = outline;
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
    ctx.fillStyle = color;
    ctx.fill();
  });
}

export function star(ctx: Ctx, x: number, y: number, r: number, color: string, rotation = 0, inner = 0.46) {
  withState(ctx, () => {
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 ? r * inner : r;
      const a = -Math.PI / 2 + (Math.PI * i) / 5;
      ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
    }
    ctx.closePath();
    ctx.fill();
  });
}

export function sparkle(ctx: Ctx, x: number, y: number, r: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
}

export function bow(ctx: Ctx, x: number, y: number, s: number, color: string, dark: string, rotation = 0) {
  withState(ctx, () => {
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = dark;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * s * 0.06, s * 0.08);
      ctx.quadraticCurveTo(side * s * 0.34, s * 0.5, side * s * 0.3, s * 0.92);
      ctx.lineTo(side * s * 0.12, s * 0.76);
      ctx.quadraticCurveTo(side * s * 0.14, s * 0.4, -side * s * 0.03, s * 0.12);
      ctx.fill();
    }
    ctx.fillStyle = color;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(side * s * 0.3, -s * 0.5, side * s * 0.9, -s * 0.46, side * s * 0.84, 0);
      ctx.bezierCurveTo(side * s * 0.9, s * 0.42, side * s * 0.3, s * 0.42, 0, 0);
      ctx.fill();
    }
    ctx.strokeStyle = dark;
    ctx.lineWidth = Math.max(1.5, s * 0.035);
    ctx.lineCap = 'round';
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * s * 0.2, -s * 0.03);
      ctx.quadraticCurveTo(side * s * 0.46, -s * 0.2, side * s * 0.62, -s * 0.14);
      ctx.moveTo(side * s * 0.2, s * 0.04);
      ctx.quadraticCurveTo(side * s * 0.44, s * 0.16, side * s * 0.6, s * 0.1);
      ctx.stroke();
    }
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.roundRect(-s * 0.13, -s * 0.15, s * 0.26, s * 0.3, s * 0.09);
    ctx.fill();
  });
}

function strawberry(ctx: Ctx, x: number, y: number, s: number, rotation = 0) {
  withState(ctx, () => {
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = '#F2415F';
    ctx.beginPath();
    ctx.moveTo(0, s * 0.62);
    ctx.bezierCurveTo(-s * 0.62, s * 0.2, -s * 0.54, -s * 0.34, 0, -s * 0.32);
    ctx.bezierCurveTo(s * 0.54, -s * 0.34, s * 0.62, s * 0.2, 0, s * 0.62);
    ctx.fill();
    ctx.fillStyle = '#FFE28A';
    for (const [dx, dy] of [[-0.22, -0.08], [0.2, -0.1], [0, 0.08], [-0.2, 0.2], [0.2, 0.2], [0, 0.38]]) {
      ctx.beginPath();
      ctx.ellipse(dx * s, dy * s, s * 0.035, s * 0.055, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#4FA653';
    for (let i = -2; i <= 2; i++) {
      withState(ctx, () => {
        ctx.translate(0, -s * 0.32);
        ctx.rotate(i * 0.55);
        ctx.beginPath();
        ctx.ellipse(0, -s * 0.09, s * 0.075, s * 0.17, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  });
}

function cherries(ctx: Ctx, x: number, y: number, s: number, rotation = 0) {
  withState(ctx, () => {
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.strokeStyle = '#3F8A47';
    ctx.lineWidth = Math.max(2, s * 0.07);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-s * 0.32, s * 0.2);
    ctx.quadraticCurveTo(-s * 0.2, -s * 0.34, s * 0.1, -s * 0.56);
    ctx.moveTo(s * 0.34, s * 0.2);
    ctx.quadraticCurveTo(s * 0.32, -s * 0.2, s * 0.1, -s * 0.56);
    ctx.stroke();
    ctx.fillStyle = '#4FA653';
    ctx.beginPath();
    ctx.ellipse(s * 0.3, -s * 0.54, s * 0.22, s * 0.09, 0.3, 0, Math.PI * 2);
    ctx.fill();
    for (const dx of [-0.32, 0.34]) {
      ctx.fillStyle = '#D81B4A';
      ctx.beginPath();
      ctx.arc(dx * s, s * 0.4, s * 0.29, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath();
      ctx.ellipse((dx - 0.09) * s, s * 0.3, s * 0.05, s * 0.09, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function butterfly(ctx: Ctx, x: number, y: number, s: number, top: string, bottom: string, rotation = 0) {
  withState(ctx, () => {
    ctx.translate(x, y);
    ctx.rotate(rotation);
    for (const side of [-1, 1]) {
      ctx.fillStyle = top;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.08);
      ctx.bezierCurveTo(side * s * 0.34, -s * 0.76, side * s * 1, -s * 0.6, side * s * 0.82, -s * 0.06);
      ctx.bezierCurveTo(side * s * 0.72, s * 0.12, side * s * 0.26, s * 0.08, 0, 0);
      ctx.fill();
      ctx.fillStyle = bottom;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(side * s * 0.4, s * 0.02, side * s * 0.72, s * 0.28, side * s * 0.5, s * 0.56);
      ctx.bezierCurveTo(side * s * 0.34, s * 0.72, side * s * 0.08, s * 0.4, 0, s * 0.08);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.72)';
      ctx.beginPath();
      ctx.arc(side * s * 0.56, -s * 0.28, s * 0.09, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#3E2D5C';
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.06, s * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3E2D5C';
    ctx.lineWidth = Math.max(1.5, s * 0.03);
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.28);
      ctx.quadraticCurveTo(side * s * 0.08, -s * 0.5, side * s * 0.24, -s * 0.54);
      ctx.stroke();
    }
  });
}

export function crown(ctx: Ctx, x: number, y: number, s: number, gold: string, gem: string) {
  withState(ctx, () => {
    ctx.translate(x, y);
    ctx.fillStyle = gold;
    ctx.beginPath();
    ctx.moveTo(-s, s * 0.5);
    ctx.lineTo(-s * 1.08, -s * 0.34);
    ctx.lineTo(-s * 0.5, s * 0.06);
    ctx.lineTo(0, -s * 0.62);
    ctx.lineTo(s * 0.5, s * 0.06);
    ctx.lineTo(s * 1.08, -s * 0.34);
    ctx.lineTo(s, s * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = gem;
    for (const [dx, dy, r] of [[-1.08, -0.42, 0.12], [0, -0.7, 0.14], [1.08, -0.42, 0.12], [-0.46, 0.3, 0.09], [0, 0.3, 0.11], [0.46, 0.3, 0.09]]) {
      ctx.beginPath();
      ctx.arc(dx * s, dy * s, r * s, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function daisy(ctx: Ctx, x: number, y: number, r: number) {
  flower(ctx, x, y, r, '#FFFFFF', '#FFC928', 9);
}

function pawPrint(ctx: Ctx, x: number, y: number, s: number, color: string, rotation = 0) {
  withState(ctx, () => {
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, s * 0.18, s * 0.34, s * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    for (const [dx, dy] of [[-0.36, -0.1], [-0.13, -0.32], [0.13, -0.32], [0.36, -0.1]]) {
      ctx.beginPath();
      ctx.ellipse(dx * s, dy * s, s * 0.11, s * 0.15, dx, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function eye(ctx: Ctx, x: number, y: number, r: number, ink = '#2A1E1A') {
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x - r * 0.3, y - r * 0.35, r * 0.34, 0, Math.PI * 2);
  ctx.fill();
}

function blush(ctx: Ctx, x: number, y: number, r: number, color = 'rgba(255,120,150,0.6)') {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.62, 0, 0, Math.PI * 2);
  ctx.fill();
}

/* Pola merata di tepi strip. Baris selang-seling dengan sedikit geser agar tidak kaku. */
function scatter(w: number, h: number, step: number, seed: number, draw: (x: number, y: number, i: number, random: () => number) => void) {
  const random = seeded(seed);
  let i = 0;
  for (let row = 0, y = step / 2; y < h + step; y += step, row++) {
    for (let x = row % 2 ? step / 2 : 0; x < w + step; x += step) {
      draw(x + (random() - 0.5) * step * 0.28, y + (random() - 0.5) * step * 0.28, i++, random);
    }
  }
}

function fill(ctx: Ctx, w: number, h: number, color: string | CanvasGradient) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
}

function softChecks(ctx: Ctx, w: number, h: number, size: number, color: string) {
  ctx.fillStyle = color;
  for (let y = 0, r = 0; y < h; y += size, r++) {
    for (let x = r % 2 ? size : 0; x < w; x += size * 2) ctx.fillRect(x, y, size, size);
  }
}

function corners(w: number, h: number, inset: number) {
  return [
    [inset, inset, 1, 1],
    [w - inset, inset, -1, 1],
    [inset, h - 150, 1, -1],
    [w - inset, h - 150, -1, -1],
  ];
}

/* Telinga dan kaki hewan yang menempel di setiap foto */

function catEarsOn(ctx: Ctx, slot: PhotoSlot, fur: string, inner: string, outline?: string) {
  const size = Math.min(52, slot.w * 0.13);
  for (const side of [-1, 1]) {
    const cx = slot.x + slot.w / 2 + side * slot.w * 0.32;
    ctx.fillStyle = fur;
    ctx.beginPath();
    ctx.moveTo(cx - size, slot.y + 8);
    ctx.quadraticCurveTo(cx + side * size * 0.18, slot.y - size * 1.5, cx + side * size * 0.34, slot.y - size * 0.94);
    ctx.quadraticCurveTo(cx + side * size * 0.8, slot.y - size * 0.4, cx + size, slot.y + 8);
    ctx.closePath();
    if (outline) {
      ctx.strokeStyle = outline;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.fill();
    ctx.fillStyle = inner;
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.5, slot.y);
    ctx.quadraticCurveTo(cx + side * size * 0.14, slot.y - size * 0.96, cx + side * size * 0.26, slot.y - size * 0.6);
    ctx.quadraticCurveTo(cx + side * size * 0.48, slot.y - size * 0.26, cx + size * 0.5, slot.y);
    ctx.closePath();
    ctx.fill();
  }
}

function bunnyEarsOn(ctx: Ctx, slot: PhotoSlot, fur: string, inner: string) {
  const height = Math.min(60, slot.h * 0.2);
  for (const side of [-1, 1]) {
    const cx = slot.x + slot.w / 2 + side * slot.w * 0.17;
    withState(ctx, () => {
      ctx.translate(cx, slot.y + 8);
      ctx.rotate(side * 0.2);
      ctx.fillStyle = fur;
      ctx.beginPath();
      ctx.ellipse(0, -height * 0.52, height * 0.34, height * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = inner;
      ctx.beginPath();
      ctx.ellipse(0, -height * 0.5, height * 0.16, height * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

function roundEarsOn(ctx: Ctx, slot: PhotoSlot, fur: string, inner: string) {
  const r = Math.min(32, slot.w * 0.08);
  for (const side of [-1, 1]) {
    const cx = slot.x + slot.w / 2 + side * slot.w * 0.3;
    ctx.fillStyle = fur;
    ctx.beginPath();
    ctx.arc(cx, slot.y - r * 0.2, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = inner;
    ctx.beginPath();
    ctx.arc(cx, slot.y - r * 0.2, r * 0.56, 0, Math.PI * 2);
    ctx.fill();
  }
}

function pawsOn(ctx: Ctx, slot: PhotoSlot, fur: string, pad: string, outline: string) {
  const y = slot.y + slot.h;
  const r = Math.min(23, slot.w * 0.055);
  for (const side of [-1, 1]) {
    const cx = slot.x + slot.w / 2 + side * slot.w * 0.33;
    ctx.fillStyle = fur;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(cx - r, y - r * 1.15, r * 2, r * 1.9, r);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = pad;
    for (const dx of [-0.48, 0, 0.48]) {
      ctx.beginPath();
      ctx.arc(cx + dx * r, y - r * 0.55, r * 0.17, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function peekFace(
  ctx: Ctx,
  x: number,
  y: number,
  r: number,
  kind: 'cat' | 'bear' | 'panda',
  fur: string,
  inner: string
) {
  withState(ctx, () => {
    if (kind === 'cat') {
      for (const side of [-1, 1]) {
        ctx.fillStyle = fur;
        ctx.beginPath();
        ctx.moveTo(x + side * r * 0.95, y - r * 0.2);
        ctx.lineTo(x + side * r * 0.82, y - r * 1.2);
        ctx.lineTo(x + side * r * 0.15, y - r * 0.8);
        ctx.fill();
        ctx.fillStyle = inner;
        ctx.beginPath();
        ctx.moveTo(x + side * r * 0.76, y - r * 0.5);
        ctx.lineTo(x + side * r * 0.7, y - r * 0.98);
        ctx.lineTo(x + side * r * 0.36, y - r * 0.76);
        ctx.fill();
      }
    } else {
      for (const side of [-1, 1]) {
        ctx.fillStyle = kind === 'panda' ? '#1E1E20' : fur;
        ctx.beginPath();
        ctx.arc(x + side * r * 0.76, y - r * 0.78, r * 0.36, 0, Math.PI * 2);
        ctx.fill();
        if (kind === 'bear') {
          ctx.fillStyle = inner;
          ctx.beginPath();
          ctx.arc(x + side * r * 0.76, y - r * 0.78, r * 0.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.fillStyle = fur;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.92, 0, 0, Math.PI * 2);
    ctx.fill();
    if (kind === 'panda') {
      for (const side of [-1, 1]) {
        ctx.fillStyle = '#1E1E20';
        ctx.beginPath();
        ctx.ellipse(x + side * r * 0.38, y - r * 0.08, r * 0.24, r * 0.3, side * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (kind === 'bear') {
      ctx.fillStyle = inner;
      ctx.beginPath();
      ctx.ellipse(x, y + r * 0.26, r * 0.42, r * 0.34, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    const eyeInk = kind === 'panda' ? '#FFFFFF' : '#2A1E1A';
    for (const side of [-1, 1]) {
      ctx.fillStyle = eyeInk;
      ctx.beginPath();
      ctx.arc(x + side * r * 0.38, y - r * 0.08, r * 0.1, 0, Math.PI * 2);
      ctx.fill();
      if (kind !== 'panda') blush(ctx, x + side * r * 0.62, y + r * 0.2, r * 0.17);
    }
    ctx.fillStyle = '#2A1E1A';
    ctx.beginPath();
    ctx.ellipse(x, y + r * 0.14, r * 0.09, r * 0.065, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2A1E1A';
    ctx.lineWidth = Math.max(1.6, r * 0.04);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(x - r * 0.1, y + r * 0.22, r * 0.1, 0.1, Math.PI - 0.3);
    ctx.arc(x + r * 0.1, y + r * 0.22, r * 0.1, 0.3, Math.PI - 0.1);
    ctx.stroke();
    if (kind === 'cat') {
      for (const side of [-1, 1]) {
        for (const lift of [-0.08, 0.1]) {
          ctx.beginPath();
          ctx.moveTo(x + side * r * 0.56, y + r * 0.2);
          ctx.lineTo(x + side * r * 1.16, y + r * (0.2 + lift * 1.5));
          ctx.stroke();
        }
      }
    }
  });
}

function duck(ctx: Ctx, x: number, y: number, s: number, flip = 1) {
  withState(ctx, () => {
    ctx.translate(x, y);
    ctx.scale(flip, 1);
    ctx.fillStyle = '#FFD93B';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.2, s * 0.6, s * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-s * 0.5, s * 0.2);
    ctx.lineTo(-s * 0.84, -s * 0.06);
    ctx.lineTo(-s * 0.34, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s * 0.36, -s * 0.24, s * 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FF8A1F';
    ctx.beginPath();
    ctx.ellipse(s * 0.74, -s * 0.2, s * 0.17, s * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    eye(ctx, s * 0.44, -s * 0.3, s * 0.055);
    ctx.fillStyle = '#F0BD1E';
    ctx.beginPath();
    ctx.ellipse(-s * 0.08, s * 0.22, s * 0.28, s * 0.17, -0.2, 0, Math.PI * 2);
    ctx.fill();
  });
}

function donut(ctx: Ctx, x: number, y: number, r: number, icing: string, seed: number) {
  ctx.fillStyle = '#D9A066';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = icing;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.86, 0, Math.PI * 2);
  ctx.fill();
  const random = seeded(seed);
  for (let i = 0; i < 9; i++) {
    const a = random() * Math.PI * 2;
    const d = r * (0.46 + random() * 0.32);
    ctx.fillStyle = ['#FFFFFF', '#FFE14D', '#5CC8FF', '#FF6FAE'][i % 4];
    ctx.fillRect(x + Math.cos(a) * d - 1.5, y + Math.sin(a) * d - 1.5, r * 0.2, r * 0.07);
  }
  ctx.fillStyle = '#FFF8EC';
  ctx.beginPath();
  ctx.arc(x, y, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

function iceCream(ctx: Ctx, x: number, y: number, s: number, scoop: string, rotation = 0) {
  withState(ctx, () => {
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = '#E2A766';
    ctx.beginPath();
    ctx.moveTo(-s * 0.36, 0);
    ctx.lineTo(s * 0.36, 0);
    ctx.lineTo(0, s * 0.9);
    ctx.fill();
    ctx.fillStyle = scoop;
    ctx.beginPath();
    ctx.arc(0, -s * 0.16, s * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#D81B4A';
    ctx.beginPath();
    ctx.arc(0, -s * 0.62, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
  });
}

function lollipop(ctx: Ctx, x: number, y: number, r: number, a: string, b: string, rotation = 0) {
  withState(ctx, () => {
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-r * 0.09, 0, r * 0.18, r * 2.3);
    ctx.fillStyle = a;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = b;
    ctx.lineWidth = r * 0.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let t = 0; t < 14; t += 0.3) {
      const radius = (r * 0.82 * t) / 14;
      ctx.lineTo(Math.cos(t) * radius, Math.sin(t) * radius);
    }
    ctx.stroke();
  });
}

function bobaCup(ctx: Ctx, x: number, y: number, s: number, rotation = 0) {
  withState(ctx, () => {
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = '#F7F1EA';
    ctx.strokeStyle = '#7A4F36';
    ctx.lineWidth = Math.max(2.5, s * 0.05);
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(-s * 0.46, -s * 0.5);
    ctx.lineTo(s * 0.46, -s * 0.5);
    ctx.lineTo(s * 0.34, s * 0.7);
    ctx.lineTo(-s * 0.34, s * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#C89A72';
    ctx.beginPath();
    ctx.moveTo(-s * 0.43, -s * 0.22);
    ctx.lineTo(s * 0.43, -s * 0.22);
    ctx.lineTo(s * 0.335, s * 0.68);
    ctx.lineTo(-s * 0.335, s * 0.68);
    ctx.fill();
    ctx.fillStyle = '#3B2417';
    for (const [dx, dy] of [[-0.2, 0.56], [0, 0.58], [0.2, 0.56], [-0.11, 0.42], [0.1, 0.42], [-0.22, 0.32], [0.23, 0.3]]) {
      ctx.beginPath();
      ctx.arc(dx * s, dy * s, s * 0.08, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = '#FF7FA8';
    ctx.lineWidth = s * 0.11;
    ctx.beginPath();
    ctx.moveTo(s * 0.1, s * 0.3);
    ctx.lineTo(s * 0.26, -s * 0.98);
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#7A4F36';
    ctx.lineWidth = Math.max(2.5, s * 0.05);
    ctx.beginPath();
    ctx.roundRect(-s * 0.53, -s * 0.62, s * 1.06, s * 0.14, s * 0.06);
    ctx.fill();
    ctx.stroke();
    eye(ctx, -s * 0.16, s * 0.08, s * 0.05);
    eye(ctx, s * 0.16, s * 0.08, s * 0.05);
    blush(ctx, -s * 0.27, s * 0.2, s * 0.06);
    blush(ctx, s * 0.27, s * 0.2, s * 0.06);
  });
}

/* Latar frame */

export const underCute: DecorSet = {
  ribbon(ctx, w, h) {
    fill(ctx, w, h, '#FFD9E4');
    scatter(w, h, 62, 3, (x, y, i) => {
      if (i % 3 === 0) heart(ctx, x, y, 15, '#FFF0F5');
      else bow(ctx, x, y, 15, '#FF9BBB', '#F27BA2');
    });
  },
  hearts(ctx, w, h) {
    fill(ctx, w, h, verticalGradient(ctx, h, [[0, '#FF5FA8'], [0.5, '#FF8DC4'], [1, '#FF5FA8']]));
    scatter(w, h, 50, 11, (x, y, i, random) => {
      heart(ctx, x, y, 14 + random() * 15, i % 4 === 0 ? '#FFFFFF' : '#FFC1DE', (random() - 0.5) * 0.7);
    });
  },
  catEars(ctx, w, h) {
    fill(ctx, w, h, '#FFF1F5');
    scatter(w, h, 58, 6, (x, y, i, random) => {
      pawPrint(ctx, x, y, 19, i % 2 ? '#FFC2D4' : '#FFD9E4', (random() - 0.5) * 0.9);
    });
  },
  bunnyEars(ctx, w, h) {
    fill(ctx, w, h, verticalGradient(ctx, h, [[0, '#E6D8FF'], [1, '#F6E9FF']]));
    scatter(w, h, 46, 18, (x, y, i, random) => {
      if (i % 3 === 0) sparkle(ctx, x, y, 8 + random() * 5, '#FFFFFF');
      else {
        ctx.fillStyle = '#CDB7F5';
        ctx.beginPath();
        ctx.arc(x, y, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  },
  strawberryMilk(ctx, w, h) {
    fill(ctx, w, h, '#FFE7EE');
    softChecks(ctx, w, h, 28, '#FFF4F7');
    scatter(w, h, 74, 2, (x, y, _i, random) => strawberry(ctx, x, y, 26, (random() - 0.5) * 0.8));
  },
  teddy(ctx, w, h) {
    fill(ctx, w, h, '#EAD6BC');
    scatter(w, h, 54, 9, (x, y, i, random) => {
      if (i % 2) heart(ctx, x, y, 14, '#D9B58F', (random() - 0.5) * 0.5);
      else {
        ctx.fillStyle = '#F5E9D8';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  },
  cherry(ctx, w, h) {
    fill(ctx, w, h, '#FFFFFF');
    const size = 26;
    ctx.fillStyle = 'rgba(255,120,160,0.34)';
    for (let x = 0; x < w; x += size * 2) ctx.fillRect(x, 0, size, h);
    for (let y = 0; y < h; y += size * 2) ctx.fillRect(0, y, w, size);
    scatter(w, h, 110, 14, (x, y, _i, random) => cherries(ctx, x, y, 26, (random() - 0.5) * 0.6));
  },
  butterflyLilac(ctx, w, h) {
    fill(ctx, w, h, verticalGradient(ctx, h, [[0, '#C9B6FF'], [0.5, '#E7C8FF'], [1, '#B5C7FF']]));
    scatter(w, h, 68, 27, (x, y, i, random) => {
      if (i % 2) butterfly(ctx, x, y, 17, '#F4E8FF', '#D9C3FF', (random() - 0.5) * 0.9);
      else sparkle(ctx, x, y, 8, '#FFFFFF');
    });
  },
  glitterStar(ctx, w, h) {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#FF9DE2');
    g.addColorStop(0.35, '#C7A6FF');
    g.addColorStop(0.65, '#8FE3FF');
    g.addColorStop(1, '#FFB3EC');
    fill(ctx, w, h, g);
    const random = seeded(34);
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < Math.round((w * h) / 1300); i++) {
      ctx.globalAlpha = 0.25 + random() * 0.65;
      ctx.fillRect(random() * w, random() * h, 2.5, 2.5);
    }
    ctx.globalAlpha = 1;
    scatter(w, h, 84, 35, (x, y, _i, r) => sparkle(ctx, x, y, 9 + r() * 12, '#FFFFFF'));
  },
  princess(ctx, w, h) {
    fill(ctx, w, h, verticalGradient(ctx, h, [[0, '#F1E0FF'], [1, '#FFE2F1']]));
    scatter(w, h, 64, 40, (x, y, i) => {
      if (i % 3 === 0) crown(ctx, x, y, 11, '#E7BE5A', '#FF8FB8');
      else sparkle(ctx, x, y, 8, '#E7BE5A');
    });
  },
  daisyField(ctx, w, h) {
    fill(ctx, w, h, '#FFF2AE');
    softChecks(ctx, w, h, 36, '#FFF8D2');
    scatter(w, h, 70, 44, (x, y, _i, random) => daisy(ctx, x, y, 19 + random() * 6));
  },
  rainbowCloud(ctx, w, h) {
    fill(ctx, w, h, verticalGradient(ctx, h, [[0, '#CDEEFF'], [0.6, '#EADFFF'], [1, '#FFE1EF']]));
    const random = seeded(52);
    for (let i = 0; i < Math.round(h / 130); i++) {
      cloud(ctx, random() * w - 50, random() * h, 0.5 + random() * 0.45, 'rgba(255,255,255,0.85)');
    }
  },
  candyStripe(ctx, w, h) {
    fill(ctx, w, h, '#FFFFFF');
    ctx.fillStyle = '#FF8BB8';
    const band = 38;
    for (let x = -h; x < w + h; x += band * 2) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + band, 0);
      ctx.lineTo(x + band + h, h);
      ctx.lineTo(x + h, h);
      ctx.fill();
    }
  },
  bobaMilk(ctx, w, h) {
    fill(ctx, w, h, verticalGradient(ctx, h, [[0, '#F7EBDD'], [1, '#D8B38F']]));
    const random = seeded(59);
    for (let i = 0; i < Math.round((w * h) / 2600); i++) {
      const depth = random();
      const y = h * Math.pow(depth, 0.45);
      ctx.fillStyle = `rgba(59,36,23,${0.25 + depth * 0.7})`;
      ctx.beginPath();
      ctx.arc(random() * w, y, 7 + random() * 6, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  orangeCat(ctx, w, h) {
    fill(ctx, w, h, '#F7A041');
    ctx.fillStyle = '#D9771F';
    for (let y = 0; y < h; y += 92) {
      for (const side of [0, 1]) {
        ctx.beginPath();
        const edge = side ? w : 0;
        const dir = side ? -1 : 1;
        ctx.moveTo(edge, y);
        ctx.quadraticCurveTo(edge + dir * 58, y + 16, edge + dir * 96, y + 34);
        ctx.quadraticCurveTo(edge + dir * 52, y + 34, edge, y + 42);
        ctx.fill();
      }
    }
  },
  dino(ctx, w, h) {
    fill(ctx, w, h, '#86D16E');
    ctx.fillStyle = '#6DBB58';
    scatter(w, h, 44, 66, (x, y, _i, random) => {
      ctx.beginPath();
      ctx.arc(x, y, 7 + random() * 9, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = '#FFD84D';
    for (let y = 0; y < h; y += 56) {
      for (const side of [0, 1]) {
        const edge = side ? w : 0;
        const dir = side ? -1 : 1;
        ctx.beginPath();
        ctx.moveTo(edge, y);
        ctx.lineTo(edge + dir * 30, y + 28);
        ctx.lineTo(edge, y + 56);
        ctx.fill();
      }
    }
  },
  duckPond(ctx, w, h) {
    fill(ctx, w, h, '#A8E2FF');
    ctx.strokeStyle = '#D6F2FF';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    scatter(w, h, 70, 70, (x, y) => {
      ctx.beginPath();
      ctx.moveTo(x - 20, y);
      ctx.quadraticCurveTo(x - 10, y - 9, x, y);
      ctx.quadraticCurveTo(x + 10, y + 9, x + 20, y);
      ctx.stroke();
    });
  },
  panda(ctx, w, h) {
    fill(ctx, w, h, '#F4F8EC');
    ctx.fillStyle = '#6FB05B';
    for (const x of [14, w - 14]) {
      ctx.fillRect(x - 9, 0, 18, h);
    }
    ctx.fillStyle = '#4F8E3F';
    for (let y = 90; y < h; y += 150) {
      for (const x of [14, w - 14]) ctx.fillRect(x - 11, y, 22, 5);
    }
    for (let y = 60; y < h; y += 150) {
      leaf(ctx, 14, y, 42, -0.55, '#7CC168', '#4F8E3F');
      leaf(ctx, w - 14, y + 70, 42, Math.PI + 0.55, '#7CC168', '#4F8E3F');
    }
  },
  frogPond(ctx, w, h) {
    fill(ctx, w, h, '#74C7A6');
    scatter(w, h, 88, 80, (x, y, i, random) => {
      const a = random() * Math.PI * 2;
      ctx.fillStyle = i % 2 ? '#46A77F' : '#3A9570';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.arc(x, y, 26, a, a + Math.PI * 1.75);
      ctx.fill();
      if (i % 3 === 0) flower(ctx, x, y, 11, '#FFC6DE', '#FFD84D', 8);
    });
  },
  snacks(ctx, w, h) {
    fill(ctx, w, h, '#FFF6E2');
    scatter(w, h, 72, 90, (x, y, i, random) => {
      if (i % 3 === 0) donut(ctx, x, y, 20, i % 2 ? '#FF8FB8' : '#8B5A3C', 90 + i);
      else if (i % 3 === 1) iceCream(ctx, x, y - 8, 22, i % 2 ? '#9FE3D2' : '#FFB5CF', (random() - 0.5) * 0.6);
      else {
        ctx.fillStyle = '#FFD24D';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  },
};

/* Hiasan di atas foto, ditaruh di tepi supaya wajah tetap terlihat */

export const overCute: DecorSet = {
  ribbon(ctx, w, _h, slots) {
    slots.forEach((slot, i) => {
      if (i > 0) bow(ctx, slot.x + slot.w / 2, slot.y, 30, '#FF8BB0', '#EC6A95');
    });
    bow(ctx, w / 2, 40, 62, '#FF7DA8', '#E85C8C');
  },
  hearts(ctx, _w, _h, slots) {
    slots.forEach((slot, i) => {
      heart(ctx, slot.x + slot.w - 16, slot.y + 14, 52, '#FF3D8F', 0.22, '#FFFFFF');
      heart(ctx, slot.x + 18, slot.y + slot.h - 10, 38, i % 2 ? '#FFD84D' : '#FF3D8F', -0.28, '#FFFFFF');
    });
  },
  catEars(ctx, _w, _h, slots) {
    slots.forEach((slot) => {
      catEarsOn(ctx, slot, '#FFFFFF', '#FFA9C4', '#F7B6CB');
      pawsOn(ctx, slot, '#FFFFFF', '#FF9DBC', '#F7B6CB');
    });
  },
  bunnyEars(ctx, _w, _h, slots) {
    slots.forEach((slot) => bunnyEarsOn(ctx, slot, '#FFFFFF', '#FFC2DA'));
    slots.forEach((slot) => bow(ctx, slot.x + slot.w / 2, slot.y + 4, 21, '#B79BFF', '#9478E8'));
  },
  strawberryMilk(ctx, w, h) {
    corners(w, h, 34).forEach(([x, y, dx]) => strawberry(ctx, x, y, 50, dx * 0.3));
    strawberry(ctx, w / 2, 26, 34);
  },
  teddy(ctx, _w, _h, slots) {
    slots.forEach((slot, i) => {
      roundEarsOn(ctx, slot, '#B98858', '#E5C69F');
      if (i % 2) peekFace(ctx, slot.x + slot.w - 58, slot.y + slot.h - 16, 44, 'bear', '#B98858', '#EAD2B0');
      else heart(ctx, slot.x + 26, slot.y + slot.h - 14, 32, '#E8688F', -0.2, '#FFFFFF');
    });
  },
  cherry(ctx, w, h, slots) {
    corners(w, h, 40).forEach(([x, y, dx]) => cherries(ctx, x, y, 56, dx * 0.16));
    slots.forEach((slot) => bow(ctx, slot.x + slot.w / 2, slot.y + 1, 24, '#E8325F', '#BC1B44'));
  },
  butterflyLilac(ctx, _w, _h, slots) {
    slots.forEach((slot, i) => {
      const left = i % 2 === 0;
      butterfly(ctx, left ? slot.x + 8 : slot.x + slot.w - 8, slot.y + 14, 42, '#FF97DF', '#8AA9FF', left ? -0.3 : 0.3);
      butterfly(ctx, left ? slot.x + slot.w - 4 : slot.x + 4, slot.y + slot.h - 12, 26, '#9EEBFF', '#FFC1EE', left ? 0.4 : -0.4);
    });
  },
  glitterStar(ctx, _w, _h, slots) {
    slots.forEach((slot, i) => {
      const right = i % 2 === 0;
      star(ctx, right ? slot.x + slot.w - 12 : slot.x + 12, slot.y + 12, 34, '#FFFFFF', right ? 0.2 : -0.2);
      star(ctx, right ? slot.x + slot.w - 12 : slot.x + 12, slot.y + 12, 25, '#FFE45C', right ? 0.2 : -0.2);
      sparkle(ctx, right ? slot.x + 14 : slot.x + slot.w - 14, slot.y + slot.h - 12, 26, '#FFFFFF');
    });
  },
  princess(ctx, w, _h, slots) {
    crown(ctx, w / 2, 34, 44, '#E9BE52', '#FF6FA8');
    slots.forEach((slot, i) => {
      if (i > 0) crown(ctx, slot.x + slot.w / 2, slot.y + 4, 21, '#E9BE52', '#FF6FA8');
      sparkle(ctx, slot.x + 26, slot.y + 30, 22, '#FFF4C2');
      sparkle(ctx, slot.x + slot.w - 26, slot.y + slot.h - 30, 18, '#FFF4C2');
    });
  },
  daisyField(ctx, w, h) {
    corners(w, h, 26).forEach(([x, y, dx, dy]) => {
      daisy(ctx, x, y, 48);
      daisy(ctx, x + dx * 72, y - dy * 4, 26);
      daisy(ctx, x - dx * 4, y + dy * 72, 26);
      leaf(ctx, x + dx * 24, y + dy * 44, 52, Math.atan2(dy, dx * 0.3), '#8FC86E', '#6FA851');
    });
  },
  rainbowCloud(ctx, w) {
    const colors = ['#FF8FA8', '#FFC27A', '#FFE680', '#A6E9A0', '#8FD3FF', '#C5A6FF'];
    ctx.lineCap = 'butt';
    colors.forEach((color, i) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(w / 2, 118, 142 - i * 10, Math.PI, 0);
      ctx.stroke();
    });
    cloud(ctx, w / 2 - 216, 112, 0.8, '#FFFFFF');
    cloud(ctx, w / 2 + 146, 112, 0.8, '#FFFFFF');
  },
  candyStripe(ctx, w, _h, slots) {
    lollipop(ctx, 40, 54, 38, '#FFE45C', '#FF5FA8', -0.2);
    lollipop(ctx, w - 40, 54, 38, '#8FE3FF', '#7C5CFF', 0.2);
    slots.forEach((slot, i) => {
      if (i > 0) heart(ctx, i % 2 ? slot.x + slot.w : slot.x, slot.y, 38, '#FF3D8F', 0, '#FFFFFF');
    });
  },
  bobaMilk(ctx, w, _h, slots) {
    bobaCup(ctx, 52, 62, 56, -0.14);
    bobaCup(ctx, w - 52, 62, 56, 0.14);
    slots.forEach((slot, i) => {
      if (i % 2) bobaCup(ctx, slot.x + slot.w - 30, slot.y + slot.h - 38, 42, 0.1);
    });
  },

  orangeCat(ctx, _w, _h, slots) {
    slots.forEach((slot, i) => {
      catEarsOn(ctx, slot, '#F08C2B', '#FFC2A0', '#C96A15');
      if (i % 2) peekFace(ctx, slot.x + 58, slot.y + slot.h - 14, 44, 'cat', '#F7A041', '#FFC2A0');
      else pawsOn(ctx, slot, '#F7A041', '#FFD5C2', '#C96A15');
    });
  },
  dino(ctx, _w, _h, slots) {
    slots.forEach((slot, i) => {
      ctx.fillStyle = '#FFD84D';
      const count = Math.max(4, Math.round(slot.w / 76));
      const size = slot.w / count;
      for (let s = 0; s < count; s++) {
        ctx.beginPath();
        ctx.moveTo(slot.x + s * size, slot.y + 3);
        ctx.lineTo(slot.x + (s + 0.5) * size, slot.y - 30);
        ctx.lineTo(slot.x + (s + 1) * size, slot.y + 3);
        ctx.fill();
      }
      if (i % 2 === 0) {
        const x = slot.x + slot.w - 50;
        const y = slot.y + slot.h - 8;
        ctx.fillStyle = '#5FB84A';
        ctx.beginPath();
        ctx.ellipse(x, y, 46, 38, 0, Math.PI, 0);
        ctx.fill();
        for (const dx of [-16, 16]) {
          ctx.fillStyle = '#5FB84A';
          ctx.beginPath();
          ctx.arc(x + dx, y - 36, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(x + dx, y - 36, 9, 0, Math.PI * 2);
          ctx.fill();
          eye(ctx, x + dx, y - 35, 5);
        }
        ctx.strokeStyle = '#2A1E1A';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y - 16, 14, 0.2, Math.PI - 0.2);
        ctx.stroke();
      }
    });
  },
  duckPond(ctx, w, _h, slots) {
    slots.forEach((slot, i) => {
      duck(ctx, i % 2 ? slot.x + 46 : slot.x + slot.w - 46, slot.y + slot.h - 18, 40, i % 2 ? 1 : -1);
    });
    duck(ctx, 56, 34, 28, 1);
    duck(ctx, w - 56, 34, 28, -1);
  },
  panda(ctx, _w, _h, slots) {
    slots.forEach((slot, i) => {
      roundEarsOn(ctx, slot, '#1E1E20', '#3C3C40');
      if (i % 2) peekFace(ctx, slot.x + slot.w - 58, slot.y + slot.h - 14, 44, 'panda', '#FFFFFF', '#FFFFFF');
    });
  },
  frogPond(ctx, _w, _h, slots) {
    slots.forEach((slot) => {
      for (const side of [-1, 1]) {
        const cx = slot.x + slot.w / 2 + side * slot.w * 0.3;
        ctx.fillStyle = '#58B84A';
        ctx.beginPath();
        ctx.arc(cx, slot.y - 6, 27, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cx, slot.y - 8, 19, 0, Math.PI * 2);
        ctx.fill();
        eye(ctx, cx, slot.y - 6, 10);
        blush(ctx, cx + side * 34, slot.y + 12, 13);
      }
    });
  },
  snacks(ctx, w, _h, slots) {
    donut(ctx, 44, 40, 38, '#FF8FB8', 111);
    donut(ctx, w - 44, 40, 38, '#8B5A3C', 222);
    slots.forEach((slot, i) => {
      if (i % 2) iceCream(ctx, slot.x + slot.w - 30, slot.y + slot.h - 50, 44, '#FFB5CF', 0.18);
      else iceCream(ctx, slot.x + 30, slot.y + slot.h - 50, 44, '#9FE3D2', -0.18);
    });
  },
};
