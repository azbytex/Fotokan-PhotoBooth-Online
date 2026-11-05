'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import Doodle from '@/components/layout/Doodle';
import { Motion, Scene } from '@/components/layout/Motion';
import { Keyframe } from '@/lib/motion/scrollEngine';
import Reveal from '@/components/layout/Reveal';
import StripPreview from '@/components/studio/StripPreview';
import { FILTER_PRESETS, OverlayLayer } from '@/components/studio/FilterControls';
import { getSamplePhoto } from '@/lib/canvas/samplePhotos';
import { getThemeById, getThemesInCategory, THEME_CATEGORIES, THEMES } from '@/lib/themes/themeCatalog';

const HERO_STRIPS = [
  { id: 'pita-pink', left: '-1%', top: '15%', mobileLeft: '-7%', mobileTop: '60%', tilt: -11, y: -540, x: -120, depth: 26 },
  { id: 'jaring-merah', left: '12%', top: '58%', mobileLeft: '13%', mobileTop: '68%', tilt: 7, y: -860, x: -40, depth: 14 },
  { id: 'kucing-oren', left: '27%', top: '78%', mobileLeft: '33%', mobileTop: '78%', tilt: -5, y: -1180, x: 0, depth: 34 },
  { id: 'kupu-lilac', left: '58%', top: '80%', mobileLeft: '52%', mobileTop: '76%', tilt: 4, y: -1040, x: 20, depth: 20 },
  { id: 'pixel-arcade', left: '73%', top: '56%', mobileLeft: '71%', mobileTop: '66%', tilt: -7, y: -760, x: 60, depth: 30 },
  { id: 'batik-kawung', left: '87%', top: '12%', mobileLeft: '86%', mobileTop: '58%', tilt: 10, y: -480, x: 120, depth: 16 },
];

const HERO_DOODLES = [
  { kind: 'heart', color: '#FF5FA8', cls: 'left-[6%] top-[12%] h-9 w-9 md:left-[12%] md:top-[14%] md:h-11 md:w-11', y: -320, r: -40, depth: 60 },
  { kind: 'sparkle', color: '#FFD400', cls: 'right-[8%] top-[11%] h-9 w-9 md:left-[22%] md:right-auto md:top-[24%] md:h-14 md:w-14', y: -620, r: 90, depth: -40 },
  { kind: 'star', color: '#7C5CFF', cls: 'hidden h-9 w-9 md:right-[24%] md:top-[18%] md:block', y: -460, r: 120, depth: 50 },
  { kind: 'heart', color: '#FFB3D1', cls: 'hidden h-12 w-12 md:bottom-[9%] md:left-[50%] md:block', y: -760, r: 40, depth: -30 },
  { kind: 'sparkle', color: '#22C7F0', cls: 'hidden h-7 w-7 md:left-[42%] md:top-[11%] md:block', y: -240, r: 60, depth: 40 },
] as const;

const FILTER_SHOW = ['normal', 'pipi-pink', 'hujan-hati', 'bocor', 'kelopak', 'noir-keras'];

const STEPS = [
  { title: 'Pilih frame', text: 'Buka kategorinya, pilih frame, lalu tentukan 2 sampai 6 foto per strip.', color: '#FFE500', ink: '#111111', theme: 'kelinci-mochi' },
  { title: 'Foto satu per satu', text: 'Pasang timer 3, 5, atau 10 detik. Kurang pas? Ulangi sebelum lanjut.', color: '#FFB3D1', ink: '#4A0D2B', theme: 'bintang-glitter' },
  { title: 'Hias dan unduh', text: 'Tambah stiker dan judul sesuka anda, lalu unduh dan Abadikan.', color: '#111111', ink: '#FFFFFF', theme: 'komik-pow' },
];

