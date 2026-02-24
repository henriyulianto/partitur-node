import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import LaguCard from "@/components/LaguCard";
import { daftarLagu, TipeNotasi, JenisKarya } from "@/data/lagu";
import { Filter, ArrowUpDown, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type SortOrder = "default" | "asc" | "desc";

const TIPE_NOTASI: TipeNotasi[] = ["Not Angka", "Not Balok", "Not Kombinasi"];
const JENIS_KARYA: JenisKarya[] = ["Komposisi", "Aransemen", "Salinan"];

const notasiChipStyle: Record<TipeNotasi, string> = {
  "Not Angka": "bg-badge-not-angka text-badge-not-angka-fg",
  "Not Balok": "bg-badge-not-balok text-badge-not-balok-fg",
  "Not Kombinasi": "bg-badge-not-kombinasi text-badge-not-kombinasi-fg",
};

const karyaChipStyle: Record<JenisKarya, string> = {
  Komposisi: "bg-badge-komposisi text-badge-komposisi-fg",
  Aransemen: "bg-badge-aransemen text-badge-aransemen-fg",
  Salinan: "bg-badge-salinan text-badge-salinan-fg",
};

const Index = () => {
  const [activeNotasi, setActiveNotasi] = useState<TipeNotasi | null>(null);
  const [activeKarya, setActiveKarya] = useState<JenisKarya | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("default");
  const [filterOpen, setFilterOpen] = useState(true);

  const filtered = useMemo(() => {
    let result = daftarLagu.filter((l) => {
      if (activeNotasi && l.tipeNotasi !== activeNotasi) return false;
      if (activeKarya && l.jenisKarya !== activeKarya) return false;
      return true;
    });
    if (sortOrder === "asc") result = [...result].sort((a, b) => a.judul.localeCompare(b.judul));
    if (sortOrder === "desc") result = [...result].sort((a, b) => b.judul.localeCompare(a.judul));
    return result;
  }, [activeNotasi, activeKarya, sortOrder]);

  const hasFilter = activeNotasi || activeKarya;
  const cycleSortOrder = () => setSortOrder((s) => s === "default" ? "asc" : s === "asc" ? "desc" : "default");
  const sortLabel = sortOrder === "asc" ? "A–Z" : sortOrder === "desc" ? "Z–A" : "Urutan";

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Animasi Partitur Musik
          </h1>
          <p className="mt-2 text-muted-foreground text-lg">
            Koleksi partitur musik dengan animasi interaktif.
          </p>
        </div>

        {/* Filters */}
        <Collapsible open={filterOpen} onOpenChange={setFilterOpen} className="mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CollapsibleTrigger className="flex items-center gap-2 hover:text-foreground transition-colors">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filter</span>
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", filterOpen && "rotate-180")} />
            </CollapsibleTrigger>
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{filtered.length} lagu</span>
            <button
              onClick={cycleSortOrder}
              className={cn(
                "ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                sortOrder !== "default" ? "bg-accent/20 text-accent-foreground" : "bg-muted hover:bg-muted/80"
              )}
            >
              <ArrowUpDown className="h-3 w-3" />
              {sortLabel}
            </button>
            {hasFilter && (
              <button
                onClick={() => { setActiveNotasi(null); setActiveKarya(null); }}
                className="ml-2 text-xs underline hover:text-foreground transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          <CollapsibleContent className="space-y-3 mt-3">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground self-center mr-1">Notasi:</span>
              {TIPE_NOTASI.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveNotasi(activeNotasi === t ? null : t)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                    activeNotasi === t
                      ? notasiChipStyle[t]
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground self-center mr-1">Karya:</span>
              {JENIS_KARYA.map((j) => (
                <button
                  key={j}
                  onClick={() => setActiveKarya(activeKarya === j ? null : j)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                    activeKarya === j
                      ? karyaChipStyle[j]
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {j}
                </button>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Song list */}
        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              filtered.map((lagu, i) => (
                <motion.div
                  key={lagu.slug}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, delay: i * 0.06 }}
                >
                  <LaguCard lagu={lagu} />
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg border border-dashed p-12 text-center text-muted-foreground"
              >
                Tidak ada lagu yang cocok dengan filter.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
