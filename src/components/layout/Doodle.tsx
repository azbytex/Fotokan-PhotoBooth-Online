const PATHS = {
  heart: 'M12 21C5 15.5 2 12 2 8a5 5 0 0 1 10-1.6A5 5 0 0 1 22 8c0 4-3 7.5-10 13Z',
  sparkle: 'M12 1c.8 7 3.2 10 11 11-7.8 1-10.2 4-11 11-.8-7-3.2-10-11-11 7.8-1 10.2-4 11-11Z',
  star: 'm12 2 3 6.6 7.2.8-5.4 4.8 1.5 7.1L12 17.7l-6.3 3.6 1.5-7.1L1.8 9.4 9 8.6Z',
  flower:
    'M12 8.5a3.8 3.8 0 1 1 3.3-5.7A3.8 3.8 0 1 1 20.8 9a3.8 3.8 0 1 1-2 6.7 3.8 3.8 0 1 1-6.8 3.2 3.8 3.8 0 1 1-6.8-3.2 3.8 3.8 0 1 1-2-6.7 3.8 3.8 0 1 1 5.5-6.2A3.8 3.8 0 0 1 12 8.5Z',
} as const;

export default function Doodle({
  kind,
  color,
  className = '',
}: {
  kind: keyof typeof PATHS;
  color: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill={color}>
      <path d={PATHS[kind]} />
    </svg>
  );
}
