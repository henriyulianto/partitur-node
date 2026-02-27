# Animasi Partitur Musik

[![Deploy to Cloudflare Pages](https://github.com/henriyulianto/partitur-node/actions/workflows/deploy.yml/badge.svg)](https://github.com/henriyulianto/partitur-node/actions/workflows/deploy.yml)

Aplikasi web penampil partitur dengan animasi notasi, yang dikembangkan dengan React, TypeScript, dan di-deploy terutama ke Cloudflare Pages. 🎵

> **Catatan**: Web app ini adalah hasil konversi dari web berbasis Jekyll yang di-host di repository: <https://github.com/henriyulianto/partitur>

## Fitur

- 🎵 **Pemutar Musik Interaktif** - Putar dan kontrol pemutaran musik
- 📝 **Lembaran Musik Digital** - Tampilkan notasi musik dan lirik
- 📱 **Desain Responsif** - Bekerja sempurna di mobile dan desktop
- 🚀 **Performa Cepat** - React dengan Vite untuk kecepatan optimal
- 🎨 **UI Modern** - Tailwind CSS dengan komponen shadcn/ui
- 🌐 **Deployment Edge** - Cloudflare Pages dengan CDN global
- 📊 **Integrasi API** - API GitHub untuk data lagu dengan cache Workers KV
- 🚀 **Performa Cepat** - KV cache untuk response ~50ms (99% cache hit rate)
- 🔧 **TypeScript** - Keamanan tipe penuh dan pengalaman pengembangan yang lebih baik

## Teknologi

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui + Radix UI
- **Routing**: React Router v6 dengan animasi Framer Motion
- **State Management**: TanStack Query untuk pengambilan data
- **Backend**: Cloudflare Pages Functions (Workers)
- **Sumber Data**: <https://github.com/henriyulianto/partitur-data> dengan file konfigurasi YAML
- **Deployment**: Cloudflare Pages dengan cache edge
- **Package Manager**: Bun (alternatif: npm/pnpm/yarn - silakan merujuk dokumentasi package manager yang Anda gunakan)

## Pengembangan

### Install dependencies
```bash
bun install
```

### Build (development, asset tidak di-minify)
```bash
bun run build:dev
```

### Build (production, asset di-minify)
```bash
bun run build
```

### Start development server
```bash
bun run dev
```

### Alternatif start development server dengan `wrangler`
```bash
wrangler pages dev
```

### Alternatif start development server dengan `bunx wrangler`
```bash
bunx wrangler pages dev
```

## Deploy ke Cloudflare Pages

### Cara 1: Langsung dengan Wrangler
```bash
wrangler pages deploy dist --project-name=<nama-proyek>
```

### Cara 2: Manual build + deploy
```bash
bun run build
wrangler pages deploy dist --project-name=<nama-proyek>
```

## Variabel Lingkungan Pengembangan

Buat file `.env.local` untuk pengembangan lokal:

```env
GITHUB_OWNER=henriyulianto
GITHUB_REPO=partitur-data
GITHUB_TOKEN=token_github_anda_di_sini
```

## Struktur Direktori Proyek

```
partitur-node/
├── src/
│   ├── components/          # Komponen React
│   │   ├── ui/              # Komponen shadcn/ui
│   │   ├── LaguCard.tsx     # Komponen kartu lagu
│   │   ├── LaguBadge.tsx    # Badge tipe lagu
│   │   └── APIConfig.tsx    # UI konfigurasi API
│   ├── hyplayer-assets/     # Aset hyplayer (CSS, JS, gambar)
│   │   ├── css/             # Stylesheets hyplayer
│   │   ├── js/              # JavaScript hyplayer
│   │   └── images/          # Gambar dan ikon
│   ├── lib/                 # Fungsi utilitas
│   │   └── utils.ts         # Utilitas bersama
│   ├── models/              # Model data
│   │   └── KoleksiLagu.ts   # Manajer koleksi lagu
│   ├── pages/               # Komponen halaman
│   │   ├── Index.tsx        # Halaman beranda
│   │   ├── DetailLagu.tsx   # Halaman detail lagu
│   │   └── SearchResults.tsx # Hasil pencarian
│   ├── types/               # Tipe TypeScript
│   │   └── interfaces.ts    # Definisi tipe
│   └── App.tsx              # Komponen app utama
├── functions/               # Cloudflare Pages Functions
│   └── api/
│       └── songs.js         # Endpoint API lagu
├── dist/                    # Output build
├── package.json
├── vite.config.ts
├── wrangler.jsonc          # Konfigurasi Cloudflare
└── README.md
```

## Arsitektur API

### Alur Data dengan KV Cache
1. **Frontend** meminta data lagu dari Cloudflare Pages Function `/api/songs`
2. **Cloudflare Pages Function** mengecek KV cache terlebih dahulu
3. **Cache Hit** → Langsung kembalikan data dari KV (~50ms)
4. **Cache Miss** → Ambil commit terbaru dari GitHub API
5. **Compare Commit Time** → Update cache jika ada perubahan
6. **GitHub API** mengambil konten repositori (jika cache miss)
7. **Function** memproses file YAML dan menormalisasi data
8. **Respon** disajikan dengan cache edge dan headers yang tepat

### Strategi Cache
- **Songs Data**: KV cache dengan invalidation otomatis berdasarkan GitHub commit time
- **Cache Hit Rate**: 99% (1 lagu/week growth pattern)
- **Response Time**: ~50ms (cache hit) vs 6+ seconds (cache miss)
- **Invalidation**: Otomatis saat ada commit baru di repo partitur-data
- **Storage**: Cloudflare KV dengan global edge distribution

### Batas Rate
- **GitHub API (tanpa Token)**: 60 permintaan/jam
- **GitHub API (dengan Token)**: 5.000 permintaan/jam
- **Cloudflare KV**: 100K reads/day, 1K writes/day (free tier)
- **Edge Cache**: Tidak terbatas (cache edge Cloudflare)

## Deployment

### Cloudflare Pages (Direkomendasikan)

1. **Hubungkan Repositori**: Hubungkan repositori GitHub ke Cloudflare Pages
2. **Pengaturan Build**:
   - Build command: `bun run build` (production) atau `bun run build:dev` (development)
   - Build output directory: `dist`
   - Root directory: `/`
3. **Variabel Lingkungan**: Atur kredensial GitHub di dashboard Pages
4. **Functions**: Otomatis di-deploy dari direktori `functions/`

### Deployment Manual

```bash
# Build dan deploy
bun run build
wrangler pages deploy dist --project-name=<nama-proyek>
```

## Konfigurasi

### Integrasi API GitHub
- Repositori: <https://github.com/henriyulianto/partitur-data>
- Data lagu disimpan sebagai file YAML di direktori `exports/`
- Normalisasi otomatis tipe notasi dan jenis karya
- Data fallback untuk penanganan error

### API Workers dengan KV Cache
- **Endpoint**: `/api/songs`
- **Cache Strategy**: KV storage dengan GitHub commit time comparison
- **Cache Hit Rate**: 99% (1 lagu/week growth pattern)
- **Response Time**: ~50ms (cache hit) vs 6+ seconds (cache miss)
- **Cache Invalidation**: Otomatis saat ada commit baru
- **Headers**: `X-Cache-Status: HIT/MISS` untuk debugging
- **CORS**: Diaktifkan untuk frontend
- **Error Handling**: Penanganan error dengan kode status HTTP yang tepat

## Optimasi Performa

- **Edge Caching**: KV cache untuk respons API (~50ms)
- **Smart Cache Invalidation**: Berdasarkan GitHub commit time
- **Code Splitting**: Chunk vendor otomatis
- **Asset Optimization**: Lazy loading untuk hyplayer assets
- **Bundle Size**: Optimized dengan Vite
- **Global CDN**: Cloudflare edge network
- **Static File Caching**: GitHub CDN untuk SVG/PDF/audio files
- **Optimasi Gambar**: Lazy loading dengan ukuran yang tepat
- **Font Loading**: Google Fonts dengan preload
- **Bundle Analysis**: Dioptimasi dengan Vite

## Kontribusi

1. Fork repositori
2. Buat cabang fitur (feature branch)
3. Lakukan perubahan Anda
4. Uji secara menyeluruh
5. Kirim pull request

## Lisensi

Proyek ini dilisensikan di bawah MIT License.
