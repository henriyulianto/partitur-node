// API utility functions for fetching songs data

const BYPASS_API = import.meta.env.VITE_BYPASS_API === 'true';

export interface Song {
  id: string;
  title: string;
  composer?: string;
  arranger?: string;
  key?: string;
  tempo?: string;
  urls: {
    pdf?: string;
    audio?: string;
    midi?: string;
    musicxml?: string;
  };
  workInfo: {
    workType: string;
    tonality?: string;
    timeSignature?: string;
  };
}

export async function fetchSongs(): Promise<Song[]> {
  if (BYPASS_API) {
    console.log('🏠 Bypassing API - serving from local filesystem');
    
    try {
      // Fetch from local dist/partitur-data/index.json
      const response = await fetch('/partitur-data/index.json');
      
      if (!response.ok) {
        throw new Error('Failed to fetch local data');
      }
      
      const data = await response.json();
      console.log('✅ Successfully loaded local data');
      return data;
      
    } catch (error) {
      console.error('❌ Error loading local data:', error);
      throw new Error('Failed to load local songs data. Make sure dist/partitur-data/index.json exists.');
    }
  }
  
  // Normal API flow
  try {
    const response = await fetch('/api/songs');
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if response contains error
    if (data.error) {
      throw new Error(data.error);
    }
    
    console.log('✅ Successfully loaded data from API');
    return data;
    
  } catch (error) {
    console.error('❌ Error fetching songs from API:', error);
    throw error;
  }
}

export async function fetchSongById(id: string): Promise<Song | null> {
  if (BYPASS_API) {
    console.log(`🏠 Bypassing API - fetching song ${id} from local filesystem`);
    
    try {
      // Fetch individual song data from local filesystem
      const response = await fetch(`/partitur-data/${id}/data.json`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch local song data: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ Successfully loaded local song data for ${id}`);
      return data;
      
    } catch (error) {
      console.error(`❌ Error loading local song data for ${id}:`, error);
      throw new Error(`Failed to load local song data for ${id}. Make sure dist/partitur-data/${id}/data.json exists.`);
    }
  }
  
  // Normal API flow - find song in the list
  try {
    const songs = await fetchSongs();
    return songs.find(song => song.id === id) || null;
  } catch (error) {
    console.error(`❌ Error fetching song ${id} from API:`, error);
    throw error;
  }
}
