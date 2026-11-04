'use client';

interface CountdownOverlayProps {
  count: number | null;
}

export default function CountdownOverlay({ count }: CountdownOverlayProps) {
  if (count === null || count <= 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex select-none items-center justify-center bg-black/20">
      <div key={count} className="animate-countdown text-8xl font-extrabold tabular-nums text-white drop-shadow-lg sm:text-9xl">
        {count}
      </div>
    </div>
  );
}
