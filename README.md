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
- 📊 **Integrasi API** - API GitHub untuk data lagu dengan cache Workers
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

```bash
# Install dependencies
bun install

# Start development server
bun run dev
# Alternatif: bunx wrangler pages dev

# Build for production
bun run build

# Deploy ke Cloudflare Pages

**Cara 1: Langsung dengan Wrangler**
```bash
wrangler pages deploy dist --project-name=<nama-proyek>
```

**Cara 2: Manual build + deploy**
```bash
bun run build
wrangler pages deploy dist --project-name=<nama-proyek>
```
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

### Alur Data
1. **Frontend** meminta data lagu dari Cloudflare Pages Function `/api/songs`
2. **Cloudflare Pages Function** mengambil dari API GitHub
3. **API GitHub** mengembalikan konten repositori
4. **Function** memproses file YAML dan menormalisasi data
5. **Respon di-cache** disajikan dengan cache edge 10 menit

### Batas Rate
- **Tanpa Token**: 60 permintaan/jam (API GitHub)
- **Dengan Token**: 5.000 permintaan/jam (API GitHub)
- **Dengan Workers**: Tidak terbatas (cache edge)

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

### API Workers
- Endpoint: `/api/songs`
- Durasi cache: 10 menit
- CORS diaktifkan untuk frontend
- Penanganan error dengan kode status HTTP yang tepat

## Optimasi Performa

- **Edge Caching**: Cache 10 menit untuk respons API
- **Code Splitting**: Chunk vendor otomatis
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
