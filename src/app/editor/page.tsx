'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookmarkPlus } from 'lucide-react';
import PhotoStripCanvas from '@/components/studio/PhotoStripCanvas';
import StickerPicker from '@/components/editor/StickerPicker';
import TextCustomizer from '@/components/editor/TextCustomizer';
import LayoutSelector from '@/components/studio/LayoutSelector';
import ThemePicker from '@/components/studio/ThemePicker';
import { getThemeById } from '@/lib/themes/themeCatalog';
import { loadEditorDraft } from '@/lib/editorDraft';
import { saveEditorDraft } from '@/lib/editorDraft';
import { saveToGallery } from '@/lib/gallery';
import { saveResultSession } from '@/lib/resultSession';
import { LayoutType, PlacedSticker, ShotItem, ThemeDefinition } from '@/lib/types';
import { getSamplePhoto } from '@/lib/canvas/samplePhotos';

type Tab = 'stickers' | 'text' | 'themes' | 'layout';

export default function EditorPage() {
  const router = useRouter();
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTheme, setActiveTheme] = useState<ThemeDefinition>(() => getThemeById('korean-haru'));
  const [layout, setLayout] = useState<LayoutType>('4-cut');
  const [customCaption, setCustomCaption] = useState<string>('FOTOKAN');
  const [customDate, setCustomDate] = useState<string>('');
  const [bgColor, setBgColor] = useState<string>(activeTheme.bgColor);
  const [watermark, setWatermark] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<Tab>('stickers');

  const [shots, setShots] = useState<ShotItem[]>(() => [
    { id: '1', dataUrl: getSamplePhoto(0), timestamp: Date.now() },
    { id: '2', dataUrl: getSamplePhoto(1), timestamp: Date.now() },
    { id: '3', dataUrl: getSamplePhoto(2), timestamp: Date.now() },
    { id: '4', dataUrl: getSamplePhoto(3), timestamp: Date.now() },
  ]);
  const [peerShots, setPeerShots] = useState<ShotItem[]>([]);
  const [hostName, setHostName] = useState<string | undefined>();
  const [peerName, setPeerName] = useState<string | undefined>();
  const [isSample, setIsSample] = useState(true);

  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([
    { id: 's1', symbol: '✨', x: 22, y: 15, scale: 1.1, rotation: -12 },
    { id: 's2', symbol: '🤍', x: 78, y: 38, scale: 1.0, rotation: 15 },
    { id: 's3', symbol: '🌸', x: 80, y: 88, scale: 1.2, rotation: 10 },
  ]);

  useEffect(() => {
    let isCurrent = true;
    loadEditorDraft().then((draft) => {
      if (!isCurrent || !draft || draft.shots.length + draft.peerShots.length === 0) return;
      const theme = getThemeById(draft.themeId);
      setActiveTheme(theme);
      setBgColor(draft.bgColor ?? theme.bgColor);
      setCustomCaption(draft.customCaption ?? 'FOTOKAN');
      setCustomDate(draft.customDate ?? '');
      setWatermark(draft.watermark ?? true);
      setLayout(draft.layout);
      setShots(draft.shots);
      setPeerShots(draft.peerShots);
      setHostName(draft.hostName);
      setPeerName(draft.peerName);
      setPlacedStickers(draft.stickers ?? []);
      setIsSample(false);
    });
    return () => {
      isCurrent = false;
    };
  }, []);

  const currentContent = () => ({
    shots,
    peerShots,
    stickers: placedStickers,
    customCaption,
    customDate,
    watermark,
    hostName,
    peerName,
    bgColor,
  });

  const handleSaveToGallery = async () => {
    setIsSaving(true);
    setSaveNotice(null);
    try {
      await saveToGallery(activeTheme.id, layout, currentContent());
      setSaveNotice('Tersimpan di galeri.');
    } catch {
      setSaveNotice('Strip tidak bisa disimpan di browser ini.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenResult = async () => {
    setIsSaving(true);
    const content = currentContent();
    // Foto contoh tidak disimpan sebagai draft, supaya tidak dianggap foto milik pengguna.
    if (!isSample) saveEditorDraft({ themeId: activeTheme.id, layout, ...content });
    await saveResultSession({ ...content, themeId: activeTheme.id, layout }).catch(() => {});
    router.push('/result?from=/editor');
  };

  const handleSelectTheme = (theme: ThemeDefinition) => {
    setActiveTheme(theme);
    setBgColor(theme.bgColor);
  };

  const handleAddSticker = (symbol: string) => {
    const newSticker: PlacedSticker = {
      id: Math.random().toString(36).substring(2, 9),
      symbol,
      x: 30 + Math.random() * 40,
      y: 20 + Math.random() * 60,
      scale: 1.0,
      rotation: Math.floor(Math.random() * 30 - 15),
    };
    setPlacedStickers((prev) => [...prev, newSticker]);
  };

  const handleRemoveSticker = (id: string) => {
    setPlacedStickers((prev) => prev.filter((s) => s.id !== id));
  };

  const handleClearStickers = () => {
    setPlacedStickers([]);
  };

  const handleUpdateStickerScale = (id: string, delta: number) => {
    setPlacedStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, scale: Math.max(0.4, Math.min(2.5, s.scale + delta)) } : s))
    );
  };

  const handleMoveSticker = (id: string, x: number, y: number) => {
    setPlacedStickers((prev) => prev.map((s) => (s.id === id ? { ...s, x, y } : s)));
  };

  const handleRotateSticker = (id: string) => {
    setPlacedStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, rotation: (s.rotation + 30) % 360 } : s))
    );
  };

  const effectiveTheme: ThemeDefinition = { ...activeTheme, bgColor };
  const isDuo = peerShots.length > 0 || layout.startsWith('duo-');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'stickers', label: `Stiker (${placedStickers.length})` },
    { id: 'text', label: 'Teks dan warna' },
    { id: 'themes', label: 'Frame' },
    { id: 'layout', label: 'Layout' },
  ];

  return (
    <div className="page-wrap py-8 md:py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Editor</h1>

      {isSample && (
        <p className="mt-3 rounded-lg bg-surface p-3 text-sm text-muted">
          Ini foto contoh.{' '}
          <Link href="/studio" className="font-semibold text-fg underline">
            Ambil foto dulu di studio
          </Link>{' '}
          untuk mengedit strip milikmu.
        </p>
      )}

      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-10">
        <aside className="lg:sticky lg:top-24">
          <PhotoStripCanvas
            theme={effectiveTheme}
            layout={layout}
            shots={shots}
            peerShots={peerShots}
            stickers={placedStickers}
            onMoveSticker={handleMoveSticker}
            customCaption={customCaption}
            customDate={customDate}
            watermark={watermark}
            hostName={hostName}
            peerName={peerName}
          />
          <div className="mx-auto mt-3 grid max-w-[320px] gap-2">
            <button type="button" onClick={handleOpenResult} disabled={isSaving} className="btn-primary">
              Lihat hasil dan unduh
              <ArrowRight className="h-4 w-4" />
            </button>
            {!isSample && (
              <button type="button" onClick={handleSaveToGallery} disabled={isSaving} className="btn-secondary">
                <BookmarkPlus className="h-4 w-4" />
                Simpan ke galeri
              </button>
            )}
            {saveNotice && (
              <p role="status" className="text-center text-sm text-muted">
                {saveNotice}
              </p>
            )}
          </div>
        </aside>

        <div className="min-w-0">
          <div role="tablist" className="flex gap-5 overflow-x-auto border-b border-line text-sm font-medium">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`-mb-px whitespace-nowrap border-b-2 pb-3 pt-1 ${
                  activeTab === tab.id ? 'border-brand text-fg' : 'border-transparent text-muted hover:text-fg'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="pt-6">
            {activeTab === 'stickers' && (
              <StickerPicker
                onAddSticker={handleAddSticker}
                placedStickers={placedStickers}
                onRemoveSticker={handleRemoveSticker}
                onClearStickers={handleClearStickers}
                onUpdateStickerScale={handleUpdateStickerScale}
                onRotateSticker={handleRotateSticker}
                activeThemeStickers={activeTheme.stickers}
              />
            )}

            {activeTab === 'text' && (
              <TextCustomizer
                customCaption={customCaption}
                setCustomCaption={setCustomCaption}
                customDate={customDate}
                setCustomDate={setCustomDate}
                bgColor={bgColor}
                setBgColor={setBgColor}
                watermark={watermark}
                setWatermark={setWatermark}
                hasFixedFrameColor={Boolean(activeTheme.decor)}
              />
            )}

            {activeTab === 'themes' && <ThemePicker selectedId={activeTheme.id} onSelect={handleSelectTheme} />}

            {activeTab === 'layout' && (
              <LayoutSelector
                layout={layout}
                setLayout={setLayout}
                isMultiplayer={isDuo}
                availablePhotos={isSample ? undefined : isDuo ? Math.min(shots.length, peerShots.length) : shots.length}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
