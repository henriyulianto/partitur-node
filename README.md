# Animasi Partitur Musik

Interactive music sheet player with React, TypeScript, and Cloudflare Pages deployment.

## Features

- 🎵 **Interactive Music Player** - Play and control music playback
- 📝 **Digital Sheet Music** - Display music notation and lyrics
- 📱 **Responsive Design** - Works seamlessly on mobile and desktop
- 🚀 **Fast Performance** - React with Vite for optimal speed
- 🎨 **Modern UI** - Tailwind CSS with shadcn/ui components
- 🌐 **Edge Deployment** - Cloudflare Pages with global CDN
- � **API Integration** - GitHub API for song data with Workers caching
- 🔧 **TypeScript** - Full type safety and better development experience

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui + Radix UI
- **Routing**: React Router v6 with Framer Motion animations
- **State Management**: TanStack Query for data fetching
- **Backend**: Cloudflare Pages Functions (Workers)
- **Data Source**: GitHub API with YAML configuration files
- **Deployment**: Cloudflare Pages with edge caching
- **Package Manager**: Bun

## Development

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Deploy to Cloudflare Pages
bun run deploy
```

## Environment Variables

Create a `.env.local` file for local development:

```env
GITHUB_OWNER=henriyulianto
GITHUB_REPO=partitur-data
GITHUB_TOKEN=your_github_token_here
```

## Project Structure

```
partitur-node/
├── src/
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── LaguCard.tsx     # Song card component
│   │   ├── LaguBadge.tsx    # Song type badges
│   │   └── APIConfig.tsx    # API configuration UI
│   ├── lib/                 # Utility functions
│   │   └── utils.ts         # Shared utilities
│   ├── models/              # Data models
│   │   └── KoleksiLagu.ts   # Song collection manager
│   ├── pages/               # Page components
│   │   ├── Index.tsx        # Homepage
│   │   ├── DetailLagu.tsx   # Song detail page
│   │   └── SearchResults.tsx # Search results
│   ├── types/               # TypeScript types
│   │   └── interfaces.ts    # Type definitions
│   └── App.tsx              # Main app component
├── functions/               # Cloudflare Pages Functions
│   └── api/
│       └── songs.js         # Songs API endpoint
├── dist/                    # Build output
├── package.json
├── vite.config.ts
├── wrangler.jsonc          # Cloudflare configuration
└── README.md
```

## API Architecture

### Data Flow
1. **Frontend** requests song data from `/api/songs`
2. **Cloudflare Pages Function** fetches from GitHub API
3. **GitHub API** returns repository contents
4. **Function** processes YAML files and normalizes data
5. **Cached response** served with 5-minute edge cache

### Rate Limits
- **Without Token**: 60 requests/hour (GitHub API)
- **With Token**: 5,000 requests/hour (GitHub API)
- **With Workers**: Unlimited (edge cached)

## Deployment

### Cloudflare Pages (Recommended)

1. **Connect Repository**: Link GitHub repository to Cloudflare Pages
2. **Build Settings**:
   - Build command: `bun run build`
   - Build output directory: `dist`
   - Root directory: `/`
3. **Environment Variables**: Set GitHub credentials in Pages dashboard
4. **Functions**: Automatically deployed from `functions/` directory

### Manual Deployment

```bash
# Build and deploy
bun run build
wrangler pages deploy dist --project-name=animasi-partitur
```

## Configuration

### GitHub API Integration
- Repository: `henriyulianto/partitur-data`
- Song data stored as YAML files in `exports/` directories
- Automatic normalization of notation and work types
- Fallback data for error handling

### Workers API
- Endpoint: `/api/songs`
- Cache duration: 5 minutes
- CORS enabled for frontend
- Error handling with proper HTTP status codes

## Performance Optimizations

- **Edge Caching**: 5-minute cache for API responses
- **Code Splitting**: Automatic vendor chunks
- **Image Optimization**: Lazy loading with proper sizing
- **Font Loading**: Google Fonts with preload
- **Bundle Analysis**: Optimized with Vite

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
