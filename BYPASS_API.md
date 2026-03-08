# API Bypass Feature

## Overview
This feature allows you to bypass the Workers API and serve data directly from the local filesystem during development. This is useful for:
- Faster development without API calls
- Working offline
- Testing with local data changes

## How It Works
When `VITE_BYPASS_API=true`, the application will:
1. Skip all API calls (Workers API and GitHub API)
2. Load data directly from `dist/partitur-data/index.json`
3. Load individual song data from `dist/partitur-data/{song-id}/data.json`

## Setup

### 1. Environment Variable
Add this to your `.env.local` file:
```bash
VITE_BYPASS_API=true
```

### 2. Data Structure
Ensure your data is structured as follows:
```
dist/
└── partitur-data/
    ├── index.json          # Main songs list
    ├── song1/
    │   ├── data.json        # Individual song data
    │   ├── exports/
    │   │   ├── score.pdf
    │   │   ├── audio.mp3
    │   │   └── ...
    │   └── metadata.yaml
    ├── song2/
    │   ├── data.json
    │   └── exports/
    │       └── ...
    └── ...
```

### 3. Data Format

#### index.json
```json
[
  {
    "id": "song1",
    "title": "Song Title",
    "composer": "Composer Name",
    "urls": {
      "pdf": "/partitur-data/song1/exports/score.pdf",
      "audio": "/partitur-data/song1/exports/audio.mp3"
    },
    "workInfo": {
      "workType": "song"
    }
  }
]
```

#### song1/data.json
```json
{
  "id": "song1",
  "title": "Song Title",
  "composer": "Composer Name",
  "urls": {
    "pdf": "/partitur-data/song1/exports/score.pdf",
    "audio": "/partitur-data/song1/exports/audio.mp3"
  },
  "workInfo": {
    "workType": "song"
  }
}
```

## Usage

### Development Mode
1. Set `VITE_BYPASS_API=true` in `.env.local`
2. Ensure your data is in `dist/partitur-data/`
3. Run `bun run wrangler:dev`
4. The app will load from local filesystem

### Production Mode
- Remove or set `VITE_BYPASS_API=false` to use Workers API
- The bypass feature is automatically disabled in production builds

## API Methods

### KoleksiLagu Class
```typescript
// Check current API source
const source = KoleksiLagu.getAPISource(); // 'local' | 'workers' | 'github'

// Get rate limit status
const status = KoleksiLagu.getRateLimitStatus();
// Returns: { hasToken: boolean, source: string, limit: string }
```

### API Utility Functions
```typescript
import { fetchSongs, fetchSongById } from '@/lib/api';

// Fetch all songs (will use local data when bypassed)
const songs = await fetchSongs();

// Fetch individual song
const song = await fetchSongById('song1');
```

## Benefits

### When Bypass is Enabled:
- ✅ No API rate limits
- ✅ Works offline
- ✅ Faster loading
- ✅ No network dependencies
- ✅ Immediate data updates (no cache delay)

### When Bypass is Disabled:
- ✅ Always latest data from GitHub
- ✅ Automatic data updates
- ✅ Production-ready
- ✅ No local data management required

## Troubleshooting

### Common Issues

1. **"Local data not found" Error**
   - Ensure `dist/partitur-data/index.json` exists
   - Check that the file is valid JSON
   - Verify the file structure matches the expected format

2. **404 Errors for Song Data**
   - Ensure individual song folders exist: `dist/partitur-data/{song-id}/data.json`
   - Check file paths in the JSON are correct

3. **CORS Issues**
   - The bypass feature uses relative paths, so CORS should not be an issue
   - Ensure your dev server is serving the `dist/` folder correctly

### Debug Mode
Check the browser console for:
- `🏠 Bypassing API - loading songs from local filesystem...`
- `✅ Loaded X songs from local filesystem`
- Any error messages with specific file paths

## Switching Between Modes

### To Enable Bypass:
```bash
echo "VITE_BYPASS_API=true" >> .env.local
```

### To Disable Bypass:
```bash
# Remove the line or set to false
echo "VITE_BYPASS_API=false" >> .env.local
# Or delete the line from .env.local
```

### To Check Current Mode:
```javascript
console.log('API Source:', KoleksiLagu.getAPISource());
console.log('Rate Limit:', KoleksiLagu.getRateLimitStatus());
```
