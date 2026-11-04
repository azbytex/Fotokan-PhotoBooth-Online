import { DecorId } from '../types';
import { balloon, burst, cloud, Ctx, DecorSet, flower, leaf, PhotoSlot, pixelArt, PIXEL_ALIEN, PIXEL_COIN, PIXEL_HEART, seeded, spider, verticalGradient, webFan, withState } from './decorKit';
import { overCute, underCute } from './decorCute';
import { overExtra, underExtra } from './decorExtra';

export type { PhotoSlot } from './decorKit';

const under: DecorSet = {
  webHero(ctx, w, h) {
    ctx.fillStyle = '#C8102E';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#12307A';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.34);
    ctx.quadraticCurveTo(w * 0.2, h * 0.62, w * 0.1, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.moveTo(w, h * 0.34);
    ctx.quadraticCurveTo(w * 0.8, h * 0.62, w * 0.9, h);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
    webFan(ctx, w / 2, -30, Math.hypot(w, h), 0, Math.PI, 19, 22, 'rgba(70,0,10,0.55)', 2);
  },
  comicPow(ctx, w, h) {
    ctx.fillStyle = '#FFD400';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#FFE95C';
    const reach = Math.hypot(w, h);
    for (let i = 0; i < 28; i += 2) {
      const a = (Math.PI * 2 * i) / 28;
      const b = (Math.PI * 2 * (i + 1)) / 28;
      ctx.beginPath();
      ctx.moveTo(w / 2, h / 2);
      ctx.lineTo(w / 2 + Math.cos(a) * reach, h / 2 + Math.sin(a) * reach);
      ctx.lineTo(w / 2 + Math.cos(b) * reach, h / 2 + Math.sin(b) * reach);
      ctx.fill();
    }
    ctx.fillStyle = '#E8112D';
    for (let y = 0; y < h; y += 18) {
      for (let x = (y / 18) % 2 ? 9 : 0; x < w; x += 18) {
        const edge = Math.min(x, w - x) / (w * 0.5);
        const r = Math.max(0, 5.4 - edge * 11);
        if (r > 0.4) {
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  },
  nightCity(ctx, w, h) {
    ctx.fillStyle = verticalGradient(ctx, h, [[0, '#070B22'], [0.65, '#16245C'], [1, '#2E3F8F']]);
    ctx.fillRect(0, 0, w, h);
    const random = seeded(21);
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 150; i++) {
      ctx.globalAlpha = 0.3 + random() * 0.7;
      ctx.fillRect(random() * w, random() * h * 0.8, 2, 2);
    }
    ctx.globalAlpha = 1;
    withState(ctx, () => {
      ctx.fillStyle = 'rgba(255,229,120,0.12)';
      ctx.beginPath();
      ctx.moveTo(w * 0.15, h);
      ctx.lineTo(w * 0.62, 0);
      ctx.lineTo(w, 0);
      ctx.closePath();
      ctx.fill();
    });
    let x = -10;
    while (x < w) {
      const bw = 34 + random() * 58;
      const bh = 80 + random() * 180;
      ctx.fillStyle = '#060919';
      ctx.fillRect(x, h - bh, bw, bh);
      ctx.fillStyle = '#FFD65C';
      for (let wy = h - bh + 12; wy < h - 14; wy += 22) {
        for (let wx = x + 8; wx < x + bw - 10; wx += 16) {
          if (random() > 0.55) ctx.fillRect(wx, wy, 6, 10);
        }
      }
      x += bw + 3;
    }
  },
  merahPutih(ctx, w, h) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#D0121F';
    for (const side of [0, 1]) {
      ctx.beginPath();
      ctx.moveTo(side ? w : 0, 0);
      for (let y = 0; y <= h; y += 20) {
        const edge = 26 + Math.sin(y / 58) * 9;
        ctx.lineTo(side ? w - edge : edge, y);
      }
      ctx.lineTo(side ? w : 0, h);
      ctx.closePath();
      ctx.fill();
    }
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 16) ctx.lineTo(x, h - 28 - Math.sin(x / 44) * 8);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  },
  kawung(ctx, w, h) {
    ctx.fillStyle = '#3F2412';
    ctx.fillRect(0, 0, w, h);
    const size = 56;
    for (let y = 0; y < h + size; y += size) {
      for (let x = 0; x < w + size; x += size) {
        for (let i = 0; i < 4; i++) {
          withState(ctx, () => {
            ctx.translate(x, y);
            ctx.rotate(Math.PI / 4 + (Math.PI / 2) * i);
            ctx.fillStyle = '#B9863F';
            ctx.beginPath();
            ctx.ellipse(size * 0.37, 0, size * 0.32, size * 0.17, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#3F2412';
            ctx.beginPath();
            ctx.ellipse(size * 0.37, 0, size * 0.2, size * 0.075, 0, 0, Math.PI * 2);
            ctx.fill();
          });
        }
        ctx.fillStyle = '#E6C27C';
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },
  goldOrnate(ctx, w, h) {
    ctx.fillStyle = '#1D1409';
    ctx.fillRect(0, 0, w, h);
    const gold = ctx.createLinearGradient(0, 0, w, h);
    gold.addColorStop(0, '#F7E2A0');
    gold.addColorStop(0.35, '#B9872F');
    gold.addColorStop(0.65, '#F4D98B');
    gold.addColorStop(1, '#A87520');
    ctx.strokeStyle = gold;
    ctx.lineWidth = 7;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.lineWidth = 2;
    ctx.strokeRect(22, 22, w - 44, h - 44);
    ctx.lineWidth = 3;
    for (const [cx, cy, dx, dy] of [[22, 22, 1, 1], [w - 22, 22, -1, 1], [22, h - 22, 1, -1], [w - 22, h - 22, -1, -1]]) {
      ctx.beginPath();
      ctx.arc(cx + dx * 12, cy + dy * 12, 11, 0, Math.PI * 2);
      ctx.moveTo(cx + dx * 26, cy + dy * 4);
      ctx.quadraticCurveTo(cx + dx * 60, cy + dy * 2, cx + dx * 72, cy + dy * 18);
      ctx.moveTo(cx + dx * 4, cy + dy * 26);
      ctx.quadraticCurveTo(cx + dx * 2, cy + dy * 60, cx + dx * 18, cy + dy * 72);
      ctx.stroke();
    }
  },
  pressedFloral(ctx, w, h) {
    ctx.fillStyle = '#FBF5EA';
    ctx.fillRect(0, 0, w, h);
    const random = seeded(8);
    const colors = ['#E8B4B8', '#D98F6C', '#BFC8A2', '#E6C77E'];
    for (let i = 0; i < Math.round(h / 44); i++) {
      const side = i % 2 === 0 ? 14 + random() * 14 : w - 14 - random() * 14;
      flower(ctx, side, random() * h, 8 + random() * 7, colors[i % colors.length], '#8A6A3B', 5);
    }
  },
  tropical(ctx, w, h) {
    ctx.fillStyle = '#0D3B2C';
    ctx.fillRect(0, 0, w, h);
    const random = seeded(4);
    const greens = ['#17684A', '#1E8058', '#124F3A', '#2A9A6A'];
    for (let i = 0; i < Math.round(h / 30); i++) {
      const left = i % 2 === 0;
      leaf(ctx, left ? -8 : w + 8, random() * h, 78 + random() * 66, (left ? 0 : Math.PI) + (random() - 0.5) * 1.1, greens[i % 4], '#0D3B2C');
    }
  },
  pixelArcade(ctx, w, h) {
    ctx.fillStyle = '#25175C';
    ctx.fillRect(0, 0, w, h);
    const random = seeded(30);
    for (let i = 0; i < 130; i++) {
      ctx.fillStyle = ['#FFFFFF', '#FFE500', '#62E8FF'][i % 3];
      ctx.globalAlpha = 0.25 + random() * 0.6;
      ctx.fillRect(Math.floor((random() * w) / 6) * 6, Math.floor((random() * h) / 6) * 6, 6, 6);
    }
    ctx.globalAlpha = 1;
    for (let x = 0; x < w; x += 36) {
      for (let row = 0; row < 3; row++) {
        ctx.fillStyle = row % 2 === (x / 36) % 2 ? '#FF4F9A' : '#C42B7A';
        ctx.fillRect(x, h - 36 * (row + 1), 34, 34);
      }
    }
  },
  galaxy(ctx, w, h) {
    ctx.fillStyle = verticalGradient(ctx, h, [[0, '#0A0626'], [0.5, '#25104F'], [1, '#080520']]);
    ctx.fillRect(0, 0, w, h);
    const random = seeded(77);
    for (let i = 0; i < 7; i++) {
      const x = random() * w;
      const y = random() * h;
      const r = 140 + random() * 200;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
      glow.addColorStop(0, i % 2 ? 'rgba(255,70,170,0.28)' : 'rgba(70,130,255,0.28)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 340; i++) {
      ctx.globalAlpha = 0.25 + random() * 0.75;
      const s = random() * 2.6 + 0.6;
      ctx.fillRect(random() * w, random() * h, s, s);
    }
    ctx.globalAlpha = 1;
  },
  corkboard(ctx, w, h) {
    ctx.fillStyle = '#C29461';
    ctx.fillRect(0, 0, w, h);
    const random = seeded(12);
    const specks = Math.min(2600, Math.round((w * h) / 420));
    for (let i = 0; i < specks; i++) {
      ctx.fillStyle = i % 3 === 0 ? '#8E6236' : i % 3 === 1 ? '#DAB586' : '#A87A49';
      ctx.fillRect(random() * w, random() * h, 2 + random() * 4, 1.5 + random() * 3);
    }
  },
  gingham(ctx, w, h) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);
    const size = 34;
    ctx.fillStyle = 'rgba(208,32,48,0.42)';
    for (let x = 0; x < w; x += size * 2) ctx.fillRect(x, 0, size, h);
    for (let y = 0; y < h; y += size * 2) ctx.fillRect(0, y, w, size);
  },
  retroSunset(ctx, w, h) {
    ctx.fillStyle = verticalGradient(ctx, h, [[0, '#2A0E5E'], [0.45, '#C2267C'], [0.8, '#FF7A3D'], [1, '#FFC24D']]);
    ctx.fillRect(0, 0, w, h);
    const r = w * 0.42;
    const cy = h * 0.5;
    const sun = ctx.createLinearGradient(0, cy - r, 0, cy + r);
    sun.addColorStop(0, '#FFE96B');
    sun.addColorStop(1, '#FF3D81');
    ctx.fillStyle = sun;
    ctx.beginPath();
    ctx.arc(w / 2, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    const horizon = h - 190;
    for (let i = -8; i <= 8; i++) {
      ctx.beginPath();
      ctx.moveTo(w / 2 + i * 14, horizon);
      ctx.lineTo(w / 2 + i * 90, h);
      ctx.stroke();
    }
    for (let i = 0; i < 7; i++) {
      const y = horizon + Math.pow(i / 6, 1.8) * 190;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  },
  birthday(ctx, w, h) {
    ctx.fillStyle = '#FFF3C9';
    ctx.fillRect(0, 0, w, h);
    const random = seeded(50);
    const colors = ['#FF5C8A', '#3DB8F5', '#FFB800', '#7C5CFF', '#2FCB8A'];
    for (let i = 0; i < Math.round((w * h) / 3600); i++) {
      withState(ctx, () => {
        ctx.translate(random() * w, random() * h);
        ctx.rotate(random() * Math.PI);
        ctx.fillStyle = colors[i % colors.length];
        if (i % 3 === 0) {
          ctx.beginPath();
          ctx.arc(0, 0, 5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-7, -3, 14, 6);
        }
      });
    }
  },
  sky(ctx, w, h) {
    ctx.fillStyle = verticalGradient(ctx, h, [[0, '#6EC3FF'], [1, '#DDF2FF']]);
    ctx.fillRect(0, 0, w, h);
    const random = seeded(17);
    for (let i = 0; i < Math.round(h / 150); i++) {
      cloud(ctx, random() * w - 50, random() * h, 0.65 + random() * 0.8, 'rgba(255,255,255,0.9)');
    }
  },
  checker(ctx, w, h) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#111111';
    const size = 26;
    for (let y = 0; y < h; y += size) {
      for (let x = 0; x < w; x += size) {
        if ((x + y) % (size * 2) === 0) ctx.fillRect(x, y, size, size);
      }
    }
  },
};

const over: DecorSet = {
  webHero(ctx, w, h) {
    webFan(ctx, 0, 0, 170, 0, Math.PI / 2, 6, 5, 'rgba(255,255,255,0.92)', 2);
    webFan(ctx, w, h * 0.5, 130, Math.PI * 0.7, Math.PI * 1.3, 5, 4, 'rgba(255,255,255,0.8)', 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.92)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w - 66, 0);
    ctx.lineTo(w - 66, 118);
    ctx.stroke();
    spider(ctx, w - 66, 140, 24, '#111111');
  },
  comicPow(ctx, w, h) {
    burst(ctx, w - 88, 72, 66, '#FFFFFF', 'POW!', 0.12);
    burst(ctx, 84, h * 0.53, 54, '#39C6F4', 'WOW!', -0.16);
  },
  nightCity(ctx, w) {
    ctx.fillStyle = '#FFF0B5';
    ctx.beginPath();
    ctx.arc(w - 62, 62, 44, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(190,160,90,0.45)';
    for (const [x, y, r] of [[-14, -8, 9], [12, 14, 6], [14, -18, 5]]) {
      ctx.beginPath();
      ctx.arc(w - 62 + x, 62 + y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  merahPutih(ctx, w) {
    const count = Math.round(w / 56);
    const size = w / count;
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.quadraticCurveTo(w / 2, 26, w, 8);
    ctx.stroke();
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count;
      const y = 8 + 18 * 4 * t * (1 - t) * 0.5 + 2;
      ctx.fillStyle = i % 2 ? '#FFFFFF' : '#D0121F';
      ctx.strokeStyle = '#D0121F';
      ctx.beginPath();
      ctx.moveTo(i * size + 3, y);
      ctx.lineTo((i + 1) * size - 3, y);
      ctx.lineTo((i + 0.5) * size, y + 40);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  },
  pressedFloral(ctx, w, h) {
    for (const [cx, cy, dx, dy] of [[0, 0, 1, 1], [w, 0, -1, 1], [0, h, 1, -1], [w, h, -1, -1]]) {
      leaf(ctx, cx + dx * 18, cy + dy * 18, 112, Math.atan2(dy * 0.2, dx), '#A7B58A', '#7E8D63');
      leaf(ctx, cx + dx * 18, cy + dy * 18, 112, Math.atan2(dy, dx * 0.2), '#A7B58A', '#7E8D63');
      flower(ctx, cx + dx * 50, cy + dy * 50, 42, '#E6A5AC', '#B37A2A');
      flower(ctx, cx + dx * 106, cy + dy * 34, 24, '#F0C98A', '#A7652A');
      flower(ctx, cx + dx * 34, cy + dy * 106, 24, '#D98F6C', '#7E4A28');
    }
  },
  tropical(ctx, w, h) {
    for (const [cx, cy, base] of [[0, 0, 0.1], [w, 0, Math.PI - 0.1], [0, h - 130, -0.1], [w, h - 130, Math.PI + 0.1]]) {
      for (let i = -2; i <= 2; i++) {
        const flip = cy === 0 ? 1 : -1;
        const angle = base + (i * 0.32 + 0.6) * flip * (cx === 0 ? 1 : -1);
        leaf(ctx, cx, cy, 148 - Math.abs(i) * 18, angle, i % 2 ? '#2FA56F' : '#1E8058', '#0D3B2C');
      }
    }
    flower(ctx, 62, 56, 28, '#FF6B6B', '#FFD54F', 5);
    flower(ctx, w - 62, 56, 28, '#FFB347', '#D84A1B', 5);
  },
  pixelArcade(ctx, w) {
    for (let i = 0; i < 3; i++) pixelArt(ctx, 14 + i * 38, 10, 5, PIXEL_HEART, { X: '#FF3B6B' });
    pixelArt(ctx, w - 96, 8, 6, PIXEL_COIN, { Y: '#FFD500', W: '#FFF7B0', O: '#D98E00' });
    pixelArt(ctx, w - 42, 12, 3, PIXEL_ALIEN, { G: '#5CFF9D' });
  },
  galaxy(ctx, w, h) {
    const px = w - 66;
    const py = 70;
    const body = ctx.createRadialGradient(px - 16, py - 16, 4, px, py, 46);
    body.addColorStop(0, '#FFD6A5');
    body.addColorStop(1, '#D9576E');
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(px, py, 44, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#F7E7C6';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(px, py, 74, 16, -0.4, 0, Math.PI * 2);
    ctx.stroke();
    const moon = ctx.createRadialGradient(46, h * 0.52, 2, 52, h * 0.52, 30);
    moon.addColorStop(0, '#CFE8FF');
    moon.addColorStop(1, '#4D6BD8');
    ctx.fillStyle = moon;
    ctx.beginPath();
    ctx.arc(50, h * 0.52, 28, 0, Math.PI * 2);
    ctx.fill();
  },
  corkboard(ctx, _w, _h, slots) {
    const random = seeded(61);
    slots.forEach((slot, i) => {
      withState(ctx, () => {
        ctx.translate(slot.x + slot.w / 2, slot.y + 2);
        if (i % 2 === 0) {
          ctx.rotate(-0.06 + random() * 0.12);
          ctx.fillStyle = i % 4 === 0 ? 'rgba(255,233,140,0.82)' : 'rgba(255,190,205,0.82)';
          ctx.fillRect(-52, -15, 104, 30);
        } else {
          ctx.fillStyle = '#E2342F';
          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.beginPath();
          ctx.arc(-4, -4, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    });
  },
  birthday(ctx, w) {
    balloon(ctx, 44, 66, 34, '#FF5C8A');
    balloon(ctx, 104, 44, 26, '#3DB8F5');
    balloon(ctx, w - 44, 66, 34, '#7C5CFF');
    balloon(ctx, w - 104, 44, 26, '#FFB800');
  },
  sky(ctx, w, h) {
    cloud(ctx, -18, 44, 1.05, '#FFFFFF');
    cloud(ctx, w - 92, 40, 1, '#FFFFFF');
    cloud(ctx, w - 88, h * 0.58, 0.8, '#FFFFFF');
  },
};

export function paintDecorUnder(decor: DecorId, ctx: Ctx, w: number, h: number, slots: PhotoSlot[]) {
  const paint = under[decor] ?? underCute[decor] ?? underExtra[decor];
  if (paint) withState(ctx, () => paint(ctx, w, h, slots));
}

export function paintDecorOver(decor: DecorId, ctx: Ctx, w: number, h: number, slots: PhotoSlot[]) {
  const paint = over[decor] ?? overCute[decor] ?? overExtra[decor];
  if (paint) withState(ctx, () => paint(ctx, w, h, slots));
}
