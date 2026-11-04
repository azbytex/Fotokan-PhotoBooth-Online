import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { PwaRegister } from '@/components/layout/PwaSetup';

export const metadata: Metadata = {
  title: 'Fotokan: photobooth online',
  applicationName: 'Fotokan',
  appleWebApp: { capable: true, title: 'Fotokan', statusBarStyle: 'default' },
  description:
    'Ambil foto strip ala photobooth dari browser, sendiri atau berdua dengan teman yang beda kota. Pilih tema, foto, lalu unduh hasilnya.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#101010' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Font selain Bricolage dan Jakarta dipakai renderer untuk teks di strip foto. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Instrument+Serif&family=JetBrains+Mono:wght@500&family=Bangers&family=Pacifico&family=Press+Start+2P&family=Fredoka:wght@600&family=Caveat:wght@700&display=swap"
          rel="stylesheet"
        />
        {/* Hanya huruf yang dipakai tulisan fotokan, jadi ukurannya sangat kecil. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Fraunces:ital,wght@1,600&text=ftkan&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <PwaRegister />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
