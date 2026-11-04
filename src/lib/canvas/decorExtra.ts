import { heart, sparkle, star } from './decorCute';
import { Ctx, DecorSet, flower, leaf, pixelArt, seeded, verticalGradient, withState } from './decorKit';

function fill(ctx: Ctx, w: number, h: number, color: string | CanvasGradient) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
}

function dust(ctx: Ctx, w: number, h: number, seed: number, count: number, colors: string[], size = 3) {
  const random = seeded(seed);
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = colors[i % colors.length];
    ctx.globalAlpha = 0.3 + random() * 0.7;
    const s = 1 + random() * size;
    ctx.fillRect(random() * w, random() * h, s, s);
  }
  ctx.globalAlpha = 1;
}

export function shuriken(ctx: Ctx, x: number, y: number, r: number, color: string, rotation: number) {
  withState(ctx, () => {
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const radius = i % 2 ? r * 0.26 : r;
      const a = (Math.PI * i) / 4;
      ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function wizardHat(ctx: Ctx, x: number, y: number, s: number, rotation = 0) {
  withState(ctx, () => {
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = '#6A3FD6';
    ctx.beginPath();
    ctx.moveTo(-s * 0.56, 0);
    ctx.quadraticCurveTo(-s * 0.2, -s * 0.7, s * 0.2, -s * 1.2);
    ctx.quadraticCurveTo(s * 0.26, -s * 0.5, s * 0.56, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#FFD65C';
    ctx.fillRect(-s * 0.5, -s * 0.2, s, s * 0.14);
    ctx.fillStyle = '#4C2AA8';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.02, s, s * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    star(ctx, -s * 0.08, -s * 0.5, s * 0.14, '#FFD65C', 0.2);
  });
}

function crescent(ctx: Ctx, x: number, y: number, r: number, color: string, background: string, rotation = -0.5) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = background;
  ctx.beginPath();
  ctx.arc(x + Math.cos(rotation) * r * 0.42, y + Math.sin(rotation) * r * 0.42, r * 0.84, 0, Math.PI * 2);
  ctx.fill();
}

function ketupat(ctx: Ctx, x: number, y: number, s: number) {
  withState(ctx, () => {
    ctx.translate(x, y);
    ctx.fillStyle = '#7DBF4E';
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s, 0);
    ctx.lineTo(0, s);
    ctx.lineTo(-s, 0);
    ctx.closePath();
    ctx.fill();
    ctx.clip();
    ctx.strokeStyle = '#E8D27A';
    ctx.lineWidth = Math.max(1.5, s * 0.09);
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * s * 0.42 - s, -s);
      ctx.lineTo(i * s * 0.42 + s, s);
      ctx.moveTo(i * s * 0.42 + s, -s);
      ctx.lineTo(i * s * 0.42 - s, s);
      ctx.stroke();
    }
  });
  ctx.strokeStyle = '#E8D27A';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y + s);
  ctx.quadraticCurveTo(x - s * 0.3, y + s * 1.4, x + s * 0.12, y + s * 1.8);
  ctx.stroke();
}

