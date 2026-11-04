'use client';

import { useState, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';

interface RoomInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
}

function CopyRow({ label, value, copied, onCopy }: { label: string; value: string; copied: boolean; onCopy: () => void }) {
  return (
    <div>
      <span className="field-label">{label}</span>
      <div className="flex gap-2">
        <input type="text" readOnly value={value} aria-label={label} className="field min-w-0 flex-1" />
        <button type="button" onClick={onCopy} className="btn-secondary shrink-0">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Tersalin' : 'Salin'}
        </button>
      </div>
    </div>
  );
}

export default function RoomInviteModal({ isOpen, onClose, roomCode }: RoomInviteModalProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [localIp, setLocalIp] = useState<string | null>(null);

  const isLocalhost = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);

  // Saat dibuka dari localhost, teman perlu alamat Wi-Fi laptop. Di situs online, alamatnya sudah benar.
  useEffect(() => {
    if (!isOpen || !isLocalhost) return;
    fetch('/api/server-info')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setLocalIp(data?.localIp ?? null))
      .catch(() => {});
  }, [isOpen, isLocalhost]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const base =
    isLocalhost && localIp ? `http://${localIp}:${window.location.port || '3000'}` : typeof window !== 'undefined' ? window.location.origin : '';
  const inviteUrl = `${base}/room/${roomCode}`;
  const isHttps = base.startsWith('https:');

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (e) {
      console.warn('Copy error:', e);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-title"
        className="relative max-h-full w-full max-w-md overflow-y-auto rounded-xl bg-page p-5 shadow-xl sm:p-6"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="absolute right-3 top-3 rounded-lg p-2 text-muted hover:bg-surface hover:text-fg"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 id="invite-title" className="pr-8 text-xl font-bold">Undang teman</h2>
        <p className="mt-1 text-sm text-muted">
          Kirim hanya ke satu orang yang kamu ajak. Orang pertama yang bergabung mengisi tempat itu, dan setelahnya kode ini tidak bisa
          dipakai orang lain.
        </p>

        <div className="mt-5 rounded-lg bg-surface p-4 text-center">
          <span className="block text-sm text-muted">Kode room</span>
          <span className="mt-1 block select-all text-2xl font-extrabold tracking-wider">{roomCode}</span>
        </div>

        <div className="mt-5">
          <CopyRow label="Link undangan" value={inviteUrl} copied={isCopied} onCopy={copyLink} />
          {!isHttps && (
            <p className="mt-1.5 text-xs leading-relaxed text-muted">
              Link ini hanya terbuka di jaringan Wi-Fi yang sama. Browser HP bisa memblokir kamera, tetapi temanmu tetap bisa memilih
              foto dari galeri.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
