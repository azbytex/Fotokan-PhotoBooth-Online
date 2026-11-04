'use client';

import { useEffect, useRef } from 'react';
import { Mic, MicOff, Users, Wifi, Copy, Check, Volume2 } from 'lucide-react';
import CameraPreview, { CameraPreviewRef } from '../studio/CameraPreview';

interface DuoCameraGridProps {
  localCameraRef: React.RefObject<CameraPreviewRef>;
  remoteStream: MediaStream | null;
  localName: string;
  remoteName: string;
  isPeerConnected: boolean;
  roomCode: string;
  filterCss?: string;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  isMirrored?: boolean;
  isMuted: boolean;
  toggleMute: () => void;
  onCopyInvite: () => void;
  hasCopied: boolean;
  onStreamReady?: (stream: MediaStream) => void;
}

export default function DuoCameraGrid({
  localCameraRef,
  remoteStream,
  localName,
  remoteName,
  isPeerConnected,
  roomCode,
  filterCss = 'none',
  brightness = 100,
  contrast = 100,
  saturation = 100,
  isMirrored = true,
  isMuted,
  toggleMute,
  onCopyInvite,
  hasCopied,
  onStreamReady,
}: DuoCameraGridProps) {
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.muted = false; // UNMUTED so you hear your friend!
      remoteVideoRef.current.play().catch((err) => {
        console.warn('AutoPlay with audio blocked by browser, click to unmute:', err);
      });
    }
  }, [remoteStream]);

  return (
    <div className="w-full">
      {/* Remote Status Bar */}
      <div className="flex items-center justify-between mb-3 px-1 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-studio-card border border-studio-border text-studio-fg">
            <Wifi className={`w-3 h-3 ${isPeerConnected ? 'text-green-400' : 'text-amber-400 animate-pulse'}`} />
            {isPeerConnected ? 'Live Video Call Terhubung (P2P)' : 'Menunggu Teman Terhubung...'}
          </span>
          <span className="text-studio-muted hidden sm:inline">Room: {roomCode}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className={`px-2.5 py-1 rounded text-[11px] flex items-center gap-1.5 border transition-colors ${
              isMuted
                ? 'bg-red-500/20 text-red-300 border-red-500/30'
                : 'bg-studio-card text-studio-fg border-studio-border hover:bg-studio-surface'
            }`}
          >
            {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-green-400" />}
            <span>{isMuted ? 'Mic Muted' : 'Mic Aktif (Live)'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Two Cameras Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Local Camera (You) */}
        <div className="relative group rounded-lg overflow-hidden border border-studio-border">
          <CameraPreview
            ref={localCameraRef}
            filterCss={filterCss}
            brightness={brightness}
            contrast={contrast}
            saturation={saturation}
            isMirrored={isMirrored}
            enableAudio={true}
            onStreamReady={onStreamReady}
          />
          <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
            <span className="px-2.5 py-1 text-xs font-mono font-medium rounded bg-studio/85 backdrop-blur-sm border border-studio-border text-studio-fg flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span>{localName} (Kamu)</span>
            </span>
          </div>
        </div>

        {/* 2. Remote Camera (Friend) */}
        <div className="relative rounded-lg overflow-hidden border border-studio-border aspect-[4/3] bg-studio-card flex items-center justify-center">
          {remoteStream && isPeerConnected ? (
            <>
              <video
                ref={remoteVideoRef}
                playsInline
                autoPlay
                className="w-full h-full object-cover"
                style={{
                  filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${
                    filterCss !== 'none' ? filterCss : ''
                  }`,
                }}
              />
              <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
                <span className="px-2.5 py-1 text-xs font-mono font-medium rounded bg-studio/85 backdrop-blur-sm border border-gold/40 text-gold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span>{remoteName || 'Temanmu'}</span>
                </span>
              </div>
            </>
          ) : (
            <div className="p-6 text-center max-w-sm flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-studio-surface border border-dashed border-studio-border flex items-center justify-center mb-3 text-gold">
                <Users className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="font-serif text-xl text-studio-fg mb-1">
                Ajak Temanmu Masuk Live
              </h4>
              <p className="text-xs text-studio-muted font-sans mb-4">
                Buka link undangan di HP temanmu untuk mulai live video call dan berpose bersama!
              </p>
              <button
                onClick={onCopyInvite}
                className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-mono bg-gold text-studio font-medium hover:bg-gold-hover transition-colors shadow-lg"
              >
                {hasCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Link Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Lihat Link / QR untuk HP</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
