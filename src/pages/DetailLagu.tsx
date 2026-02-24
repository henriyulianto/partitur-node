import { useParams, Navigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { getLaguBySlug, formatCredits } from "@/data/lagu";
import { NotasiBadge, KaryaBadge } from "@/components/LaguBadge";
import { User, Music, Mic2, Piano, Users } from "lucide-react";

const DetailLagu = () => {
  const { slug } = useParams<{ slug: string }>();
  const lagu = slug ? getLaguBySlug(slug) : undefined;

  if (!lagu) {
    return <Navigate to="/" replace />;
  }

  const metadataItems = [
    { icon: User, label: "Komposer", value: lagu.composer },
    { icon: Music, label: "Aransemen", value: lagu.arranger },
    { icon: Mic2, label: "Syair", value: lagu.lyricist },
    { icon: Piano, label: "Instrumen", value: lagu.instrument },
    { icon: Users, label: "Gender", value: lagu.gender },
  ];

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-5xl bg-popover min-h-[calc(100vh-3.5rem)]">
        {/* Header lagu */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {lagu.judul}
          </h1>
          <p className="mt-2 text-muted-foreground">{formatCredits(lagu)}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <NotasiBadge tipe={lagu.tipeNotasi} />
            <KaryaBadge jenis={lagu.jenisKarya} />
          </div>
        </div>

        {/* Metadata section */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metadataItems.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-start gap-3 rounded-lg border bg-card p-4"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/15 text-accent">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {label}
                </p>
                <p className="mt-0.5 text-sm font-semibold truncate">
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Placeholder content area */}
        <div className="rounded-lg border-2 border-dashed border-border p-12 flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground text-center">
            Area konten partitur —{" "}
            <span className="font-medium text-foreground">{lagu.judul}</span>
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default DetailLagu;
