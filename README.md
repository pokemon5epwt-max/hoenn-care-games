# Hoenn Care Games

Ekstensi **Owlbear Rodeo** bertema wilayah Hoenn dengan dua mini game bergaya Pokémon Gen 8:

1. **Calm It Down** (*Petalburg Woods*) — Mini game ketukan ritme untuk menenangkan Pokémon liar melalui 3 tahap (`Kesal`, `Marah`, `Mengamuk`).
2. **Daycare Feeding** (*Route 117 — Pokémon Day Care*) — Mini game menuang Pokéblock ke mangkuk sesuai pita porsi target.

## Instalasi & Pengembangan Lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000` untuk mencoba **Mode Pratinjau Mandiri** (`Test sebagai GM`, `Test sebagai Pemain`, dan `Tampilan Terpisah`) tanpa memerlukan ruangan Owlbear Rodeo.

## Build Produksi

```bash
npm run build
```

Hasil build multi-halaman (`index.html`, `gm.html`, `background.html`, `game.html`, serta `manifest.json` dan `icon.svg`) akan dibuat di folder `dist/`.

## Hosting Statis dengan CORS Aktif

Owlbear Rodeo memuat ekstensi dari URL publik dengan header CORS aktif (`Access-Control-Allow-Origin: *`). Anda dapat meng-host isi folder `dist/` pada layanan statis seperti:

- **Cloudflare Pages / Netlify / Vercel**: Deploy direktori `dist` dan tambahkan header respons `Access-Control-Allow-Origin: *` (misalnya melalui file `_headers` untuk Netlify/Cloudflare Pages: `/*\n  Access-Control-Allow-Origin: *`).
- **GitHub Pages**: Mendukung CORS publik secara bawaan untuk berkas statis.
- **Nginx / Caddy / Static Server lokal**:
  - Contoh `npx serve dist --cors` untuk uji lokal cepat melalui HTTPS tunnel.

Pastikan URL menuju `manifest.json` dapat diakses publik (contoh: `https://domain-anda.example/manifest.json`).

## Memasang Ekstensi di Owlbear Rodeo

1. Masuk ke akun **Owlbear Rodeo** Anda.
2. Buka **Profile** → **Extensions** → **Add Extension**.
3. Tempel URL lengkap ke `manifest.json` Anda (contoh: `https://domain-anda.example/manifest.json`), lalu simpan.
4. Aktifkan ekstensi **Hoenn Care Games** di ruangan (*Room*) Anda, lalu klik ikon Poké Ball di bilah ekstensi untuk membuka panel GM.
