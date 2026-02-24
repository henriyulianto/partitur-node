# Partitur NodeJS

NodeJS version of Partitur music player with Express and EJS templating.

## Features

- 🎵 **Interactive Music Player** - Sync with digital sheet music
- 📝 **Digital Sheet Music** - SVG-based notation display
- 📱 **Responsive Design** - Works on mobile and desktop
- 🚀 **Fast Performance** - NodeJS with Express server
- 🎨 **EJS Templating** - Server-side rendering for SEO
- 📦 **Archive.org CDN** - Audio files hosted externally

## Tech Stack

- **Backend**: NodeJS + Express
- **Frontend**: EJS + Bootstrap CSS
- **Audio**: Archive.org CDN integration
- **Data**: YAML configuration files
- **Package Manager**: pnpm

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Start production server
pnpm start
```

## Deployment

### Cloudflare Pages (Recommended)
1. Connect GitHub repository to Cloudflare Pages
2. Set build command: `pnpm install`
3. Set output directory: `.`

### Vercel (Alternative)
1. Connect GitHub repository to Vercel
2. Set build command: `pnpm install`
3. Set output directory: `.`

## Project Structure

```
partitur-node/
├── views/
│   ├── layouts/
│   │   └── minimal.ejs
│   ├── partials/
│   │   ├── header.ejs
│   │   └── footer.ejs
│   ├── index.ejs
│   ├── song.ejs
│   └── error.ejs
├── server.js
├── package.json
└── README.md
```

## Migration from Jekyll

This project maintains compatibility with the original Jekyll site:
- Same CSS and JavaScript assets
- Same YAML configuration structure
- Same URL patterns (/song/:workId)
- Archive.org CDN integration preserved
