import type { Lagu } from "@/types/interfaces";
import * as yaml from 'js-yaml';
import { normalizeNotationType, normalizeWorkType } from "@/lib/utils";

/**
 * Class untuk mengelola koleksi lagu
 */
export class KoleksiLagu {
  private items: Lagu[] = [];
  private isLoaded: boolean = false;
  private loadPromise: Promise<void> | null = null;

  // Configuration for API source
  private static USE_WORKERS_API = true; // Use GitHub API for local dev, Workers API for production
  private static GITHUB_TOKEN?: string; // Optional: Personal Access Token for higher rate limits
  private static WORKERS_API_URL = 'https://animasi-partitur.pages.dev/api/songs'; // Use production API for local dev

  // Storage key for localStorage
  private static TOKEN_STORAGE_KEY = 'partitur-github-token';

  /**
   * Initialize token from localStorage on first access
   */
  private static initializeToken() {
    if (!KoleksiLagu.GITHUB_TOKEN) {
      const storedToken = localStorage.getItem(KoleksiLagu.TOKEN_STORAGE_KEY);
      if (storedToken) {
        KoleksiLagu.GITHUB_TOKEN = storedToken;
        console.log('GitHub token loaded from localStorage');
      }
    }
  }

  /**
   * Set GitHub token for higher API rate limits
   * @param token - GitHub Personal Access Token
   */
  static setGitHubToken(token: string) {
    KoleksiLagu.GITHUB_TOKEN = token;
    localStorage.setItem(KoleksiLagu.TOKEN_STORAGE_KEY, token);
    console.log('GitHub token saved to localStorage - rate limits increased to 5,000/hour');
  }

  /**
   * Clear GitHub token from memory and localStorage
   */
  static clearGitHubToken() {
    KoleksiLagu.GITHUB_TOKEN = undefined;
    localStorage.removeItem(KoleksiLagu.TOKEN_STORAGE_KEY);
    console.log('GitHub token cleared - rate limit reset to 60/hour');
  }

  /**
   * Toggle between Workers API and GitHub API
   * @param useWorkers - true for Workers API, false for direct GitHub API
   */
  static setAPISource(useWorkers: boolean) {
    KoleksiLagu.USE_WORKERS_API = useWorkers;
    console.log(`API source changed to: ${useWorkers ? 'Workers API' : 'Direct GitHub API'}`);
  }

  /**
   * Get current API source
   */
  static getAPISource(): 'workers' | 'github' {
    return KoleksiLagu.USE_WORKERS_API ? 'workers' : 'github';
  }

  /**
   * Check if GitHub token is set and its effectiveness
   */
  static getRateLimitStatus(): { hasToken: boolean; source: string; limit: string } {
    KoleksiLagu.initializeToken(); // Ensure token is loaded from localStorage
    const hasToken = !!KoleksiLagu.GITHUB_TOKEN;
    const source = KoleksiLagu.getAPISource();

    return {
      hasToken,
      source,
      limit: hasToken ? '5,000/hour' : '60/hour'
    };
  }

  constructor() {
    this.items = [];
    this.loadPromise = this._loadDaftarLagu();
  }

  /**
   * Ensure data is loaded before operations
   */
  private async ensureLoaded() {
    if (!this.isLoaded && this.loadPromise) {
      await this.loadPromise;
    }
  }