function lantern(ctx: Ctx, x: number, y: number, s: number) {
  ctx.strokeStyle = '#F7C948';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y - s * 1.4);
  ctx.lineTo(x, y + s * 1.6);
  ctx.stroke();
  ctx.fillStyle = '#E8262C';
  ctx.beginPath();
  ctx.ellipse(x, y, s, s * 0.78, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(247,201,72,0.8)';
  ctx.lineWidth = 2;
  for (const k of [-0.56, 0, 0.56]) {
    ctx.beginPath();
    ctx.ellipse(x, y, Math.abs(k) * s || 1, s * 0.78, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#F7C948';
  ctx.fillRect(x - s * 0.42, y - s * 0.86, s * 0.84, s * 0.16);
  ctx.fillRect(x - s * 0.42, y + s * 0.7, s * 0.84, s * 0.16);
}

export function gradCap(ctx: Ctx, x: number, y: number, s: number, rotation = 0) {
  withState(ctx, () => {
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = '#0E1B3D';
    ctx.beginPath();
    ctx.moveTo(-s * 0.5, s * 0.02);
    ctx.lineTo(s * 0.5, s * 0.02);
    ctx.lineTo(s * 0.46, s * 0.42);
    ctx.quadraticCurveTo(0, s * 0.62, -s * 0.46, s * 0.42);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#1C2F63';
    ctx.strokeStyle = '#F2C94C';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.42);
    ctx.lineTo(s, 0);
    ctx.lineTo(0, s * 0.3);
    ctx.lineTo(-s, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#F2C94C';
    ctx.lineWidth = Math.max(2, s * 0.05);
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.06);
    ctx.quadraticCurveTo(s * 0.5, 0, s * 0.66, s * 0.54);
    ctx.stroke();
    ctx.fillStyle = '#F2C94C';
    ctx.fillRect(s * 0.6, s * 0.52, s * 0.13, s * 0.26);
  });
}

function snowflake(ctx: Ctx, x: number, y: number, r: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.5, r * 0.11);
  ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI * i) / 3;
    const ex = x + Math.cos(a) * r;
    const ey = y + Math.sin(a) * r;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(ex, ey);
    for (const t of [-0.6, 0.6]) {
      ctx.moveTo(x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6);
      ctx.lineTo(x + Math.cos(a + t) * r * 0.86, y + Math.sin(a + t) * r * 0.86);
    }
    ctx.stroke();
  }
}

function holly(ctx: Ctx, x: number, y: number, s: number) {
  leaf(ctx, x, y, s, -0.4, '#1F8A4C', '#0E5A30');
  leaf(ctx, x, y, s, Math.PI + 0.4, '#1F8A4C', '#0E5A30');
  for (const [dx, dy] of [[-0.14, 0.08], [0.14, 0.08], [0, -0.1]]) {
    ctx.fillStyle = '#E11D2E';
    ctx.beginPath();
    ctx.arc(x + dx * s, y + dy * s, s * 0.14, 0, Math.PI * 2);
    ctx.fill();
  }
}

