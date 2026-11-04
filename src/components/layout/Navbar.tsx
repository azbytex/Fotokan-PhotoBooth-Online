'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { AppIcon } from './BrandMark';

const LINKS = [
  { href: '/studio', label: 'Studio' },
  { href: '/room', label: 'Foto berdua' },
  { href: '/themes', label: 'Frame' },
  { href: '/editor', label: 'Editor' },
  { href: '/gallery', label: 'Galeri' },
];

export function Logo() {
  return (
    <span className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-fg">
      <AppIcon className="h-7 w-7" />
      Fotokan
    </span>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isTucked, setIsTucked] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  // Di beranda bilah menu menyingkir saat scroll turun, supaya adegan penuh layar terlihat utuh.
  useEffect(() => {
    if (pathname !== '/') {
      setIsTucked(false);
      return;
    }
    let lastY = window.scrollY;
    const handleScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) < 6) return;
      setIsTucked(y > lastY && y > 120);
      lastY = y;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  // Halaman hasil adalah layar bersih dengan kepalanya sendiri.
  if (pathname === '/result') return null;

  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <header className={`nav-bar sticky top-0 z-40 border-b border-line/70 bg-page ${isTucked && !open ? 'nav-tucked' : ''}`}>
      <div className="page-wrap flex h-16 items-center justify-between gap-6">
        <Link href="/" aria-label="Fotokan, halaman utama">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium md:flex" aria-label="Menu utama">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={isActive(link.href) ? 'text-fg' : 'text-muted transition-colors duration-200 hover:text-fg'}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/studio" className="btn-primary hidden md:inline-flex">
            Mulai foto
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
            className="-mr-2 rounded-lg p-2 text-fg md:hidden"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line bg-page md:hidden" aria-label="Menu utama">
          <div className="page-wrap flex flex-col py-2">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={`py-3 text-base font-medium ${isActive(link.href) ? 'text-fg underline' : 'text-fg'}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
