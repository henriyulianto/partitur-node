import { useParams, Navigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import AppLayout from "@/components/AppLayout";
import { koleksiLagu } from "@/models/KoleksiLagu";
import { NotasiBadge, KaryaBadge } from "@/components/LaguBadge";
import { User, Music, Mic2, Piano } from "lucide-react";
import { normalizeNotationType, normalizeWorkType, formatCredits } from "@/utils/utilityLagu";
import "@/hyplayer-assets/css/hyplayer.css";

const DetailLagu = () => {
  const { slug } = useParams<{ slug: string }>();
  const lagu = slug ? koleksiLagu.getLaguBySlug(slug) : undefined;
  const audioRef = useRef<HTMLAudioElement>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Initialize hyplayer when component mounts
  useEffect(() => {
    if (!slug || !lagu) return;

    // Update document title
    if (lagu?.workInfo?.title) {
      document.title = `${lagu.workInfo.title} - Animasi Partitur Musik`;
    }

    // Dynamic import hyplayer.js
    import('@/hyplayer-assets/js/hyplayer')
      .then(module => {
        // Inisialisasi modul hyplayer.js
        module.initPlayer(lagu);

        // Konfigurasi audio element
        if (audioRef.current) {
          module.configureAudio(audioRef.current, lagu);
        }
      })
      .catch(console.error);
  }, [slug, lagu]);

  // Show loading state while data is loading
  if (!lagu && slug) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Memuat data lagu...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Only navigate to home if slug is missing (not just loading)
  if (!slug) {
    return <Navigate to="/" replace />;
  }

  const metadataItems = [
    { icon: User, label: "Komposer", value: lagu.workInfo.composer },
    { icon: Music, label: "Aransemen", value: lagu.workInfo.arranger },
    { icon: Mic2, label: "Syair", value: lagu.workInfo.lyricist },
    { icon: Piano, label: "Instrumen", value: lagu.workInfo.instrument },
  ];

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-6xl bg-popover min-h-[calc(100vh-3.5rem)]">
        {/* Header lagu */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {lagu.workInfo.title} ({lagu.workInfo.instrument})
              </h1>
              <p className="mt-2 text-muted-foreground">{formatCredits(lagu)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <NotasiBadge tipe={normalizeNotationType(lagu.workInfo.notationType)} />
              <KaryaBadge jenis={normalizeWorkType(lagu.workInfo.workType)} />
            </div>
          </div>
        </div>

        {/* Music Player Section */}
        <div className="mb-8 hyplayer-root">
          {/* Fixed header with audio controls */}
          <div className="sticky top-14 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-center gap-4">
                {/* PDF download button */}
                <a
                  href={lagu.urls.pdf || '#'}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${lagu.urls.pdf
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  style={{ minWidth: '7.5rem' }}
                  onClick={(e) => !lagu.urls.pdf && e.preventDefault()}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M14 4.5V14a2 2 0 0 1-2 2h-1v-1h1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5zM1.6 11.85H0v3.999h.791v-1.342h.803q.43 0 .732-.173.305-.175.463-.474a1.4 1.4 0 0 0 .161-.677q0-.375-.158-.677a1.2 1.2 0 0 0-.46-.477q-.3-.18-.732-.179m.545 1.333a.8.8 0 0 1-.085.38.57.57 0 0 1-.238.241.8.8 0 0 1-.375.082H.788V12.48h.66q.327 0 .512.181.185.183.185.522m1.217-1.333v3.999h1.46q.602 0 .998-.237a1.45 1.45 0 0 0 .595-.689q.196-.45.196-1.084 0-.63-.196-1.075a1.43 1.43 0 0 0-.589-.68q-.396-.234-1.005-.234zm.791.645h.563q.371 0 .609.152a.9.9 0 0 1 .354.454q.118.302.118.753a2.3 2.3 0 0 1-.068.592 1.1 1.1 0 0 1-.196.422.8.8 0 0 1-.334.252 1.3 1.3 0 0 1-.483.082h-.563zm3.743 1.763v1.591h-.79V11.85h2.548v.653H7.896v1.117h1.606v.638z" />
                  </svg>
                  {lagu.urls.pdf ? 'Unduh PDF' : 'PDF Tidak Tersedia'}
                </a>

                {/* Main audio player */}
                <audio
                  ref={audioRef}
                  className="grow max-w-2xl"
                  controls
                />

                {/* Bar counter */}
                <div
                  id="bar_spy"
                  className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground rounded-lg"
                  style={{ minWidth: '7.5rem' }}
                >
                  <span id="current_bar">1</span>
                  <span>/</span>
                  <span id="total_bars">--</span>
                </div>
              </div>
            </div>
          </div>

          {/* Loading overlay */}
          <div
            id="loading"
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <div className="text-center">
              <div
                className="inline-block animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"
                style={{ width: '4rem', height: '4rem', color: '#8B4513' }}
              >
                <span className="sr-only">Memuat...</span>
              </div>
              <div className="mt-3 text-muted-foreground">
                Memuat data lagu <span id="loading-werk">{lagu.workInfo?.title || ''}</span>...
              </div>
            </div>
          </div>

          {/* Main content area for musical notation */}
          <div className="container mx-auto px-4">
            {/* Measure controls */}
            <div id="measure-controls" className="mb-4" style={{ display: 'none' }}>
              <label htmlFor="highlight-select" className="block text-sm font-medium mb-2">
                Highlight Birama:
              </label>
              <select
                id="highlight-select"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="">None</option>
              </select>
              <small id="highlight-info" className="text-muted-foreground ml-2" style={{ display: 'none' }}></small>
            </div>

            {/* SVG container for musical notation */}
            <div id="svg-container" className="min-h-100" />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DetailLagu;
