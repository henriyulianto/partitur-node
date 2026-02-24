const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const yaml = require('js-yaml');
const marked = require('marked');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.static('public'));
app.use('/assets', express.static('../partitur/assets'));

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Data loading functions
async function loadSongConfig(workId) {
  try {
    const configPath = path.join(__dirname, '../partitur/lagu', workId, 'exports', `${workId}.config.yaml`);
    const yamlContent = await fs.readFile(configPath, 'utf8');
    return yaml.load(yamlContent);
  } catch (error) {
    console.error(`Error loading config for ${workId}:`, error);
    return null;
  }
}

async function loadAllSongs() {
  try {
    const laguPath = path.join(__dirname, '../partitur/lagu');
    const items = await fs.readdir(laguPath);
    const songs = [];
    
    for (const item of items) {
      const itemPath = path.join(laguPath, item);
      const stat = await fs.stat(itemPath);
      
      if (stat.isDirectory()) {
        const config = await loadSongConfig(item);
        if (config && config.workInfo) {
          songs.push({
            id: item,
            title: config.workInfo.title,
            instrument: config.workInfo.instrument,
            workType: config.workInfo.workType,
            url: `/song/${item}`
          });
        }
      }
    }
    
    return songs;
  } catch (error) {
    console.error('Error loading songs:', error);
    return [];
  }
}

// Routes
app.get('/', async (req, res) => {
  try {
    const songs = await loadAllSongs();
    res.render('index', { 
      title: 'Beranda',
      songs: songs,
      nav_enabled: true,
      has_children: true
    });
  } catch (error) {
    console.error('Error loading homepage:', error);
    res.status(500).render('error', { error: 'Failed to load songs' });
  }
});

app.get('/song/:workId', async (req, res) => {
  try {
    const { workId } = req.params;
    const config = await loadSongConfig(workId);
    
    if (!config) {
      return res.status(404).render('error', { error: 'Song not found' });
    }
    
    res.render('song', {
      title: `${config.workInfo.title} (${config.workInfo.instrument}) | ${config.workInfo.workType}`,
      config: config,
      workId: workId,
      ROOT_LAGU: '/partitur/lagu'
    });
  } catch (error) {
    console.error(`Error loading song ${req.params.workId}:`, error);
    res.status(500).render('error', { error: 'Failed to load song' });
  }
});

// API route for config data
app.get('/api/song/:workId/config', async (req, res) => {
  try {
    const { workId } = req.params;
    const config = await loadSongConfig(workId);
    
    if (!config) {
      return res.status(404).json({ error: 'Song not found' });
    }
    
    res.json(config);
  } catch (error) {
    console.error(`API Error loading song ${req.params.workId}:`, error);
    res.status(500).json({ error: 'Failed to load config' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Partitur NodeJS server running on http://localhost:${PORT}`);
  console.log(`📁 Serving songs from: ${path.join(__dirname, '../partitur/lagu')}`);
});
