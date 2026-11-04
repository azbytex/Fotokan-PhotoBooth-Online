// Satu loop rAF untuk semua animasi scroll. Hanya menulis transform dan opacity,
// posisi elemen diukur sekali lalu disimpan, jadi tidak ada layout saat scroll.

export interface Pose {
  x?: number;
  y?: number;
  r?: number;
  s?: number;
  o?: number;
}

export type Keyframe = [number, Pose];

export interface MotionSpec {
  keys: Keyframe[];
  /** Satuan x dan y. Nilai px mengecil otomatis di layar kecil. */
  unit?: 'px' | '%';
  /** Mengikuti posisi kursor, dalam px per setengah layar. */
  pointer?: number;
  /** Elemen pembungkus adegan yang ditahan (sticky). */
  scene?: HTMLElement | null;
}

interface Item extends MotionSpec {
  el: HTMLElement;
  top: number;
  height: number;
  last: string;
  lastOpacity: string;
  isNear: boolean;
}

const items = new Set<Item>();
let frame = 0;
let lastTime = 0;
let smoothY = 0;
let pointerX = 0;
let pointerY = 0;
let smoothPointerX = 0;
let smoothPointerY = 0;
let viewportW = 0;
let viewportH = 0;
let isListening = false;
let measureQueued = false;
let needsSnap = true;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smoothstep = (t: number) => t * t * (3 - 2 * t);

function progressOf(item: Item, y: number) {
  if (item.scene) {
    const travel = item.height - viewportH;
    return travel > 0 ? clamp01((y - item.top) / travel) : 0;
  }
  return clamp01((y + viewportH - item.top) / (viewportH + item.height));
}

function isItemNear(item: Item, y: number) {
  const margin = viewportH * 0.6;
  return y + viewportH + margin > item.top && y - margin < item.top + item.height;
}

function poseAt(keys: Keyframe[], p: number): Required<Pose> {
  let a = keys[0];
  let b = keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i++) {
    if (p >= keys[i][0] && p <= keys[i + 1][0]) {
      a = keys[i];
      b = keys[i + 1];
      break;
    }
  }
  if (p <= keys[0][0]) b = a = keys[0];
  if (p >= keys[keys.length - 1][0]) a = b = keys[keys.length - 1];
  const span = b[0] - a[0];
  const t = span > 0 ? smoothstep((p - a[0]) / span) : 0;
  const mix = (from = 0, to = 0) => from + (to - from) * t;
  return {
    x: mix(a[1].x, b[1].x),
    y: mix(a[1].y, b[1].y),
    r: mix(a[1].r, b[1].r),
    s: mix(a[1].s ?? 1, b[1].s ?? 1),
    o: mix(a[1].o ?? 1, b[1].o ?? 1),
  };
}

function apply(item: Item, y: number) {
  const near = isItemNear(item, y);
  if (near !== item.isNear) {
    item.isNear = near;
    item.el.style.willChange = near ? 'transform, opacity' : 'auto';
  }
  if (!near && item.last) return;

  const pose = poseAt(item.keys, progressOf(item, y));
  const unit = item.unit ?? 'px';
  const shrink = unit === 'px' ? Math.min(1, Math.max(0.55, viewportW / 1200)) : 1;
  let x = pose.x * shrink;
  let ty = pose.y * shrink;
  if (item.pointer) {
    x += smoothPointerX * item.pointer;
    ty += smoothPointerY * item.pointer;
  }
  const transform =
    `translate3d(${x.toFixed(unit === '%' ? 3 : 1)}${unit},${ty.toFixed(unit === '%' ? 3 : 1)}${unit},0)` +
    (pose.r ? ` rotate(${pose.r.toFixed(2)}deg)` : '') +
    (pose.s !== 1 ? ` scale(${pose.s.toFixed(4)})` : '');
  if (transform !== item.last) {
    item.el.style.transform = transform;
    item.last = transform;
  }
  const opacity = pose.o.toFixed(3);
  if (opacity !== item.lastOpacity) {
    item.el.style.opacity = opacity;
    item.lastOpacity = opacity;
  }
}

function tick(now: number) {
  const dt = Math.min(64, now - lastTime || 16);
  lastTime = now;
  const follow = 1 - Math.exp(-dt / 70);
  const targetY = window.scrollY;

  smoothY = needsSnap ? targetY : smoothY + (targetY - smoothY) * follow;
  smoothPointerX += (pointerX - smoothPointerX) * follow;
  smoothPointerY += (pointerY - smoothPointerY) * follow;
  needsSnap = false;

  const isSettled =
    Math.abs(targetY - smoothY) < 0.2 &&
    Math.abs(pointerX - smoothPointerX) < 0.002 &&
    Math.abs(pointerY - smoothPointerY) < 0.002;
  if (isSettled) smoothY = targetY;

  items.forEach((item) => apply(item, smoothY));
  frame = isSettled ? 0 : requestAnimationFrame(tick);
}

function wake() {
  if (!frame) {
    lastTime = performance.now();
    frame = requestAnimationFrame(tick);
  }
}

function measure() {
  measureQueued = false;
  viewportW = window.innerWidth;
  viewportH = window.innerHeight;
  const y = window.scrollY;
  const scenes = new Map<HTMLElement, DOMRect>();

  const free = Array.from(items).filter((item) => !item.scene);
  free.forEach((item) => {
    item.el.style.transform = 'none';
  });
  items.forEach((item) => {
    if (item.scene) {
      let rect = scenes.get(item.scene);
      if (!rect) {
        rect = item.scene.getBoundingClientRect();
        scenes.set(item.scene, rect);
      }
      item.top = rect.top + y;
      item.height = rect.height;
    } else {
      const rect = item.el.getBoundingClientRect();
      item.top = rect.top + y;
      item.height = rect.height;
    }
  });
  items.forEach((item) => {
    item.last = '';
    item.lastOpacity = '';
    apply(item, smoothY || y);
  });
  wake();
}

function queueMeasure() {
  if (measureQueued) return;
  measureQueued = true;
  requestAnimationFrame(measure);
}

function listen() {
  if (isListening) return;
  isListening = true;
  smoothY = window.scrollY;
  window.addEventListener('scroll', wake, { passive: true });
  window.addEventListener('resize', () => {
    // Bilah alamat HP yang muncul dan hilang tidak perlu memicu pengukuran ulang.
    if (window.innerWidth !== viewportW || Math.abs(window.innerHeight - viewportH) > 140) queueMeasure();
  });
  window.addEventListener('load', queueMeasure);
  document.fonts?.ready.then(queueMeasure);
  new ResizeObserver(queueMeasure).observe(document.body);
  if (window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener(
      'pointermove',
      (event) => {
        pointerX = event.clientX / window.innerWidth - 0.5;
        pointerY = event.clientY / window.innerHeight - 0.5;
        wake();
      },
      { passive: true }
    );
  }
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function registerMotion(el: HTMLElement, spec: MotionSpec) {
  if (prefersReducedMotion()) return () => {};
  listen();
  const item: Item = { ...spec, el, top: 0, height: 0, last: '', lastOpacity: '', isNear: false };
  items.add(item);
  needsSnap = true;
  queueMeasure();
  return () => {
    items.delete(item);
    el.style.willChange = 'auto';
  };
}