function firework(ctx: Ctx, x: number, y: number, r: number, color: string) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';
  for (let i = 0; i < 16; i++) {
    const a = (Math.PI * 2 * i) / 16;
    const long = i % 2 ? r : r * 0.74;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * r * 0.2, y + Math.sin(a) * r * 0.2);
    ctx.lineTo(x + Math.cos(a) * long, y + Math.sin(a) * long);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * (long + 8), y + Math.sin(a) * (long + 8), 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function pumpkin(ctx: Ctx, x: number, y: number, s: number) {
  ctx.fillStyle = '#4F8A3A';
  ctx.fillRect(x - s * 0.1, y - s * 0.92, s * 0.2, s * 0.32);
  ctx.fillStyle = '#F27A1A';
  for (const [dx, rx] of [[-0.58, 0.46], [0.58, 0.46], [-0.26, 0.48], [0.26, 0.48]]) {
    ctx.beginPath();
    ctx.ellipse(x + dx * s, y, rx * s, s * 0.72, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#FF9330';
  ctx.beginPath();
  ctx.ellipse(x, y, s * 0.36, s * 0.74, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2B1500';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(x + side * s * 0.46, y - s * 0.28);
    ctx.lineTo(x + side * s * 0.2, y - s * 0.02);
    ctx.lineTo(x + side * s * 0.62, y - s * 0.02);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.moveTo(x - s * 0.5, y + s * 0.18);
  ctx.quadraticCurveTo(x, y + s * 0.3, x + s * 0.5, y + s * 0.18);
  ctx.quadraticCurveTo(x, y + s * 0.72, x - s * 0.5, y + s * 0.18);
  ctx.fill();
}

function bat(ctx: Ctx, x: number, y: number, s: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.3);
  ctx.quadraticCurveTo(x - s * 0.34, y - s * 0.1, x - s, y - s * 0.32);
  ctx.quadraticCurveTo(x - s * 0.82, y + s * 0.06, x - s * 0.72, y + s * 0.26);
  ctx.quadraticCurveTo(x - s * 0.5, y + s * 0.06, x - s * 0.3, y + s * 0.26);
  ctx.quadraticCurveTo(x - s * 0.16, y + s * 0.14, x, y + s * 0.3);
  ctx.quadraticCurveTo(x + s * 0.16, y + s * 0.14, x + s * 0.3, y + s * 0.26);
  ctx.quadraticCurveTo(x + s * 0.5, y + s * 0.06, x + s * 0.72, y + s * 0.26);
  ctx.quadraticCurveTo(x + s * 0.82, y + s * 0.06, x + s, y - s * 0.32);
  ctx.quadraticCurveTo(x + s * 0.34, y - s * 0.1, x, y + s * 0.3);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - s * 0.15, y - s * 0.28);
  ctx.lineTo(x - s * 0.1, y - s * 0.02);
  ctx.lineTo(x + s * 0.1, y - s * 0.02);
  ctx.lineTo(x + s * 0.15, y - s * 0.28);
  ctx.lineTo(x, y - s * 0.14);
  ctx.fill();
}

function discoBall(ctx: Ctx, x: number, y: number, r: number) {
  withState(ctx, () => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();
    const random = seeded(Math.round(r));
    const size = r / 4.5;
    for (let cy = y - r; cy < y + r; cy += size) {
      for (let cx = x - r; cx < x + r; cx += size) {
        const light = 170 + random() * 85;
        ctx.fillStyle = random() > 0.86 ? '#FF9CE0' : random() > 0.85 ? '#8FE3FF' : `rgb(${light},${light},${light + 8})`;
        ctx.fillRect(cx, cy, size - 1.5, size - 1.5);
      }
    }
  });
}

function shell(ctx: Ctx, x: number, y: number, s: number, color: string, rotation = 0) {
  withState(ctx, () => {
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.5);
    ctx.bezierCurveTo(-s * 0.9, s * 0.1, -s * 0.72, -s * 0.72, 0, -s * 0.6);
    ctx.bezierCurveTo(s * 0.72, -s * 0.72, s * 0.9, s * 0.1, 0, s * 0.5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,70,60,0.5)';
    ctx.lineWidth = Math.max(1.5, s * 0.05);
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(0, s * 0.46);
      ctx.lineTo(i * s * 0.26, -s * 0.5);
      ctx.stroke();
    }
  });
}

const CONSOLE_DPAD = ['..XX..', '..XX..', 'XXXXXX', 'XXXXXX', '..XX..', '..XX..'];