const FAQ = [
  {
    q: 'Perlu daftar atau instal aplikasi?',
    a: 'Tidak. Buka situs ini di browser HP atau laptop, izinkan akses kamera, lalu mulai foto.',
  },
  {
    q: 'Kamera saya tidak mau menyala. Bagaimana?',
    a: 'Cek izin kamera di pengaturan browser. Kalau kamera tetap tidak tersedia, kamu bisa memakai foto dari galeri lewat tombol unggah di layar kamera.',
  },
  {
    q: 'Di mana foto saya disimpan?',
    a: 'Foto dari sesi sendiri hanya ada di browsermu, dan bisa kamu hapus dari Galeri. Foto dari room berdua dikirim ke server supaya temanmu bisa menerimanya. Hanya kalian berdua yang bisa membukanya, dan foto terhapus otomatis 24 jam setelah room terakhir dipakai, atau lebih cepat kalau kamu menghapus room-nya.',
  },
  {
    q: 'Saat foto berdua, kami harus online bersamaan?',
    a: 'Tidak. Temanmu bisa menyusul dalam 24 jam. Strip lengkap setelah kalian berdua selesai foto.',
  },
  {
    q: 'Seberapa besar ukuran hasilnya?',
    a: 'Strip 4 foto tersimpan dalam ukuran 1800 × 5400 piksel. Ketajaman fotonya mengikuti kamera perangkatmu, sampai lebar 1600 piksel per foto, atau 1280 piksel di room berdua.',
  },
];

function Hero() {
  return (
    <Scene length="210vh" stageClassName="bg-page">
      {HERO_DOODLES.map((doodle) => (
        <Motion
          key={`${doodle.kind}-${doodle.cls}`}
          keys={[[0, {}], [1, { y: doodle.y, r: doodle.r }]]}
          pointer={doodle.depth}
          className={`absolute z-10 ${doodle.cls}`}
        >
          <Doodle kind={doodle.kind} color={doodle.color} className="doodle-in h-full w-full" />
        </Motion>
      ))}

      {HERO_STRIPS.map((strip, i) => (
        <Motion
          key={strip.id}
          keys={[[0, {}], [1, { x: strip.x, y: strip.y }]]}
          pointer={strip.depth}
          className="hero-strip absolute w-[clamp(92px,13.5vw,210px)]"
          style={{ '--l': strip.left, '--t': strip.top, '--ml': strip.mobileLeft, '--mt': strip.mobileTop } as React.CSSProperties}
        >
          <Link href={`/studio?theme=${strip.id}`} aria-label={`Foto dengan frame ${getThemeById(strip.id).name}`} className="block">
            <div className="hero-deal strip-lift overflow-hidden rounded-[3px] shadow-[0_24px_50px_-22px_rgb(0_0_0/0.5)]" style={{ '--tilt': `${strip.tilt}deg`, '--i': i } as React.CSSProperties}>
              <StripPreview theme={getThemeById(strip.id)} offset={i} />
            </div>
          </Link>
        </Motion>
      ))}

      <Motion
        keys={[[0, {}], [0.62, { s: 0.74, o: 0 }], [1, { s: 0.74, o: 0 }]]}
        className="pointer-events-none absolute inset-0 z-20 flex items-start justify-center px-4 pt-[17svh] md:items-center md:pt-0"
      >
        <div className="max-w-[1000px] text-center">
          <h1 className="hero-title text-[clamp(3rem,10.5vw,9rem)] font-extrabold leading-[0.92]">
            Satu Frame, Selamanya Abadi.
          </h1>
          <p className="hero-sub mx-auto mt-5 max-w-md text-lg leading-relaxed text-fg">
            {THEMES.length} frame dan {FILTER_PRESETS.length} filter. Foto sendiri, atau berdua dengan teman yang beda kota.
          </p>
          <div className="hero-sub pointer-events-auto mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/studio" className="btn-primary px-6 py-3 text-base">
              Mulai foto
            </Link>
            <Link href="/room" className="btn-secondary bg-page px-6 py-3 text-base">
              Foto berdua
            </Link>
          </div>
        </div>
      </Motion>
    </Scene>
  );
}

