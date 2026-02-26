export type TipeNotasi = "Not Angka" | "Not Balok" | "Not Kombinasi";
export type JenisKarya = "Komposisi" | "Aransemen" | "Salinan";
export type Instrument = "1 Suara" | "2 Suara" | "3 Suara" | "4 Suara atau lebih" | "Alat Musik";
export type Gender = "Wanita" | "Pria" | "Campuran";

// Work information structure
export interface WorkInfo {
  title: string;
  fullTitle: string;
  composer: string;
  arranger: string;
  lyricist: string;
  instrument: Instrument;
  notationType: string;
  workType: string;
  workId: string;
  movementName: string;
  externalURL: string;
}

// CDN configuration
export interface CDN {
  provider: string;
  identifier: string;
}

// File paths
export interface Files {
  audioPath: string;
  svgPath: string;
  syncPath: string;
}

// Musical structure
export interface MusicalStructure {
  totalDurationSeconds: number;
  totalMeasures: number;
  lastMeasureDuration: string;
  visualLeadTimeSeconds: number;
}

// Measure highlighter configuration
export interface MeasureHighlighters {
  [key: string]: {
    name: string;
    type: string;
    colors: string[];
    opacity: number;
  };
}

// File URLs
export interface URLs {
  audio: string;
  pdf: string;
  svg: string;
  sync: string;
}

/**
 * Interface untuk data lagu
 */
export interface Lagu {
  // Identitas Lagu
  slug: string;
  workInfo: WorkInfo;
  cdn: CDN;
  files: Files;
  musicalStructure: MusicalStructure;
  measureHighlighters: MeasureHighlighters;
  urls: URLs;
}
