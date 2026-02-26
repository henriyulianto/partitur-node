import { Link } from "react-router-dom";
import type { Lagu } from "@/types/interfaces";
import { KoleksiLagu } from "@/models/KoleksiLagu";
import { NotasiBadge, KaryaBadge } from "@/components/LaguBadge";
import { ArrowRight, ExternalLink } from "lucide-react";
import { normalizeNotationType, normalizeWorkType, formatCredits } from "@/utils/utilityLagu";

export default function LaguCard({ lagu }: { lagu: Lagu }) {
  return (
    <Link
      to={`/${lagu.slug}`}
      className="group block rounded-lg border bg-card p-5 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-accent/10 hover:border-accent/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-semibold group-hover:text-accent-foreground transition-colors">
            {lagu.workInfo.title} ({lagu.workInfo.instrument})
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
            {formatCredits(lagu)}
          </p>
          {lagu.workInfo.externalURL && (
            <div className="mt-1.5 text-sm">
              <a
                href={lagu.workInfo.externalURL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-accent hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                URL Eksternal
              </a>
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <NotasiBadge tipe={normalizeNotationType(lagu.workInfo.notationType)} />
            <KaryaBadge jenis={normalizeWorkType(lagu.workInfo.workType)} />
          </div>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all duration-200 mt-1" />
      </div>
    </Link>
  );
}
