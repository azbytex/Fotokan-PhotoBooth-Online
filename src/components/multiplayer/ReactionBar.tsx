'use client';

import { useState } from 'react';

interface ReactionBarProps {
  onSendReaction: (emoji: string) => void;
  activeReactions: { id: string; emoji: string; x: number }[];
}

const EMOJIS = ['❤️', '✌️', '✨', '📸', '😆', '🥂', '🎉', '🫶'];

export default function ReactionBar({
  onSendReaction,
  activeReactions,
}: ReactionBarProps) {
  return (
    <>
      {/* Floating Animated Emojis in Screen */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {activeReactions.map((r) => (
          <div
            key={r.id}
            className="absolute bottom-24 text-4xl animate-float-up select-none"
            style={{ left: `${r.x}%` }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* Floating Reaction Bar at bottom */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-studio/90 backdrop-blur-md border border-studio-border shadow-2xl">
        <span className="text-[10px] font-mono text-studio-muted px-2 hidden sm:inline">
          Reaksi:
        </span>
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSendReaction(emoji)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg hover:scale-125 active:scale-95 transition-transform"
          >
            {emoji}
          </button>
        ))}
      </div>
    </>
  );
}

