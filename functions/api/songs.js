// Cloudflare Pages Function for songs API
import yaml from 'js-yaml';

export async function onRequest(context) {
  const { request, env } = context;

  const getRawGithubFileUrl = (title, filename = title) => {
    const GITHUB_OWNER = env.GITHUB_OWNER || 'henriyulianto';
    const GITHUB_REPO = env.GITHUB_REPO || 'partitur-data';
    return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${title}/exports/${filename}`;
  }

  const buildHeaders = (accept = 'application/vnd.github+json') => {
    const headers = {
      'User-Agent': 'Partitur-App/1.0',
      'X-GitHub-Api-Version': '2022-11-28',
      'Accept': accept
    };

    // Add authorization token if available
    const token = env.GITHUB_TOKEN || env.GITHUB_API_TOKEN || '';
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  try {
    // GitHub API configuration
    const GITHUB_OWNER = env.GITHUB_OWNER || 'henriyulianto';
    const GITHUB_REPO = env.GITHUB_REPO || 'partitur-data';
    const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/`;

    // Get repository contents
    const response = await fetch(GITHUB_API_URL, {
      headers: buildHeaders()
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const contents = await response.json();

    // Filter directories (songs)
    const songDirs = contents.filter(item =>
      item.type === 'dir' && !item.name.startsWith('.')
    );

    // Process each song directory
    const songs = [];

    for (const dir of songDirs) {
      try {
        // Get config file for each song
        const configUrl = `${GITHUB_API_URL}${dir.name}/exports/${dir.name}.config.yaml`;

        const configResponse = await fetch(configUrl, {
          headers: buildHeaders('application/vnd.github.raw+json')
        });

        if (!configResponse.ok) continue;

        const configContent = await configResponse.text();
        const config = yaml.load(configContent);

        // Construct song object
        let song = {
          // Identitas Lagu
          slug: config.workId || dir.name,
          ...config,
          files: {
            audioPath: config.files.audioPath || `${config.workInfo.workId}.m4a`,
            svgPath: config.files.svgPath || `${config.workInfo.workId}.svg`,
            syncPath: config.files.syncPath || `${config.workInfo.workId}.yaml`,
          },
          urls: null
        };

        song.urls = {
          audio: song.cdn.provider === 'archive.org'
            ? `https://${song.cdn.provider}/download/${song.cdn.identifier}/${song.files.audioPath}`
            : getRawGithubFileUrl(song.slug, song.files.audioPath),
          pdf: `${getRawGithubFileUrl(song.slug)}.pdf`,
          svg: getRawGithubFileUrl(song.slug, song.files.svgPath),
          sync: getRawGithubFileUrl(song.slug, song.files.syncPath),
        };

        // Validate required fields
        if (song.workInfo.title && song.workInfo.workId) {
          songs.push(song);
        }

      } catch (error) {
        console.warn(`Failed to process song ${dir.name}:`, error);
      }
    }

    return new Response(JSON.stringify(songs), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'public, max-age=600' // Cache for 10 minutes
      }
    });

  } catch (error) {
    console.error('Error loading songs from GitHub:', error);

    return new Response(JSON.stringify({ error: 'Failed to load songs' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
