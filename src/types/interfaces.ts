export type TipeNotasi = "Not Angka" | "Not Balok" | "Not Kombinasi";
export type JenisKarya = "Komposisi" | "Aransemen" | "Salinan";
export type Instrument = "1 Suara" | "2 Suara" | "3 Suara" | "4 Suara atau lebih" | "Alat Musik";
export type Gender = "Wanita" | "Pria" | "Campuran";

/**
 * Interface untuk data lagu
 */
export interface Lagu {
  slug: string;
  judul: string;
  deskripsi: string;
  tipeNotasi: TipeNotasi;
  jenisKarya: JenisKarya;
  composer: string;
  arranger: string;
  lyricist: string;
  instrument: Instrument;
  gender: Gender;
  externalUrl?: string;
}
