import Link from 'next/link';
import { Wordmark } from './BrandMark';
import { Logo } from './Navbar';
import { InstallApp } from './PwaSetup';

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="page-wrap flex flex-col gap-8 py-10 sm:flex-row sm:justify-between">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Photobooth online untuk foto sendiri atau berdua dari jauh.
          </p>
          <InstallApp />
        </div>

        <div className="flex gap-16 text-sm">
          <div className="flex flex-col gap-2.5">
            <span className="font-semibold">Foto</span>
            <Link href="/studio" className="text-muted hover:text-fg">Studio</Link>
            <Link href="/room" className="text-muted hover:text-fg">Foto berdua</Link>
          </div>
          <div className="flex flex-col gap-2.5">
            <span className="font-semibold">Hasil</span>
            <Link href="/themes" className="text-muted hover:text-fg">Frame</Link>
            <Link href="/editor" className="text-muted hover:text-fg">Editor</Link>
            <Link href="/gallery" className="text-muted hover:text-fg">Galeri</Link>
          </div>
        </div>
      </div>
      <div className="page-wrap pb-8 pt-2">
        <Wordmark className="mx-auto block w-full max-w-4xl" />
      </div>
      <div className="border-t border-line">
        <p className="page-wrap py-5 text-xs text-muted">© 2026 Fotokan</p>
      </div>
    </footer>
  );
}
