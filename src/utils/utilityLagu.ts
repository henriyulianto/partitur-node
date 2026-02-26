import { JenisKarya, TipeNotasi, Lagu } from "@/types/interfaces";

/**
 * Normalize notation type to standard format
 */
export function normalizeNotationType(type: string): TipeNotasi {
  const normalizedType = type.toLowerCase();
  return normalizedType.includes('angka') ? 'Not Angka' :
    normalizedType.includes('balok') ? 'Not Balok' :
      normalizedType.includes('kombinasi') ? 'Not Kombinasi' :
        'Not Angka';
};

/**
 * Normalize work type to standard format
 */
export function normalizeWorkType(type: string): JenisKarya {
  const normalizedType = type.toLowerCase();
  return normalizedType.includes('komposisi') ? 'Komposisi' :
    normalizedType.includes('aransemen') ? 'Aransemen' :
      normalizedType.includes('salinan') ? 'Salinan' :
        'Komposisi';
};

/**
 * Format deskripsi singkat berdasarkan kombinasi composer/arranger/lyricist
 * @param lagu - Data lagu
 * @returns Formatted credits string
 */
export function formatCredits(lagu: Lagu): string {
  const { composer, arranger, lyricist } = lagu.workInfo;
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
