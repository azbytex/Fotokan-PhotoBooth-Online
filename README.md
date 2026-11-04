# Fotokan

Fotokan adalah photobooth online. Kamu bisa foto sendiri, atau berdua dengan teman dari perangkat masing-masing, lalu mengunduh hasilnya sebagai strip foto.

## Fitur

### Foto sendiri
- Kamera live, ganti kamera depan atau belakang, dan mode cermin.
- Timer 3, 5, atau 10 detik, dengan suara shutter dan efek flash.
- Layout strip 2, 3, 4, dan 6 foto, serta kolase 2 × 2 dan 2 × 3.
- Ulangi foto sebelum lanjut ke foto berikutnya.
- Filter, pengaturan kecerahan dan warna, serta stiker wajah 3D yang diproses di perangkat.
- Bisa memakai foto dari galeri. Kalau kamera tidak tersedia, strip memakai foto contoh dan diberi label "Contoh".

### Foto berdua
Foto berdua berjalan **bergiliran, tanpa video call**. Setiap orang memotret di perangkatnya, dan foto dikirim ke server setelah selesai. Halaman room memeriksa foto teman setiap 2 detik.

| Layout | Foto per orang | Isi strip |
|---|---|---|
| Bersebelahan | 4 | Tiap slot terbagi dua, kiri dan kanan |
| Bergantian | 2 | Foto kalian berselang-seling |
| Dua strip | 4 | Dua strip berdampingan |
| Strip 4 foto | 2 | Foto kalian berselang-seling |
| Kolase 2 × 2 | 2 | Foto kalian berselang-seling |

Room berisi dua orang dan terhapus otomatis 24 jam setelah terakhir dipakai. Data room disimpan di memori server, jadi ikut hilang saat server restart. Karena itu, room butuh server Node yang terus berjalan dan belum cocok untuk hosting serverless.

### Frame dan editor
- 64 frame dalam 9 kategori, dengan pencarian.
- Stiker yang bisa ditambah, digeser langsung di strip, diperbesar, diputar, dan dihapus.
- Teks judul, tanggal, warna latar, dan watermark.

### Hasil dan galeri
- Unduh PNG, JPG, GIF, gambar Story 9:16, dan video Story.
- Bagikan lewat menu berbagi perangkat.
- Galeri menyimpan hingga 40 strip di browser pengguna, bukan di server.
- Bisa dipasang sebagai PWA, dan halaman yang pernah dibuka tetap bisa dipakai saat offline. Room tetap butuh internet.

## Teknologi

- Next.js 14 (App Router), TypeScript, dan Tailwind CSS.
- HTML5 Canvas untuk strip, `gifenc` untuk GIF, dan MediaRecorder untuk video.
- MediaPipe Face Landmarker dan Three.js untuk stiker wajah 3D.
- IndexedDB untuk hasil, draft, dan galeri.

## Menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`. Tidak perlu konfigurasi tambahan.

Kamera di HP hanya berjalan lewat HTTPS. Kalau dibuka lewat alamat Wi-Fi seperti `http://192.168.x.x:3000`, browser HP bisa memblokir kamera, tetapi pengguna masih bisa memilih foto dari galeri.

## Mencoba foto berdua

1. Buka `/room`, isi nama, lalu klik **Buat room**.
2. Pilih frame dan layout, lalu klik **Lanjut ke kamera**.
3. Klik **Undang teman**, lalu kirim link atau kodenya (formatnya `ABCD-EFGH`).
4. Buka link di perangkat lain atau jendela privat. Tab biasa di browser yang sama akan masuk sebagai host lagi.
5. Masing-masing foto, lalu klik **Kirim foto**. Hasil terbuka otomatis saat foto kalian berdua sudah masuk.

## Kode yang belum terpakai

Bagian ini ada di repo tetapi belum terhubung ke aplikasi:

- `src/lib/webrtc/peerManager.ts`, `DuoCameraGrid`, dan `ReactionBar`: rancangan video call, countdown serentak, dan reaksi emoji.
- `src/lib/supabase/` dan `supabase/schema.sql`: rancangan penyimpanan cloud. Variabel Supabase di `.env.example` belum dibaca oleh fitur apa pun.