function CategoryShowcase() {
  const count = THEME_CATEGORIES.length;
  const wrapper = useRef<HTMLDivElement>(null);

  // Tab ke tautan di panel yang belum terlihat: scroll sampai panelnya tampil.
  const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    const panel = (event.target as HTMLElement).closest<HTMLElement>('[data-panel]');
    const scene = wrapper.current?.closest<HTMLElement>('.scene');
    if (!panel || !scene) return;
    const index = Number(panel.dataset.panel);
    const top = scene.getBoundingClientRect().top + window.scrollY;
    const travel = scene.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (travel * index) / (count - 1), behavior: 'auto' });
  };

  return (
    <Scene length={`${count * 85}vh`} className="cat-scene" stageClassName="overflow-clip">
      <div ref={wrapper} onFocus={handleFocus} className="h-full">
        <Motion
          unit="%"
          keys={[[0.02, {}], [0.98, { x: (-100 * (count - 1)) / count }]]}
          className="cat-track flex h-full"
          style={{ width: `${count * 100}%` }}
        >
          {THEME_CATEGORIES.map((category, panel) => {
            // Rentang scroll saat panel ini lewat di layar.
            const center = panel / (count - 1);
            const span = 1 / (count - 1);
            // Tepat di tengah adegan semua isi panel kembali ke tempatnya.
            const pass = (drift: number): Keyframe[] => [
              [center - span, { x: drift }],
              [center, {}],
              [center + span, { x: -drift }],
            ];
            return (
              <article
                key={category.slug}
                data-panel={panel}
                style={{ backgroundColor: category.color, color: category.ink, width: `${100 / count}%` }}
                className="relative flex h-full flex-col overflow-hidden px-5 pb-8 pt-20 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-10 md:px-[6vw] md:pb-0 md:pt-16"
              >
                <Motion keys={pass(70)} className="relative z-10 min-w-0">
                  <h2
                    style={{ fontFamily: category.font, letterSpacing: 'normal' }}
                    className={`font-normal leading-[1.28] ${
                      category.slug === 'game-retro'
                        ? 'text-[clamp(1.5rem,4.2vw,3.8rem)] leading-[1.4]'
                        : 'text-[clamp(3rem,8vw,7.5rem)]'
                    }`}
                  >
                    {category.name}
                  </h2>
                  <p className="mt-5 max-w-md text-lg leading-relaxed md:mt-9 md:text-xl">{category.blurb}</p>
                  <Link
                    href={`/themes#${category.slug}`}
                    style={{ backgroundColor: category.ink, color: category.color }}
                    className="btn mt-5 px-6 py-3 text-base hover:opacity-85 md:mt-7"
                  >
                    Lihat {getThemesInCategory(category.name).length} frame
                  </Link>
                </Motion>

                <div className="relative mt-auto flex items-end justify-center gap-3 pt-5 md:mt-0 md:items-center md:gap-6 md:pt-0">
                  {category.showcase.map((id, i) => (
                    <Motion key={id} keys={pass(90 + i * 110)} className="w-[min(29vw,23svh)] md:w-[min(14vw,26svh)]">
                      <Link href={`/studio?theme=${id}`} aria-label={`Foto dengan frame ${getThemeById(id).name}`} className="block">
                        <div
                          className="strip-lift overflow-hidden rounded-[3px] shadow-[0_24px_40px_-20px_rgb(0_0_0/0.55)]"
                          style={{ rotate: `${[-4, 2, 5][i]}deg`, translate: `0 ${[0, -18, 10][i]}px` }}
                        >
                          <StripPreview theme={getThemeById(id)} offset={panel + i} />
                        </div>
                      </Link>
                    </Motion>
                  ))}
                </div>
              </article>
            );
          })}
        </Motion>
      </div>
    </Scene>
  );
}

