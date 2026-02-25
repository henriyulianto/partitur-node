import { useSearchParams } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import LaguCard from "@/components/LaguCard";
import { koleksiLagu } from "@/models/KoleksiLagu";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("kata-kunci") || "";
  const results = koleksiLagu.cariLagu(keyword);

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Hasil Pencarian
          </h1>
          <p className="mt-1 text-muted-foreground">
            {results.length} hasil untuk "{keyword}"
          </p>
        </div>

        {results.length > 0 ? (
          <div className="grid gap-4">
            {results.map((lagu) => (
              <LaguCard key={lagu.slug} lagu={lagu} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
            Tidak ada lagu yang ditemukan.
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default SearchResults;
