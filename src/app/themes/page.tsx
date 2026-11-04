'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Motion } from '@/components/layout/Motion';
import Reveal from '@/components/layout/Reveal';
import StripPreview from '@/components/studio/StripPreview';
import { getThemesInCategory, THEME_CATEGORIES, THEMES } from '@/lib/themes/themeCatalog';
import { ThemeDefinition } from '@/lib/types';

function ThemeCard({ theme, index }: { theme: ThemeDefinition; index: number }) {
  return (
    <article className="rise flex flex-col" style={{ '--i': index % 6 } as React.CSSProperties}>
      <Link href={`/studio?theme=${theme.id}`} aria-label={`Foto dengan frame ${theme.name}`} className="block">
        <div className="strip-lift overflow-hidden rounded-[3px]">
          <StripPreview theme={theme} offset={index} />
        </div>
      </Link>
      <h3 className="mt-3 text-base font-semibold">{theme.name}</h3>
      <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">{theme.description}</p>
      <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-sm font-semibold">
        <Link href={`/studio?theme=${theme.id}`} className="underline underline-offset-4 hover:no-underline">
          Foto sendiri
        </Link>
        <Link href={`/room?theme=${theme.id}`} className="underline underline-offset-4 hover:no-underline">
          Foto berdua
        </Link>
      </div>
    </article>
  );
}

const GRID = 'grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:gap-x-6 lg:grid-cols-5';

export default function ThemesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [current, setCurrent] = useState(THEME_CATEGORIES[0].slug);

  const query = searchQuery.trim().toLowerCase();
  const results = query
    ? THEMES.filter(
        (theme) =>
          theme.name.toLowerCase().includes(query) ||
          theme.description.toLowerCase().includes(query) ||
          theme.category.toLowerCase().includes(query)
      )
    : [];

  // Tandai kategori yang sedang terlihat di bilah pilihan.
  useEffect(() => {
    if (query) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setCurrent(entry.target.id);
        });
      },
      { rootMargin: '-35% 0px -60% 0px' }
    );
    THEME_CATEGORIES.forEach(({ slug }) => {
      const section = document.getElementById(slug);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, [query]);

  return (
    <div>
      <div className="page-wrap pb-6 pt-12 md:pt-20">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h1 className="text-5xl font-extrabold leading-none md:text-7xl">{THEMES.length} frame, {THEME_CATEGORIES.length} kategori</h1>
          <div className="relative md:w-72">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari frame"
              aria-label="Cari frame"
              className="field pl-10"
            />
          </div>
        </div>
      </div>

      {!query && (
        <nav aria-label="Kategori frame" className="sticky top-16 z-30 border-b border-line bg-page">
          <div className="page-wrap flex gap-2 overflow-x-auto py-3">
            {THEME_CATEGORIES.map(({ name, slug }) => (
              <a
                key={slug}
                href={`#${slug}`}
                aria-current={current === slug ? 'true' : undefined}
                className={`chip ${current === slug ? 'chip-on' : ''}`}
              >
                {name}
              </a>
            ))}
          </div>
        </nav>
      )}

      {query ? (
        <div className="page-wrap py-10">
          {results.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-lg font-semibold">Belum ada frame untuk &ldquo;{searchQuery}&rdquo;</p>
              <button type="button" onClick={() => setSearchQuery('')} className="btn-secondary mt-4">
                Hapus pencarian
              </button>
            </div>
          ) : (
            <Reveal key={query} className={`rise-group ${GRID}`}>
              {results.map((theme, i) => (
                <ThemeCard key={theme.id} theme={theme} index={i} />
              ))}
            </Reveal>
          )}
        </div>
      ) : (
        THEME_CATEGORIES.map((category) => {
          const themes = getThemesInCategory(category.name);
          return (
            <section key={category.slug} id={category.slug} className="scroll-mt-32 pb-16 md:pb-24">
              <div className="overflow-hidden" style={{ backgroundColor: category.color, color: category.ink }}>
                <div className="page-wrap flex flex-wrap items-end justify-between gap-x-8 gap-y-2 py-8 md:py-12">
                  <Motion keys={[[0, { x: -50 }], [0.6, { x: 0 }]]} className="min-w-0">
                    <h2
                      style={{ fontFamily: category.font, letterSpacing: 'normal' }}
                      className={`font-normal leading-[1.15] ${
                        category.slug === 'game-retro' ? 'text-2xl leading-[1.4] md:text-4xl' : 'text-5xl md:text-7xl'
                      }`}
                    >
                      {category.name}
                    </h2>
                  </Motion>
                  <p className="max-w-sm pb-1 leading-relaxed">
                    {themes.length} frame. {category.blurb}
                  </p>
                </div>
              </div>
              <Reveal className={`rise-group page-wrap mt-8 ${GRID}`}>
                {themes.map((theme, i) => (
                  <ThemeCard key={theme.id} theme={theme} index={i} />
                ))}
              </Reveal>
            </section>
          );
        })
      )}
    </div>
  );
}