  /**
   * Load lagu from API
   * Fetches data from GitHub API or Cloudflare Workers API
   */
  private async _loadDaftarLagu() {
    try {
      if (KoleksiLagu.USE_WORKERS_API) {
        console.log('Loading songs from Workers API...');
        const response = await fetch(KoleksiLagu.WORKERS_API_URL, {
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const songs = await response.json();

        if (Array.isArray(songs) && songs.length > 0) {
          songs.forEach(lagu => this.addLagu(lagu));
          console.log(`Loaded ${songs.length} songs from Workers API`);
        } else {
          console.warn('No songs found in Workers API response, using fallback data');
          this._loadFallbackData();
        }
      } else {
        console.log('Loading songs directly from GitHub API...');
        const songs = await this._loadFromGitHubAPI();

        if (songs.length > 0) {
          songs.forEach(lagu => this.addLagu(lagu));
          console.log(`Loaded ${songs.length} songs from GitHub API`);
        } else {
          console.warn('No songs found in GitHub repository, using fallback data');
          this._loadFallbackData();
        }
      }

    } catch (error) {
      console.error('Error loading songs:', error);
      console.log('Using fallback data');
      this._loadFallbackData();
    } finally {
      this.isLoaded = true;
    }
  }

  /**
   * Load songs directly from GitHub API
   */
  private async _loadFromGitHubAPI(): Promise<Lagu[]> {
    // Initialize token from localStorage
    KoleksiLagu.initializeToken();

    const GITHUB_OWNER = 'henriyulianto';
    const GITHUB_REPO = 'partitur-data';
    const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/`;

    // Get repository contents
    const headers: Record<string, string> = {
      'User-Agent': 'Partitur-App/1.0',
      'Accept': 'application/vnd.github.v3+json'
    };

    // Add authorization token if available
    if (KoleksiLagu.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${KoleksiLagu.GITHUB_TOKEN}`;
    }

    console.log('Fetching from GitHub API:', GITHUB_API_URL);
    console.log('Headers:', headers);
    console.log('Token available:', !!KoleksiLagu.GITHUB_TOKEN);
    const response = await fetch(GITHUB_API_URL, { headers });

    if (!response.ok) {
      console.error('GitHub API response status:', response.status, response.statusText);
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const contents = await response.json();
    console.log('GitHub API response:', contents);

    // Filter directories (songs)
    const songDirs = contents.filter(item =>
      item.type === 'dir' && !item.name.startsWith('.')
    );

    // Process each song directory
    const songs: Lagu[] = [];

    for (const dir of songDirs) {
      try {
        // Get config file for each song
        const configUrl = `${GITHUB_API_URL}${dir.name}/exports/${dir.name}.config.yaml`;
        console.log(`Fetching config for ${dir.name}:`, configUrl);

        const configHeaders: Record<string, string> = {
          'User-Agent': 'Partitur-App/1.0',
          'Accept': 'application/vnd.github.raw+json'
        };

        // Add authorization token if available
        if (KoleksiLagu.GITHUB_TOKEN) {
          configHeaders['Authorization'] = `token ${KoleksiLagu.GITHUB_TOKEN}`;
        }

        const configResponse = await fetch(configUrl, { headers: configHeaders });

        if (!configResponse.ok) {
          console.warn(`Failed to fetch config for ${dir.name}:`, configResponse.status, configResponse.statusText);
          continue;
        }

        const configContent = await configResponse.text();
        console.debug('Config content:', configContent.substring(0, 100));

        // Decode base64 content
        // const configContent = atob(configData.content);
        // const configContent = configData;

        // Simple YAML parsing (since we don't have js-yaml in browser)
        // const config = this._parseYAML(configContent);
        const config = yaml.load(configContent);
        console.debug('Config:', config);
        const workInfo = (config as Record<string, unknown>)?.workInfo as Record<string, unknown> || {};

        // Validate that we have the required workInfo fields
        if (!workInfo.title || !workInfo.composer) {
          console.warn(`Skipping ${dir.name}: missing required workInfo fields (title or composer)`);
          continue;
        }

        // Construct song object
        const song: Lagu = {
          slug: dir.name,
          judul: (workInfo.title as string) || dir.name,
          deskripsi: (workInfo.fullTitle as string) || '',
          tipeNotasi: normalizeNotationType((workInfo.notationType as string) || 'not angka'),
          jenisKarya: normalizeWorkType((workInfo.workType as string) || 'Komposisi'),
          composer: (workInfo.composer as string) || '',
          arranger: (workInfo.arranger as string) || (workInfo.composer as string) || '',
          lyricist: (workInfo.lyricist as string) || (workInfo.composer as string) || '',
          instrument: (workInfo.instrument as "1 Suara" | "2 Suara" | "3 Suara" | "4 Suara atau lebih" | "Alat Musik") || '1 Suara',
          gender: (workInfo.gender as "Wanita" | "Pria" | "Campuran") || 'Campuran',
          externalUrl: (workInfo.externalURL as string)
        };

        // Validate required fields
        if (song.judul && song.composer) {
          songs.push(song);
          console.log(`Successfully loaded song: ${song.judul}`);
        }

      } catch (error) {
        console.warn(`Failed to process song ${dir.name}:`, error);
      }
    }

    console.log(`GitHub API processing complete: ${songs.length} songs loaded, ${songDirs.length - songs.length} directories skipped due to missing configs`);
    return songs;
  }

  /**
   * Simple YAML parser for browser environment
   */
  private _parseYAML(yamlString: string): Record<string, unknown> {
    const lines = yamlString.split('\n');
    const result: Record<string, unknown> = {};
    let currentKey = '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const currentIndent = line.length - (line.match(/^ */)?.[0]?.length || 0);

      if (currentIndent === 0 && trimmed.includes(':')) {
        const [key, value] = trimmed.split(':').map(s => s.trim());
        currentKey = key;

        if (value) {
          result[key] = value;
        } else {
          result[key] = {};
        }
      } else if (currentIndent > 0 && currentKey) {
        const [key, value] = trimmed.split(':').map(s => s.trim());
        if (value) {
          (result[currentKey] as Record<string, unknown>)[key] = value;
        }
      }
    }

    return result;
  }

  /**
   * Load fallback data when directory loading fails
   */
  private _loadFallbackData() {
    // Use the hardcoded data as fallback
    const fallbackData: Lagu[] = [
      {
        slug: "serenade-malam",
        judul: "Serenade Malam",
        deskripsi: "Sebuah komposisi lembut untuk piano solo yang menggambarkan keindahan malam yang tenang dan penuh bintang.",
        tipeNotasi: "Not Balok",
        jenisKarya: "Komposisi",
        composer: "Andi Setiawan",
        arranger: "Andi Setiawan",
        lyricist: "Andi Setiawan",
        instrument: "1 Suara",
        gender: "Pria",
        externalUrl: "https://www.youtube.com/watch?v=example1",
      },
      {
        slug: "tarian-angin",
        judul: "Tarian Angin",
        deskripsi: "Aransemen dinamis dari melodi tradisional yang menggambarkan gerakan angin di padang rumput.",
        tipeNotasi: "Not Angka",
        jenisKarya: "Aransemen",
        composer: "Budi Prasetyo",
        arranger: "Citra Dewi",
        lyricist: "Budi Prasetyo",
        instrument: "2 Suara",
        gender: "Campuran",
        externalUrl: "https://www.facebook.com/watch?v=example2",
      },
      {
        slug: "gema-nusantara",
        judul: "Gema Nusantara",
        deskripsi: "Salinan partitur orkestra yang mengangkat tema-tema musik daerah Indonesia dalam format simfoni.",
        tipeNotasi: "Not Kombinasi",
        jenisKarya: "Salinan",
        composer: "Dewi Lestari",
        arranger: "Eka Putra",
        lyricist: "Farah Amalia",
        instrument: "4 Suara atau lebih",
        gender: "Campuran",
        externalUrl: "https://www.youtube.com/watch?v=example3",
      },
      {
        slug: "fajar-di-ufuk-timur",
        judul: "Fajar di Ufuk Timur",
        deskripsi: "Komposisi untuk ansambel tiup yang menggambarkan matahari terbit dengan crescendo megah.",
        tipeNotasi: "Not Balok",
        jenisKarya: "Komposisi",
        composer: "Galih Permana",
        arranger: "Galih Permana",
        lyricist: "Hana Safitri",
        instrument: "3 Suara",
        gender: "Wanita",
        externalUrl: "https://www.instagram.com/p/example4",
      },
      {
        slug: "langkah-sunyi",
        judul: "Langkah Sunyi",
        deskripsi: "Aransemen minimalis untuk gitar klasik dengan nuansa kontemplatif dan meditatif.",
        tipeNotasi: "Not Angka",
        jenisKarya: "Aransemen",
        composer: "Irfan Maulana",
        arranger: "Joko Widodo",
        lyricist: "Joko Widodo",
        instrument: "Alat Musik",
        gender: "Pria",
        externalUrl: "https://www.youtube.com/watch?v=example5",
      },
    ];

    fallbackData.forEach(lagu => this.addLagu(lagu));
  }

  /**
   * Menambahkan lagu ke koleksi
   * @param lagu - Data lagu yang akan ditambahkan
   */
  addLagu(lagu: Lagu) {
    this.items.push(lagu);
  }

  /**
   * Mendapatkan semua lagu dalam koleksi
   * @returns Array of Lagu
   */
  async getDaftarLagu() {
    await this.ensureLoaded();
    return this.items;
  }

  /**
   * Mendapatkan lagu berdasarkan slug
   * @param slug - Slug lagu
   * @returns Lagu atau undefined jika tidak ditemukan
   */
  getLaguBySlug(slug: string): Lagu | undefined {
    return this.items.find((l) => l.slug === slug);
  }

  /**
   * Mencari lagu berdasarkan keyword
   * @param keyword - Keyword untuk pencarian
   * @returns Array of Lagu yang sesuai dengan keyword
   */
  cariLagu(keyword: string): Lagu[] {
    const lower = keyword.toLowerCase();
    return this.items.filter(
      (l) =>
        l.judul.toLowerCase().includes(lower) ||
        l.deskripsi.toLowerCase().includes(lower)
    );
  }

  /**
   * Format deskripsi singkat berdasarkan kombinasi composer/arranger/lyricist
   * @param lagu - Data lagu
   * @returns Formatted credits string
   */
  static formatCredits(lagu: Lagu): string {
    const { composer, arranger, lyricist } = lagu;
    const allSame = composer === arranger && arranger === lyricist;
    const compArr = composer === arranger;
    const compLyr = composer === lyricist;
    const arrLyr = arranger === lyricist;

    if (allSame) return `Lagu, syair, dan aransemen: ${composer.toUpperCase()}`;
    if (compArr) return `Lagu dan aransemen: ${composer.toUpperCase()} | Syair: ${lyricist.toUpperCase()}`;
    if (compLyr) return `Lagu dan syair: ${composer.toUpperCase()} | Aransemen: ${arranger.toUpperCase()}`;
    if (arrLyr) return `Lagu: ${composer.toUpperCase()} | Syair dan aransemen: ${arranger.toUpperCase()}`;
    return `Lagu: ${composer.toUpperCase()} | Syair: ${lyricist.toUpperCase()} | Aransemen: ${arranger.toUpperCase()}`;
  }
}

// Singleton instance untuk digunakan di seluruh aplikasi
export const koleksiLagu = new KoleksiLagu();
