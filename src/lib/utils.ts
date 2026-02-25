import { JenisKarya, TipeNotasi } from "@/types/interfaces";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeNotationType(type: string): TipeNotasi {
  const normalizedType = type.toLowerCase();
  return normalizedType.includes('angka') ? 'Not Angka' :
    normalizedType.includes('balok') ? 'Not Balok' :
      normalizedType.includes('kombinasi') ? 'Not Kombinasi' :
        'Not Angka';
};

// Normalize work type
export function normalizeWorkType(type: string): JenisKarya {
  const normalizedType = type.toLowerCase();
  return normalizedType.includes('komposisi') ? 'Komposisi' :
    normalizedType.includes('aransemen') ? 'Aransemen' :
      normalizedType.includes('salinan') ? 'Salinan' :
        'Komposisi';
};
