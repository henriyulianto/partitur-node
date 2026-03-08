#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * Get raw GitHub file URL (for compatibility)
 */
function getRawGithubFileUrl(title, filename) {
    const GITHUB_OWNER = 'henriyulianto';
    const GITHUB_REPO = 'partitur-data';
    return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${title}/exports/${filename}`;
}
/**
 * Process a single song directory
 */
function processSongDirectory(songDir, baseDataPath) {
    try {
        const songPath = path.join(baseDataPath, songDir);
        // Check if directory exists
        if (!fs.existsSync(songPath)) {
            console.warn(`Directory ${songDir} not found, skipping...`);
            return null;
        }
        // Read config file
        const configPath = path.join(songPath, 'exports', `${songDir}.config.yaml`);
        if (!fs.existsSync(configPath)) {
            console.warn(`Config file not found for ${songDir}, skipping...`);
            return null;
        }
        const configContent = fs.readFileSync(configPath, 'utf8');
        const config = yaml.load(configContent);
        // Validate required fields
        if (!config.workInfo?.workId) {
            console.warn(`Invalid config for ${songDir}: missing workId, skipping...`);
            return null;
        }
        // Construct song object (same logic as _loadFromGitHubAPI)
        let song = {
            slug: config.workInfo.workId || songDir,
            ...config,
            files: {
                audioPath: config.files?.audioPath || `${config.workInfo?.workId || songDir}.m4a`,
                svgPath: config.files?.svgPath || `${config.workInfo?.workId || songDir}.svg`,
                syncPath: config.files?.syncPath || `${config.workInfo?.workId || songDir}.yaml`,
            },
            urls: null
        };
        // Generate URLs based on CDN provider
        song.urls = {
            audio: song.cdn?.provider === 'archive.org'
                ? `https://${song.cdn.provider}/download/${song.cdn.identifier}/${song.files?.audioPath}`
                : `/partitur-data/${song.slug}/exports/${song.files?.audioPath}`,
            pdf: `/partitur-data/${song.slug}/exports/${song.slug}.pdf`,
            svg: `/partitur-data/${song.slug}/exports/${song.files?.svgPath}`,
            sync: `/partitur-data/${song.slug}/exports/${song.files?.syncPath}`,
        };
        return song;
    }
    catch (error) {
        console.error(`Error processing ${songDir}:`, error);
        return null;
    }
}
/**
 * Generate index.json from local partitur-data directory
 */
async function generateIndexJson() {
    const publicDataPath = path.join(__dirname, '..', 'public', 'partitur-data');
    const distDataPath = path.join(__dirname, '..', 'dist', 'partitur-data');
    console.log('🔍 Scanning partitur-data directory...');
    // Use public directory if exists, otherwise dist directory
    const sourcePath = fs.existsSync(publicDataPath) ? publicDataPath : distDataPath;
    if (!fs.existsSync(sourcePath)) {
        console.error(`❌ Partitur data directory not found. Neither ${publicDataPath} nor ${distDataPath} exists.`);
        process.exit(1);
    }
    console.log(`📁 Using data from: ${sourcePath}`);
    // Get all directories in the partitur-data folder
    const entries = fs.readdirSync(sourcePath, { withFileTypes: true });
    const directories = entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .filter(dir => !dir.startsWith('.')); // Skip hidden directories
    console.log(`📚 Found ${directories.length} song directories`);
    // Process each directory
    const songs = [];
    for (const dir of directories) {
        const song = processSongDirectory(dir, sourcePath);
        if (song) {
            songs.push(song);
            console.log(`✅ Processed: ${song.slug}`);
        }
    }
    if (songs.length === 0) {
        console.warn('⚠️ No valid songs found. Check your config files.');
        process.exit(1);
    }
    // Sort songs by title
    songs.sort((a, b) => a.workInfo.title.localeCompare(b.workInfo.title));
    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, '..', 'dist', 'partitur-data');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    // Write index.json
    const outputPath = path.join(outputDir, 'index.json');
    fs.writeFileSync(outputPath, JSON.stringify(songs, null, 2));
    console.log(`✅ Generated index.json with ${songs.length} songs`);
    console.log(`📍 Output: ${outputPath}`);
    // Show summary
    console.log('\n📊 Summary:');
    console.log(`- Total songs: ${songs.length}`);
    console.log(`- Composers: ${[...new Set(songs.map(s => s.workInfo.composer))].length}`);
    console.log(`- Work types: ${[...new Set(songs.map(s => s.workInfo.workType))].join(', ')}`);
    // Show first few songs as preview
    console.log('\n🎵 First 5 songs:');
    songs.slice(0, 5).forEach((song, i) => {
        console.log(`${i + 1}. ${song.workInfo.title} (${song.workInfo.composer})`);
    });
    if (songs.length > 5) {
        console.log(`... and ${songs.length - 5} more`);
    }
}
/**
 * Generate individual song data files
 */
async function generateSongDataFiles() {
    const publicDataPath = path.join(__dirname, '..', 'public', 'partitur-data');
    const distDataPath = path.join(__dirname, '..', 'dist', 'partitur-data');
    const sourcePath = fs.existsSync(publicDataPath) ? publicDataPath : distDataPath;
    const outputDir = path.join(__dirname, '..', 'dist', 'partitur-data');
    console.log('\n🔧 Generating individual song data files...');
    // Get all directories
    const entries = fs.readdirSync(sourcePath, { withFileTypes: true });
    const directories = entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .filter(dir => !dir.startsWith('.'));
    for (const dir of directories) {
        const song = processSongDirectory(dir, sourcePath);
        if (song) {
            // Create individual song directory
            const songOutputDir = path.join(outputDir, dir);
            if (!fs.existsSync(songOutputDir)) {
                fs.mkdirSync(songOutputDir, { recursive: true });
            }
            // Write individual data.json
            const songDataPath = path.join(songOutputDir, 'data.json');
            fs.writeFileSync(songDataPath, JSON.stringify(song, null, 2));
            console.log(`📝 Generated: ${dir}/data.json`);
        }
    }
}
// Main execution
async function main() {
    console.log('🚀 Generating index.json from local partitur-data...\n');
    try {
        await generateIndexJson();
        await generateSongDataFiles();
        console.log('\n🎉 All files generated successfully!');
        console.log('💡 You can now use VITE_BYPASS_API=true to test with local data.');
    }
    catch (error) {
        console.error('❌ Error generating files:', error);
        process.exit(1);
    }
}
// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
export { generateIndexJson, generateSongDataFiles };
