import type { CDN, Files, Lagu, MeasureHighlighters, MusicalStructure, URLs, WorkInfo } from "@/types/interfaces";
import * as yaml from 'js-yaml';
import { normalizeNotationType, normalizeWorkType } from "@/utils/utilityLagu";

/**
 * Class untuk mengelola koleksi lagu
 */
export class KoleksiLagu {
  private items: Lagu[] = [];
  private isLoaded: boolean = false;
  private loadPromise: Promise<void> | null = null;

  // Configuration for API source
  private static USE_WORKERS_API = true;
  private static GITHUB_TOKEN?: string; // Optional: Personal Access Token for higher rate limits
  private static WORKERS_API_URL = '/api/songs';

  // Storage key for localStorage
  private static TOKEN_STORAGE_KEY = 'partitur-github-token';

  /**
   * Get raw GitHub file URL
   * @param title - Song title/directory name
   * @param filename - File name to fetch
   * @returns Raw GitHub file URL
   */
  private getRawGithubFileUrl(title: string, filename: string) {
    const GITHUB_OWNER = 'henriyulianto';
    const GITHUB_REPO = 'partitur-data';
    return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${title}/exports/${filename}`;
  }

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
          console.warn('No songs found in Workers API response.');
          // this._loadFallbackData();
        }
      } else {
        console.log('Loading songs directly from GitHub API...');
        const songs = await this._loadFromGitHubAPI();

        if (songs.length > 0) {
          songs.forEach(lagu => this.addLagu(lagu));
          console.log(`Loaded ${songs.length} songs from GitHub API`);
        } else {
          console.warn('No songs found in GitHub repository');
        }
      }

    } catch (error) {
      console.error('Error loading songs:', error);
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
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };

    // Add authorization token if available
    if (KoleksiLagu.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${KoleksiLagu.GITHUB_TOKEN}`;
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
          'Accept': 'application/vnd.github.raw+json',
          'X-GitHub-Api-Version': '2022-11-28'
        };

        // Add authorization token if available
        if (KoleksiLagu.GITHUB_TOKEN) {
          configHeaders['Authorization'] = `Bearer ${KoleksiLagu.GITHUB_TOKEN}`;
        }

        const configResponse = await fetch(configUrl, { headers: configHeaders });

        if (!configResponse.ok) {
          console.warn(`Failed to fetch config for ${dir.name}:`, configResponse.status, configResponse.statusText);
          continue;
        }

        const configContent = await configResponse.text();
        console.debug('Config content:', configContent.substring(0, 100));

        const config = yaml.load(configContent);
        if (!config) {
          console.warn(`Skipping ${dir.name}: invalid or no config file`);
          continue;
        }

        type yamlRecord = Record<string, unknown>;

        const slug = (config as yamlRecord)?.workId || dir.name;
        const workInfoData: unknown = (config as yamlRecord)?.workInfo as yamlRecord || {};
        const cdnData: unknown = (config as yamlRecord)?.cdn as yamlRecord || {};
        const filesData: unknown = (config as yamlRecord)?.files as yamlRecord || {};
        const musicalStructureData: unknown = (config as yamlRecord)?.musicalStructure as yamlRecord || {};
        const measureHighlightersData: unknown = (config as yamlRecord)?.measureHighlighters as yamlRecord || {};
        const urlsData: unknown = (config as yamlRecord)?.urls as yamlRecord || {};

        const workInfo = workInfoData as WorkInfo;

        // Construct song object matching Workers API logic
        const song: Lagu = {
          // Identitas Lagu
          slug: (config as yamlRecord)?.workId || dir.name,
          ...config as Lagu,
          files: {
            audioPath: (filesData as Files)?.audioPath || `${workInfo.workId}.m4a`,
            svgPath: (filesData as Files)?.svgPath || `${workInfo.workId}.svg`,
            syncPath: (filesData as Files)?.syncPath || `${workInfo.workId}.yaml`,
          },
          urls: null
        };

        // Build URLs matching Workers API logic
        const getRawGithubFileUrl = (title: string, filename: string = title) => {
          return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${title}/exports/${filename}`;
        };

        song.urls = {
          audio: song.cdn?.provider === 'archive.org'
            ? `https://${song.cdn.provider}/download/${song.cdn.identifier}/${song.files.audioPath}`
            : getRawGithubFileUrl(song.slug, song.files.audioPath),
          pdf: `${getRawGithubFileUrl(song.slug)}.pdf`,
          svg: getRawGithubFileUrl(song.slug, song.files.svgPath),
          sync: getRawGithubFileUrl(song.slug, song.files.syncPath),
        };

        // Validate required fields (matching Workers API)
        if (song.workInfo.title && song.workInfo.workId) {
          songs.push(song);
          console.log(`Successfully loaded song: ${workInfo.title}`);
        } else {
          console.warn(`Skipping ${dir.name}: missing required fields (title or workId)`);
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
      (l) => l.workInfo.title.toLowerCase().includes(lower)
    );
  }
}

// Singleton instance untuk digunakan di seluruh aplikasi
export const koleksiLagu = new KoleksiLagu();
