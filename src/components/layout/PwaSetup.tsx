'use client';

import { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';

interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** Mendaftarkan service worker di versi produksi. Di mode dev dilewati supaya halaman tidak tersimpan cache. */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch((err) => console.warn('Service worker gagal didaftarkan:', err));
  }, []);
  return null;
}

/** Tombol pasang aplikasi. Hanya muncul kalau browser mendukung dan aplikasinya belum terpasang. */
export function InstallApp() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    if (isInstalled) return;
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIos) setShowIosHint(true);

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPrompt);
    };
    const onInstalled = () => setPrompt(null);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (prompt) {
    return (
      <button
        type="button"
        onClick={async () => {
          await prompt.prompt();
          await prompt.userChoice.catch(() => {});
          setPrompt(null);
        }}
        className="btn-secondary mt-4"
      >
        <Smartphone className="h-4 w-4" />
        Pasang aplikasi
      </button>
    );
  }

  if (showIosHint) {
    return <p className="mt-3 text-xs leading-relaxed text-muted">Di iPhone: ketuk Bagikan di Safari, lalu Tambah ke Layar Utama.</p>;
  }

  return null;
}
