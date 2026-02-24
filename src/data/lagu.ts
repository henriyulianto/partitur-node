export type TipeNotasi = "Not Angka" | "Not Balok" | "Not Kombinasi";
export type JenisKarya = "Komposisi" | "Aransemen" | "Salinan";
export type Instrument = "1 Suara" | "2 Suara" | "3 Suara" | "4 Suara atau lebih" | "Alat Musik";
export type Gender = "Wanita" | "Pria" | "Campuran";

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

export const daftarLagu: Lagu[] = [
  {
    slug: "serenade-malam",
    judul: "Serenade Malam",
    deskripsi: "Sebuah komposisi lembut untuk piano solo yang menggambarkan keindahan malam yang tenang dan penuh bintang.",
    tipeNotasi: "Not Balok",
    jenisKarya: "Komposisi",
    composer: "Andi Setiawan",
    arranger: "Andi Setiawan",
    lyricist: "Andi Setiawan",
    instrument: "1 Suara",
    gender: "Pria",
    externalUrl: "https://www.youtube.com/watch?v=example1",
  },
  {
    slug: "tarian-angin",
    judul: "Tarian Angin",
    deskripsi: "Aransemen dinamis dari melodi tradisional yang menggambarkan gerakan angin di padang rumput.",
    tipeNotasi: "Not Angka",
    jenisKarya: "Aransemen",
    composer: "Budi Prasetyo",
    arranger: "Citra Dewi",
    lyricist: "Budi Prasetyo",
    instrument: "2 Suara",
    gender: "Campuran",
    externalUrl: "https://www.facebook.com/watch?v=example2",
  },
  {
    slug: "gema-nusantara",
    judul: "Gema Nusantara",
    deskripsi: "Salinan partitur orkestra yang mengangkat tema-tema musik daerah Indonesia dalam format simfoni.",
    tipeNotasi: "Not Kombinasi",
    jenisKarya: "Salinan",
    composer: "Dewi Lestari",
    arranger: "Eka Putra",
    lyricist: "Farah Amalia",
    instrument: "4 Suara atau lebih",
    gender: "Campuran",
    externalUrl: "https://www.youtube.com/watch?v=example3",
  },
  {
    slug: "fajar-di-ufuk-timur",
    judul: "Fajar di Ufuk Timur",
    deskripsi: "Komposisi untuk ansambel tiup yang menggambarkan matahari terbit dengan crescendo megah.",
    tipeNotasi: "Not Balok",
    jenisKarya: "Komposisi",
    composer: "Galih Permana",
    arranger: "Galih Permana",
    lyricist: "Hana Safitri",
    instrument: "3 Suara",
    gender: "Wanita",
    externalUrl: "https://www.instagram.com/p/example4",
  },
  {
    slug: "langkah-sunyi",
    judul: "Langkah Sunyi",
    deskripsi: "Aransemen minimalis untuk gitar klasik dengan nuansa kontemplatif dan meditatif.",
    tipeNotasi: "Not Angka",
    jenisKarya: "Aransemen",
    composer: "Irfan Maulana",
    arranger: "Joko Widodo",
    lyricist: "Joko Widodo",
    instrument: "Alat Musik",
    gender: "Pria",
    externalUrl: "https://www.youtube.com/watch?v=example5",
  },
];

export function getLaguBySlug(slug: string): Lagu | undefined {
  return daftarLagu.find((l) => l.slug === slug);
}

export function cariLagu(keyword: string): Lagu[] {
  const lower = keyword.toLowerCase();
  return daftarLagu.filter(
    (l) =>
      l.judul.toLowerCase().includes(lower) ||
      l.deskripsi.toLowerCase().includes(lower)
  );
}

/** Format credits line based on composer/arranger/lyricist combinations */
export function formatCredits(lagu: Lagu): string {
  const { composer, arranger, lyricist } = lagu;
  const allSame = composer === arranger && arranger === lyricist;
  const compArr = composer === arranger;
  const compLyr = composer === lyricist;
  const arrLyr = arranger === lyricist;

  if (allSame) return `Lagu, syair, dan aransemen: ${composer}`;
  if (compArr) return `Lagu dan aransemen: ${composer} | Syair: ${lyricist}`;
  if (compLyr) return `Lagu dan syair: ${composer} | Aransemen: ${arranger}`;
  if (arrLyr) return `Lagu: ${composer} | Syair dan aransemen: ${arranger}`;
  return `Lagu: ${composer} | Syair: ${lyricist} | Aransemen: ${arranger}`;
}
