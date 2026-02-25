// Cloudflare Pages Function for songs API
import yaml from 'js-yaml';

// Normalize notation type (matches src/lib/utils.ts)
const normalizeNotationType = (type) => {
  const normalizedType = type.toLowerCase();
  return normalizedType.includes('angka') ? 'Not Angka' :
    normalizedType.includes('balok') ? 'Not Balok' :
      normalizedType.includes('kombinasi') ? 'Not Kombinasi' :
        'Not Angka';
};

// Normalize work type (matches src/lib/utils.ts)
const normalizeWorkType = (type) => {
  const normalizedType = type.toLowerCase();
  return normalizedType.includes('komposisi') ? 'Komposisi' :
    normalizedType.includes('aransemen') ? 'Aransemen' :
      normalizedType.includes('salinan') ? 'Salinan' :
        'Komposisi';
};

export async function onRequest(context) {
  const { request, env } = context;

  try {
    // GitHub API configuration
    const GITHUB_OWNER = env.GITHUB_OWNER || 'henriyulianto';
    const GITHUB_REPO = env.GITHUB_REPO || 'partitur-data';
    const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/`;

    // Get repository contents
    const headers = {
      'User-Agent': 'Partitur-App/1.0',
      'Accept': 'application/vnd.github.v3+json'
    };

    // Add authorization token if available
    if (env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${env.GITHUB_TOKEN}`;
    }

    const response = await fetch(GITHUB_API_URL, { headers });

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
          headers: {
            'User-Agent': 'Partitur-App/1.0',
            'Accept': 'application/vnd.github.raw+json'
          }
        });

        if (!configResponse.ok) continue;

        const configContent = await configResponse.text();
        const config = yaml.load(configContent);

        // Construct song object
        const song = {
          slug: dir.name,
          judul: config.workInfo.title || dir.name,
          deskripsi: config.workInfo.fullTitle || '',
          tipeNotasi: normalizeNotationType(config.workInfo.notationType || 'not angka'),
          jenisKarya: normalizeWorkType(config.workInfo.workType || 'Komposisi'),
          composer: config.workInfo.composer || '',
          arranger: config.workInfo.arranger || config.workInfo.composer || '',
          lyricist: config.workInfo.lyricist || config.workInfo.composer || '',
          instrument: config.workInfo.instrument || '1 Suara',
          gender: config.workInfo.gender || 'Campuran',
          externalUrl: config.workInfo.externalURL
        };

        // Validate required fields
        if (song.judul && song.composer) {
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
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
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