function FilterWipe() {
  const presets = FILTER_SHOW.map((id) => FILTER_PRESETS.find((f) => f.id === id)!);
  const steps = presets.length - 1;

  return (
    <Scene length="360vh" stageClassName="bg-page">
      <div className="page-wrap grid h-full items-center gap-6 pb-6 pt-20 md:grid-cols-2 md:gap-16 md:pb-0 md:pt-16">
        <div>
          <h2 className="text-[clamp(2.6rem,6.5vw,5.5rem)] font-extrabold leading-[0.98]">
            {FILTER_PRESETS.length} filter, dari pipi pink sampai noir
          </h2>
          <div className="filter-names relative mt-4 h-10 md:mt-7 md:h-12">
            {presets.map((preset, i) => {
              const at = i / steps;
              const gap = 0.3 / steps;
              const keys: [number, { o: number; y: number }][] = [
                [at - gap, { o: i === 0 ? 1 : 0, y: i === 0 ? 0 : 22 }],
                [at, { o: 1, y: 0 }],
                [at + 1 / steps - gap, { o: 1, y: 0 }],
                [at + 1 / steps, { o: i === steps ? 1 : 0, y: i === steps ? 0 : -22 }],
              ];
              return (
                <Motion
                  key={preset.id}
                  keys={keys}
                  className="absolute left-0 top-0 font-display text-2xl font-semibold md:text-4xl"
                >
                  <span className="rounded-full bg-[rgb(var(--flash))] px-4 py-1 text-[#111111]">
                    {preset.id === 'normal' ? 'Tanpa filter' : preset.name}
                  </span>
                </Motion>
              );
            })}
          </div>
        </div>

        <div className="relative mx-auto aspect-[4/5] h-auto max-h-[62svh] w-full max-w-[min(78vw,50svh)] overflow-hidden rounded-[6px] bg-surface shadow-[0_40px_70px_-34px_rgb(0_0_0/0.6)] md:max-h-[78svh] md:max-w-[62svh]">
          {presets.map((preset, i) => {
            const image = (
              <div className="absolute inset-0">
                <img
                  src={getSamplePhoto(0)}
                  alt={i === 0 ? 'Foto contoh yang berganti filter saat kamu scroll' : ''}
                  decoding="async"
                  draggable={false}
                  style={{ filter: preset.id === 'normal' ? undefined : preset.css }}
                  className="h-full w-full object-cover"
                />
                {preset.overlay && <OverlayLayer overlay={preset.overlay} />}
              </div>
            );
            if (i === 0) return <div key={preset.id}>{image}</div>;
            // Lapisan luar masuk dari kanan dan lapisan dalam bergerak berlawanan, jadi fotonya diam
            // dan hanya tepi filternya yang menyapu. Tanpa clip-path, sehingga tidak perlu digambar ulang.
            const start = (i - 1) / steps + 0.03;
            const end = i / steps - 0.03;
            return (
              <Motion key={preset.id} unit="%" keys={[[start, { x: 100 }], [end, { x: 0 }]]} className="wipe-layer absolute inset-0 overflow-hidden">
                <Motion unit="%" keys={[[start, { x: -100 }], [end, { x: 0 }]]} className="absolute inset-0">
                  {image}
                </Motion>
              </Motion>
            );
          })}
        </div>
      </div>
    </Scene>
  );
}

const DUO_NAMES = ['Nadia', 'Raka', 'Sinta', 'Dimas', 'Tiara', 'Fajar', 'Ayu', 'Bagas'];
const DUO_CITIES = ['Jakarta', 'Surabaya', 'Yogyakarta', 'Makassar', 'Denpasar', 'Semarang', 'Malang', 'Palembang'];

function pickTwo(items: string[]) {
  const first = Math.floor(Math.random() * items.length);
  const second = (first + 1 + Math.floor(Math.random() * (items.length - 1))) % items.length;
  return [items[first], items[second]];
}

function DuoStory() {
  // Diacak setelah halaman terpasang, supaya hasil server dan browser tetap sama.
  const [labels, setLabels] = useState<string[] | null>(null);
  useEffect(() => {
    const names = pickTwo(DUO_NAMES);
    const cities = pickTwo(DUO_CITIES);
    setLabels([`${names[0]}, ${cities[0]}`, `${names[1]}, ${cities[1]}`]);
  }, []);

  const theme = getThemeById('hati-bubblegum');
  return (
    <section className="ink-panel relative overflow-hidden">
      <div className="page-wrap grid items-center gap-10 py-20 md:grid-cols-2 md:py-32 lg:gap-24">
        <Reveal>
          <h2 className="text-[clamp(2.6rem,6.5vw,5.5rem)] font-extrabold leading-[0.98]">Satu strip, walau beda kota</h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed">
            Buat room dan kirim kodenya ke temanmu. Kalian foto dari perangkat masing-masing, boleh di waktu yang berbeda,
            lalu foto kalian bergabung di satu strip.
          </p>
          <Link href="/room" className="btn-primary mt-8 px-6 py-3 text-base">
            Buat room
          </Link>
        </Reveal>

        <div className="flex items-center justify-center">
          <Motion keys={[[0.1, { x: -300, r: -14, y: 70 }], [0.52, { x: 0, r: -2, y: 0 }]]} className="w-[38%] max-w-[220px]">
            <p className="mb-3 text-center text-sm font-semibold">{labels?.[0] ?? ' '}</p>
            <div className="overflow-hidden rounded-[3px]">
              <StripPreview theme={theme} offset={0} />
            </div>
          </Motion>
          <Motion keys={[[0.1, { x: 300, r: 14, y: -70 }], [0.52, { x: 0, r: 2, y: 0 }]]} className="-ml-1 w-[38%] max-w-[220px]">
            <p className="mb-3 text-center text-sm font-semibold">{labels?.[1] ?? ' '}</p>
            <div className="overflow-hidden rounded-[3px]">
              <StripPreview theme={theme} offset={3} />
            </div>
          </Motion>
        </div>
      </div>
    </section>
  );
}