export const underExtra: DecorSet = {
  ninja(ctx, w, h) {
    fill(ctx, w, h, '#17171C');
    ctx.fillStyle = '#C8102E';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.2);
    ctx.lineTo(w, 0);
    ctx.lineTo(w, h * 0.06);
    ctx.lineTo(0, h * 0.3);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, h * 0.82);
    ctx.lineTo(w, h * 0.62);
    ctx.lineTo(w, h * 0.72);
    ctx.lineTo(0, h * 0.9);
    ctx.fill();
    const random = seeded(19);
    for (let i = 0; i < Math.round(h / 60); i++) {
      shuriken(ctx, i % 2 ? 14 + random() * 12 : w - 14 - random() * 12, random() * h, 17, '#3B3B46', random() * 3);
    }
  },
  wizard(ctx, w, h) {
    fill(ctx, w, h, verticalGradient(ctx, h, [[0, '#1B1147'], [0.6, '#2F1C75'], [1, '#452A9A']]));
    dust(ctx, w, h, 42, Math.round((w * h) / 2000), ['#FFFFFF', '#FFD65C'], 3);
    const random = seeded(43);
    for (let i = 0; i < Math.round(h / 60); i++) {
      star(ctx, i % 2 ? 16 + random() * 12 : w - 16 - random() * 12, random() * h, 10 + random() * 6, '#FFD65C', random());
    }
  },
  parang(ctx, w, h) {
    fill(ctx, w, h, '#EADFC6');
    const band = 72;
    for (let k = -h; k < w + h; k += band) {
      ctx.fillStyle = '#4A2A14';
      for (let t = 0; t < h + w; t += 42) {
        const x = k + t * 0.74;
        const y = t * 0.74;
        withState(ctx, () => {
          ctx.translate(x, y);
          ctx.rotate(Math.PI / 4);
          ctx.beginPath();
          ctx.moveTo(-21, -13);
          ctx.bezierCurveTo(-4, -18, 9, -11, 21, 0);
          ctx.bezierCurveTo(4, 2, -10, 0, -21, -13);
          ctx.fill();
        });
      }
    }
  },
  lebaran(ctx, w, h) {
    fill(ctx, w, h, verticalGradient(ctx, h, [[0, '#0D5C46'], [1, '#07402F']]));
    ctx.strokeStyle = 'rgba(232,210,122,0.25)';
    ctx.lineWidth = 2;
    const size = 56;
    for (let y = 0; y < h + size; y += size) {
      for (let x = 0; x < w + size; x += size) {
        withState(ctx, () => {
          ctx.translate(x, y);
          ctx.rotate(Math.PI / 4);
          ctx.strokeRect(-size * 0.26, -size * 0.26, size * 0.52, size * 0.52);
        });
        ctx.strokeRect(x - size * 0.26, y - size * 0.26, size * 0.52, size * 0.52);
      }
    }
  },
  imlek(ctx, w, h) {
    fill(ctx, w, h, '#B81220');
    ctx.strokeStyle = 'rgba(247,201,72,0.35)';
    ctx.lineWidth = 2.5;
    const size = 60;
    for (let y = 0, row = 0; y < h + size; y += size * 0.5, row++) {
      for (let x = row % 2 ? size / 2 : 0; x < w + size; x += size) {
        for (const r of [size * 0.5, size * 0.33, size * 0.16]) {
          ctx.beginPath();
          ctx.arc(x, y, r, Math.PI, 0);
          ctx.stroke();
        }
      }
    }
  },
  graduation(ctx, w, h) {
    fill(ctx, w, h, '#16244F');
    const random = seeded(71);
    for (let i = 0; i < Math.round(h / 64); i++) {
      const left = i % 2 === 0;
      if (i % 4 < 2) gradCap(ctx, left ? 22 : w - 22, random() * h, 18, (random() - 0.5) * 0.5);
      else star(ctx, left ? 20 : w - 20, random() * h, 8, '#F2C94C', random());
    }
    ctx.strokeStyle = '#F2C94C';
    ctx.lineWidth = 3;
    ctx.strokeRect(12, 12, w - 24, h - 24);
  },
  christmas(ctx, w, h) {
    fill(ctx, w, h, '#B5162B');
    const random = seeded(73);
    for (let i = 0; i < Math.round((w * h) / 6000); i++) {
      snowflake(ctx, random() * w, random() * h, 8 + random() * 13, 'rgba(255,255,255,0.7)');
    }
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 24) ctx.lineTo(x, h - 30 - Math.sin(x / 40) * 10);
    ctx.lineTo(w, h);
    ctx.fill();
  },
  fireworks(ctx, w, h) {
    fill(ctx, w, h, verticalGradient(ctx, h, [[0, '#0B0B2C'], [1, '#27114C']]));
    dust(ctx, w, h, 74, Math.round((w * h) / 2600), ['#FFFFFF'], 2.2);
    const random = seeded(75);
    const colors = ['#FFD65C', '#FF5FA8', '#62E8FF', '#7CFF9E'];
    for (let i = 0; i < Math.round(h / 95); i++) {
      firework(ctx, i % 2 ? 10 + random() * 26 : w - 10 - random() * 26, random() * h, 26 + random() * 16, colors[i % 4]);
    }
  },
  halloween(ctx, w, h) {
    fill(ctx, w, h, verticalGradient(ctx, h, [[0, '#2A1046'], [0.7, '#5B1E79'], [1, '#D65A1F']]));
    const random = seeded(77);
    for (let i = 0; i < Math.round(h / 60); i++) {
      bat(ctx, i % 2 ? 22 + random() * 8 : w - 22 - random() * 8, random() * h, 18, '#14081F');
    }
  },
  handheld(ctx, w, h) {
    fill(ctx, w, h, '#C9C8BE');
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    for (let y = 0; y < h; y += 8) ctx.fillRect(0, y, w, 2);
    ctx.fillStyle = '#54545E';
    ctx.beginPath();
    ctx.roundRect(22, 22, w - 44, h - 164, 22);
    ctx.fill();
  },
  disco(ctx, w, h) {
    fill(ctx, w, h, '#1A0B3B');
    const reach = Math.hypot(w, h);
    const colors = ['#FF3FA4', '#7C5CFF', '#22D3EE', '#FFD84D'];
    for (let i = 0; i < 24; i++) {
      const a = Math.PI * 0.02 + (Math.PI * 0.96 * i) / 24;
      ctx.fillStyle = colors[i % 4];
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.moveTo(w / 2, 40);
      ctx.lineTo(w / 2 + Math.cos(a) * reach, 40 + Math.sin(a) * reach);
      ctx.lineTo(w / 2 + Math.cos(a + 0.05) * reach, 40 + Math.sin(a + 0.05) * reach);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  },
  sakura(ctx, w, h) {
    fill(ctx, w, h, verticalGradient(ctx, h, [[0, '#FFE3EC'], [1, '#FFF5F8']]));
    const random = seeded(81);
    for (let i = 0; i < Math.round((w * h) / 3400); i++) {
      withState(ctx, () => {
        ctx.translate(random() * w, random() * h);
        ctx.rotate(random() * 6);
        ctx.fillStyle = i % 2 ? '#FFB3CB' : '#FFD0DF';
        ctx.beginPath();
        ctx.ellipse(0, 0, 11, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  },
  beach(ctx, w, h) {
    fill(ctx, w, h, verticalGradient(ctx, h, [[0, '#4FC8E8'], [0.72, '#A8ECE8'], [0.74, '#FFF4D1'], [1, '#F2D79C']]));
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    for (let y = 60; y < h * 0.72; y += 110) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= w; x += 20) ctx.lineTo(x, y + Math.sin(x / 26 + y) * 7);
      for (let x = w; x >= 0; x -= 20) ctx.lineTo(x, y + 11 + Math.sin(x / 26 + y) * 7);
      ctx.fill();
    }
  },
  notebook(ctx, w, h) {
    fill(ctx, w, h, '#FFFEF6');
    ctx.strokeStyle = '#A9CDF0';
    ctx.lineWidth = 2;
    for (let y = 24; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.strokeStyle = '#F29AA4';
    ctx.beginPath();
    ctx.moveTo(44, 0);
    ctx.lineTo(44, h);
    ctx.stroke();
  },
  loveLetter(ctx, w, h) {
    fill(ctx, w, h, '#F4DCC6');
    const size = 12;
    const stripe = ['#D7263D', '#F4DCC6', '#2F5DA8', '#F4DCC6'];
    for (let i = 0; i * size * 2 < w + h; i++) {
      ctx.fillStyle = stripe[i % 4];
      for (const [x, y, dx, dy] of [[i * size * 2, 0, 1, 0], [i * size * 2, h - size, 1, 0]]) {
        ctx.save();
        ctx.translate(x, y);
        ctx.transform(1, 0, -0.8, 1, 0, 0);
        ctx.fillRect(0, 0, size * 2 * dx + dy, size);
        ctx.restore();
      }
    }
    const random = seeded(87);
    for (let i = 0; i < Math.round(h / 40); i++) {
      heart(ctx, i % 2 ? 17 + random() * 11 : w - 17 - random() * 11, random() * h, 15, '#E9A79F', (random() - 0.5) * 0.7);
    }
  },
  seoulCafe(ctx, w, h) {
    fill(ctx, w, h, '#EFE6D8');
    ctx.strokeStyle = '#7B6A58';
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, w - 24, h - 24);
    ctx.lineWidth = 1;
    ctx.strokeRect(19, 19, w - 38, h - 38);
  },
};

export const overExtra: DecorSet = {
  ninja(ctx, _w, _h, slots) {
    slots.forEach((slot, i) => {
      const right = i % 2 === 0;
      shuriken(ctx, right ? slot.x + slot.w - 6 : slot.x + 6, slot.y + 8, 34, '#E6E6EE', 0.4 + i);
    });
  },
  wizard(ctx, w, _h, slots) {
    wizardHat(ctx, 80, 56, 58, -0.24);
    crescent(ctx, w - 58, 54, 38, '#FFE9A8', '#1B1147');
    slots.forEach((slot, i) => {
      sparkle(ctx, i % 2 ? slot.x + slot.w - 20 : slot.x + 20, slot.y + slot.h - 22, 24, '#FFD65C');
    });
  },
  parang(ctx, _w, _h, slots) {
    slots.forEach((slot, i) => {
      if (i === 0) return;
      flower(ctx, slot.x + slot.w / 2, slot.y, 15, '#F7C948', '#4A2A14', 8);
    });
  },
  lebaran(ctx, w, _h, slots) {
    crescent(ctx, 62, 62, 44, '#E8D27A', '#0D5C46');
    star(ctx, 104, 40, 14, '#E8D27A');
    ketupat(ctx, w - 66, 42, 28);
    ketupat(ctx, w - 118, 26, 17);
    slots.forEach((slot, i) => {
      if (i % 2) ketupat(ctx, slot.x + slot.w - 4, slot.y + slot.h - 36, 26);
      else star(ctx, slot.x + 8, slot.y + slot.h - 12, 20, '#E8D27A');
    });
  },
  imlek(ctx, w, _h, slots) {
    lantern(ctx, 58, 54, 34);
    lantern(ctx, w - 58, 54, 34);
    slots.forEach((slot, i) => {
      if (i === 0) return;
      lantern(ctx, i % 2 ? slot.x + slot.w - 14 : slot.x + 14, slot.y, 20);
    });
  },
  graduation(ctx, w, _h, slots) {
    gradCap(ctx, w / 2, 26, 62);
    slots.forEach((slot, i) => {
      star(ctx, i % 2 ? slot.x + slot.w - 16 : slot.x + 16, slot.y + slot.h - 16, 22, '#F2C94C', 0.2);
    });
  },
  christmas(ctx, w, _h, slots) {
    holly(ctx, 66, 40, 58);
    holly(ctx, w - 66, 40, 58);
    slots.forEach((slot, i) => {
      if (i > 0) holly(ctx, slot.x + slot.w / 2, slot.y, 34);
    });
  },
  fireworks(ctx, w) {
    firework(ctx, 64, 62, 50, '#FFD65C');
    firework(ctx, w - 64, 62, 50, '#FF5FA8');
  },
  halloween(ctx, w, _h, slots) {
    pumpkin(ctx, 64, 62, 44);
    bat(ctx, w - 70, 50, 44, '#14081F');
    slots.forEach((slot, i) => {
      if (i % 2) pumpkin(ctx, slot.x + slot.w - 34, slot.y + slot.h - 28, 32);
      else bat(ctx, slot.x + 24, slot.y + 8, 32, '#14081F');
    });
  },
  handheld(ctx, w, h) {
    pixelArt(ctx, w - 196, h - 128, 7, CONSOLE_DPAD, { X: '#2B2B33' });
    ctx.fillStyle = '#A3195B';
    for (const [x, y] of [[w - 92, h - 92], [w - 48, h - 112]]) {
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  disco(ctx, w) {
    ctx.strokeStyle = '#D9D9E6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, 20);
    ctx.stroke();
    discoBall(ctx, w / 2, 52, 40);
  },
  sakura(ctx, w, _h, slots) {
    ctx.strokeStyle = '#6B4A3A';
    ctx.lineCap = 'round';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(0, 28);
    ctx.quadraticCurveTo(w * 0.28, 12, w * 0.5, 44);
    ctx.stroke();
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(w * 0.2, 22);
    ctx.quadraticCurveTo(w * 0.3, 44, w * 0.32, 64);
    ctx.stroke();
    for (const [x, y, r] of [[w * 0.08, 34, 30], [w * 0.24, 26, 26], [w * 0.36, 58, 30], [w * 0.5, 44, 24], [w * 0.62, 26, 22], [w * 0.14, 12, 18]]) {
      flower(ctx, x, y, r, '#FFA8C4', '#D94F7E', 5);
    }
    slots.forEach((slot, i) => {
      flower(ctx, i % 2 ? slot.x + 8 : slot.x + slot.w - 8, slot.y + slot.h - 10, 26, '#FFA8C4', '#D94F7E', 5);
    });
  },
  beach(ctx, w, _h, slots) {
    ctx.fillStyle = '#FFE066';
    ctx.beginPath();
    ctx.arc(w - 64, 58, 40, 0, Math.PI * 2);
    ctx.fill();
    star(ctx, 58, 58, 42, '#FF8A5B', 0.3, 0.52);
    slots.forEach((slot, i) => {
      shell(ctx, i % 2 ? slot.x + slot.w - 14 : slot.x + 14, slot.y + slot.h - 14, 28, i % 2 ? '#FFC6B5' : '#FFE1C2', i % 2 ? 0.4 : -0.4);
    });
  },
  notebook(ctx, _w, h) {
    for (let y = 26; y < h; y += 64) {
      ctx.fillStyle = '#D9D4C5';
      ctx.beginPath();
      ctx.arc(20, y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#6E6E78';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-6, y - 4);
      ctx.quadraticCurveTo(10, y - 16, 20, y);
      ctx.stroke();
    }
  },
  loveLetter(ctx, _w, _h, slots) {
    slots.forEach((slot, i) => {
      if (i % 2 === 0) {
        ctx.fillStyle = '#B5162B';
        ctx.beginPath();
        ctx.arc(slot.x + slot.w - 18, slot.y + slot.h - 18, 34, 0, Math.PI * 2);
        ctx.fill();
        heart(ctx, slot.x + slot.w - 18, slot.y + slot.h - 14, 32, '#E8505F');
      } else {
        ctx.fillStyle = '#FFFEF6';
        ctx.fillRect(slot.x + 14, slot.y - 16, 64, 76);
        ctx.strokeStyle = '#2F5DA8';
        ctx.setLineDash([5, 4]);
        ctx.lineWidth = 2;
        ctx.strokeRect(slot.x + 18, slot.y - 12, 56, 68);
        ctx.setLineDash([]);
        heart(ctx, slot.x + 46, slot.y + 26, 36, '#D7263D');
      }
    });
  },
  seoulCafe(ctx, w, _h, slots) {
    ctx.strokeStyle = '#7B6A58';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(w - 44, 32, 11, 0.2, Math.PI - 0.2);
    ctx.moveTo(w - 33, 30);
    ctx.arc(w - 29, 32, 5, -1.4, 1.4);
    ctx.stroke();
    slots.forEach((slot, i) => {
      if (i % 2) sparkle(ctx, slot.x + slot.w - 16, slot.y + 16, 18, '#FFFFFF');
    });
  },
};
