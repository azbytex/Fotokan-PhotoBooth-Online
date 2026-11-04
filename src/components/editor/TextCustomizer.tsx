'use client';

interface TextCustomizerProps {
  customCaption: string;
  setCustomCaption: (val: string) => void;
  customDate: string;
  setCustomDate: (val: string) => void;
  bgColor: string;
  setBgColor: (val: string) => void;
  watermark: boolean;
  setWatermark: (val: boolean) => void;
  hasFixedFrameColor?: boolean;
}

const BG_SWATCHES = [
  { name: 'Krem', hex: '#F2EEE7' },
  { name: 'Biru muda', hex: '#E2EEF8' },
  { name: 'Lavender', hex: '#F4ECF8' },
  { name: 'Kuning madu', hex: '#EBDCB9' },
  { name: 'Perak', hex: '#E6EBF0' },
  { name: 'Pink muda', hex: '#FFEAEF' },
  { name: 'Putih', hex: '#FFFFFF' },
  { name: 'Arang', hex: '#1B1A18' },
  { name: 'Cokelat gelap', hex: '#1C1917' },
];

export default function TextCustomizer({
  customCaption,
  setCustomCaption,
  customDate,
  setCustomDate,
  bgColor,
  setBgColor,
  watermark,
  setWatermark,
  hasFixedFrameColor = false,
}: TextCustomizerProps) {
  return (
    <div className="max-w-lg space-y-5">
      <div>
        <label htmlFor="strip-caption" className="field-label">Judul strip</label>
        <input
          id="strip-caption"
          type="text"
          value={customCaption}
          onChange={(e) => setCustomCaption(e.target.value)}
          placeholder="Nama kalian"
          maxLength={32}
          className="field"
        />
      </div>

      <div>
        <label htmlFor="strip-date" className="field-label">Tanggal atau lokasi</label>
        <input
          id="strip-date"
          type="text"
          value={customDate}
          onChange={(e) => setCustomDate(e.target.value)}
          placeholder="30 Okt 2026, Jakarta"
          maxLength={40}
          className="field"
        />
      </div>

      {hasFixedFrameColor ? (
        <p className="text-sm text-muted">Warna frame ini mengikuti desainnya. Pilih tema polos kalau mau mengganti warna.</p>
      ) : (
      <div>
        <span className="field-label">Warna frame</span>
        <div className="flex flex-wrap items-center gap-2.5">
          {BG_SWATCHES.map((swatch) => (
            <button
              key={swatch.hex}
              type="button"
              onClick={() => setBgColor(swatch.hex)}
              title={swatch.name}
              aria-label={swatch.name}
              aria-pressed={bgColor.toLowerCase() === swatch.hex.toLowerCase()}
              style={{ backgroundColor: swatch.hex }}
              className={`h-8 w-8 rounded-full border ${
                bgColor.toLowerCase() === swatch.hex.toLowerCase()
                  ? 'border-page ring-2 ring-fg'
                  : 'border-line'
              }`}
            />
          ))}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="h-8 w-8 cursor-pointer rounded bg-transparent"
            />
            Warna lain
          </label>
        </div>
      </div>
      )}

      <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium">
        <input
          type="checkbox"
          checked={watermark}
          onChange={(e) => setWatermark(e.target.checked)}
          className="h-4 w-4 cursor-pointer accent-[rgb(var(--brand))]"
        />
        Tampilkan watermark Fotokan
      </label>
    </div>
  );
}