function Steps() {
  return (
    <section className="page-wrap pb-10 pt-20 md:pt-28">
      <h2 className="mb-10 text-[clamp(2.6rem,6.5vw,5.5rem)] font-extrabold leading-none">Cara pakainya</h2>
      <ol>
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className="sticky mb-6 overflow-hidden rounded-3xl"
            style={{ top: `${5 + i * 1.5}rem`, backgroundColor: step.color, color: step.ink }}
          >
            <div className="grid min-h-[58svh] items-center gap-6 p-7 sm:grid-cols-[minmax(0,1fr)_auto] md:p-14">
              <div>
                <span className="font-display text-[clamp(4.5rem,11vw,9rem)] font-extrabold leading-none">{i + 1}</span>
                <h3 className="mt-4 text-3xl font-extrabold md:text-5xl">{step.title}</h3>
                <p className="mt-3 max-w-md text-lg leading-relaxed">{step.text}</p>
              </div>
              <div className="hidden w-[150px] -rotate-3 overflow-hidden rounded-[3px] sm:block md:w-[190px]">
                <StripPreview theme={getThemeById(step.theme)} offset={i * 2} />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Closing() {
  return (
    <section className="relative overflow-hidden bg-[rgb(var(--flash))] text-[#111111]">
      <Motion keys={[[0.1, { y: 260, r: -18 }], [0.8, { y: 0, r: -8 }]]} className="absolute -bottom-16 left-[4%] w-[clamp(90px,14vw,200px)]">
        <div className="overflow-hidden rounded-[3px]">
          <StripPreview theme={getThemeById('ceri-manis')} offset={1} />
        </div>
      </Motion>
      <Motion keys={[[0.1, { y: 360, r: 18 }], [0.8, { y: 0, r: 9 }]]} className="absolute -bottom-20 right-[4%] w-[clamp(90px,14vw,200px)]">
        <div className="overflow-hidden rounded-[3px]">
          <StripPreview theme={getThemeById('dino-hijau')} offset={3} />
        </div>
      </Motion>
      <div className="page-wrap relative flex min-h-[70svh] flex-col items-center justify-center py-20 pb-44 text-center md:pb-24">
        <Motion keys={[[0.05, { s: 0.6, o: 0.2 }], [0.55, { s: 1, o: 1 }]]}>
          <h2 className="text-[clamp(4rem,14vw,12rem)] font-extrabold leading-[0.9]">Siap difoto?</h2>
        </Motion>
        <Link href="/studio" className="btn mt-9 bg-[#111111] px-8 py-4 text-lg text-white hover:bg-white hover:text-[#111111]">
          Mulai foto
        </Link>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryShowcase />
      <FilterWipe />
      <DuoStory />
      <Steps />

      <section className="page-wrap grid gap-8 pb-20 pt-12 md:grid-cols-[1fr_2fr] md:pb-28">
        <h2 className="text-4xl font-extrabold leading-[1.05]">Yang sering ditanyakan</h2>
        <div className="border-t border-line">
          {FAQ.map((item) => (
            <details key={item.q} className="border-b border-line">
              <summary className="flex items-center justify-between gap-4 py-5 text-lg font-semibold">
                {item.q}
                <Plus className="faq-mark h-5 w-5 shrink-0" aria-hidden="true" />
              </summary>
              <p className="max-w-2xl pb-6 leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <Closing />
    </>
  );
}
