import type { TipeNotasi, JenisKarya } from "@/types/interfaces";

const notasiColors: Record<TipeNotasi, string> = {
  "Not Angka": "bg-badge-not-angka text-badge-not-angka-fg",
  "Not Balok": "bg-badge-not-balok text-badge-not-balok-fg",
  "Not Kombinasi": "bg-badge-not-kombinasi text-badge-not-kombinasi-fg",
};

const karyaColors: Record<JenisKarya, string> = {
  "Komposisi": "bg-badge-komposisi text-badge-komposisi-fg",
  "Aransemen": "bg-badge-aransemen text-badge-aransemen-fg",
  "Salinan": "bg-badge-salinan text-badge-salinan-fg",
};

export function NotasiBadge({ tipe }: { tipe: TipeNotasi }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${notasiColors[tipe]}`}>
      {tipe}
    </span>
  );
}

export function KaryaBadge({ jenis }: { jenis: JenisKarya }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${karyaColors[jenis]}`}>
      {jenis}
    </span>
  );
}
