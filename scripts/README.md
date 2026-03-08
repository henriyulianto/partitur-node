# Generate Index Script

## Overview
Script ini menghasilkan `index.json` dan file data individual dari data lagu di folder `public/partitur-data` atau `dist/partitur-data`. Script ini menggunakan logic yang sama persis dengan `_loadFromGitHubAPI()` tetapi membaca dari filesystem lokal.

## Cara Penggunaan

### 1. Generate Index.json
```bash
bun run generate-index
```

### 2. Hasil Output
Script akan menghasilkan:
- `dist/partitur-data/index.json` - Daftar semua lagu
- `dist/partitur-data/{song-id}/data.json` - Data individual setiap lagu

## Struktur Data yang Diharapkan

### Folder Structure
```
public/partitur-data/
├── song1/
│   ├── exports/
│   │   ├── song1.config.yaml    # Config file (wajib)
│   │   ├── song1.pdf            # File PDF
│   │   ├── song1.m4a            # File audio
│   │   ├── song1.svg            # File SVG
│   │   └── song1.yaml          # File sync
│   └── ... (file lain)
├── song2/
│   ├── exports/
│   │   ├── song2.config.yaml
│   │   └── ...
└── ...
```

### Config File Format (`song1.config.yaml`)
```yaml
workInfo:
  title: "Judul Lagu"
  fullTitle: "Judul Lengkap Lagu"
  composer: "Nama Komposer"
  arranger: "Nama Aranjer"
  lyricist: "Nama Pencipta Lirik"
  instrument: "1 Suara"
  notationType: "Not Angka"
  workType: "Aransemen"
  workId: "song1"
  movementName: ""
  externalURL: ""

cdn:
  provider: "github"  # atau "archive.org"
  identifier: ""

files:
  audioPath: "song1.m4a"
  svgPath: "song1.svg"
  syncPath: "song1.yaml"

musicalStructure:
  totalDurationSeconds: 120
  totalMeasures: 24
  lastMeasureDuration: "4/4"
  visualLeadTimeSeconds: 2

measureHighlighters:
  verse1:
    name: "Verse 1"
    type: "measure"
    colors: ["#FF0000", "#00FF00"]
    opacity: 0.8
```

## Fitur

### ✅ Otomatis
- Membaca semua folder di `public/partitur-data`
- Parse config file YAML
- Generate URLs otomatis (untuk GitHub atau Archive.org)
- Sort lagu berdasarkan judul
- Generate file individual `data.json`

### ✅ Validasi
- Cek keberadaan folder
- Cek keberadaan config file
- Skip folder yang tidak valid
- Error handling yang baik

### ✅ Kompatibilitas
- Logic sama dengan `_loadFromGitHubAPI()`
- Output format sama dengan Workers API
- Support CDN GitHub dan Archive.org
- Path relatif untuk development

## Output Examples

### index.json
```json
[
  {
    "slug": "song1",
    "workInfo": {
      "title": "Judul Lagu",
      "composer": "Nama Komposer",
      "workType": "Aransemen",
      "workId": "song1"
    },
    "cdn": {
      "provider": "github",
      "identifier": ""
    },
    "files": {
      "audioPath": "song1.m4a",
      "svgPath": "song1.svg",
      "syncPath": "song1.yaml"
    },
    "urls": {
      "audio": "/partitur-data/song1/exports/song1.m4a",
      "pdf": "/partitur-data/song1/exports/song1.pdf",
      "svg": "/partitur-data/song1/exports/song1.svg",
      "sync": "/partitur-data/song1/exports/song1.yaml"
    },
    "musicalStructure": {
      "totalDurationSeconds": 120,
      "totalMeasures": 24,
      "lastMeasureDuration": "4/4",
      "visualLeadTimeSeconds": 2
    },
    "measureHighlighters": {}
  }
]
```

### song1/data.json
```json
{
  "slug": "song1",
  "workInfo": { ... },
  "cdn": { ... },
  "files": { ... },
  "urls": { ... },
  "musicalStructure": { ... },
  "measureHighlighters": { ... }
}
```

## Workflow Development

### 1. Tambah Lagu Baru
```bash
# 1. Buat folder baru
mkdir public/partitur-data/new-song

# 2. Tambah file config dan exports
# 3. Generate index
bun run generate-index

# 4. Test dengan bypass API
# (pastikan VITE_BYPASS_API=true di .env.local)
```

### 2. Update Lagu
```bash
# 1. Edit config file
# 2. Generate ulang index
bun run generate-index
```

### 3. Testing
```bash
# Enable bypass API
echo "VITE_BYPASS_API=true" >> .env.local

# Run dev server
bun run wrangler:dev

# Check console untuk:
# 🏠 Bypassing API - loading songs from local filesystem...
# ✅ Loaded X songs from local filesystem
```

## Error Handling

### Common Issues
1. **"Config file not found"**
   - Pastikan ada file `{song-name}.config.yaml` di folder `exports/`
   - Check nama file sesuai dengan nama folder

2. **"Directory not found"**
   - Pastikan folder `public/partitur-data` atau `dist/partitur-data` ada
   - Check struktur folder

3. **"No valid songs found"**
   - Check format config file (valid YAML)
   - Pastikan field wajib ada di config

### Debug Mode
Script akan menampilkan detail log:
- 📁 Source path yang digunakan
- 📚 Jumlah folder yang ditemukan
- ✅ Setiap lagu yang berhasil diproses
- 📊 Summary statistik
- 🎵 Preview 5 lagu pertama

## Integration dengan Bypass API

Setelah generate index.json:

1. **Enable Bypass**: `VITE_BYPASS_API=true`
2. **Build**: `bun run build:dev` 
3. **Run**: `bun run wrangler:dev`
4. **Test**: Aplikasi akan load dari `dist/partitur-data/index.json`

## Notes

- Script menggunakan logic yang sama dengan `_loadFromGitHubAPI()`
- Output 100% kompatibel dengan Workers API
- Support development dan production workflow
- Generate file individual untuk `fetchSongById()` functionality
