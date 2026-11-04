const BRAND_RED = '#E8473B';

const BLADES = ['M28 6 L38 24', 'M47 17 L33 32', 'M47 39 L26 38', 'M28 50 L18 32', 'M9 39 L23 24', 'M9 17 L30 18'];

/** Bilah rana kamera yang menjadi mata di logo Fotokan. Digambar di kotak 56 x 56. */
function Aperture({ face, blade, strokeWidth }: { face: string; blade: string; strokeWidth: number }) {
  return (
    <>
      <circle cx="28" cy="28" r="27" fill={face} />
      <g fill="none" stroke={blade} strokeWidth={strokeWidth} strokeLinecap="round">
        {BLADES.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </>
  );
}

/** Logo Fotokan: dua rana sebagai mata dan satu senyum. */
export function AppIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" aria-hidden="true" className={className}>
      <rect width="512" height="512" rx="112" fill={BRAND_RED} />
      <g transform="translate(78 120) scale(3.142)">
        <Aperture face="#FFFFFF" blade={BRAND_RED} strokeWidth={4.4} />
      </g>
      <g transform="translate(258 120) scale(3.142)">
        <Aperture face="#FFFFFF" blade={BRAND_RED} strokeWidth={4.4} />
      </g>
      <path d="M150 352 Q256 438 362 352" fill="none" stroke="#FFFFFF" strokeWidth="30" strokeLinecap="round" />
    </svg>
  );
}

/** Tulisan fotokan. Huruf mengikuti warna teks di sekitarnya, jadi tetap terbaca di mode gelap. */
export function Wordmark({ className = '', isSpinning = false }: { className?: string; isSpinning?: boolean }) {
  const display = { fontFamily: '"Space Grotesk", sans-serif', fontSize: 128, fontWeight: 700, letterSpacing: -4 };
  return (
    <svg viewBox="190 160 500 146" role="img" aria-label="Fotokan" className={className}>
      <g fill="currentColor" dominantBaseline="text-after-edge">
        <text x="199.64" y="281" textLength="51.81" lengthAdjust="spacingAndGlyphs" dominantBaseline="text-after-edge" style={display}>
          f
        </text>
        <text x="341.45" y="281" textLength="54.38" lengthAdjust="spacingAndGlyphs" dominantBaseline="text-after-edge" style={display}>
          t
        </text>
        <text
          x="485.83"
          y="282"
          textLength="194.53"
          lengthAdjust="spacingAndGlyphs"
          dominantBaseline="text-after-edge"
          style={{ fontFamily: 'Fraunces, serif', fontSize: 134, fontStyle: 'italic', fontWeight: 600, letterSpacing: -2 }}
        >
          kan
        </text>
      </g>
      {[255.45, 397.83].map((x) => (
        <g key={x} transform={`translate(${x} 167) scale(1.5)`}>
          <g className={isSpinning ? 'aperture-spin' : undefined}>
            <Aperture face={BRAND_RED} blade="#FFFFFF" strokeWidth={3.6} />
          </g>
        </g>
      ))}
      <path transform="translate(283.64 260)" d="M12 10 Q85 54 158 10" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
    </svg>
  );
}
