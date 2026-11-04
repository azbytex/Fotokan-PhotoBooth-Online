'use client';

interface ShutterFlashProps {
  active: boolean;
}

export default function ShutterFlash({ active }: ShutterFlashProps) {
  if (!active) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-50 pointer-events-none bg-white animate-flash"
      style={{
        boxShadow: 'inset 0 0 100px rgba(255,255,255,0.8)',
      }}
    />
  );
}

