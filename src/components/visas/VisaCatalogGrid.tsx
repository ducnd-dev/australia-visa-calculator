import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  VISA_CATEGORIES,
  catalogEntryId,
  getVisasByCategory,
  pointsSupportLabel,
  type VisaCatalogEntry,
} from "@/lib/visa-rules/visa-catalog";

function statusVariant(status: VisaCatalogEntry["status"]) {
  if (status === "legacy") return "secondary" as const;
  if (status === "limited") return "warning" as const;
  return "default" as const;
}

function VisaCard({ entry }: { entry: VisaCatalogEntry }) {
  const title = entry.stream ? `${entry.label} — ${entry.stream}` : entry.label;

  return (
    <li className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/25">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-lg font-bold text-primary">Subclass {entry.code}</p>
          <p className="mt-0.5 text-sm font-medium text-foreground">{title}</p>
        </div>
        {entry.status && entry.status !== "active" && (
          <Badge variant={statusVariant(entry.status)} className="shrink-0 text-[10px] capitalize">
            {entry.status}
          </Badge>
        )}
      </div>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{entry.description}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="text-[10px] font-normal">
          {pointsSupportLabel(entry.pointsSupport)}
        </Badge>
        {entry.nominationPoints !== undefined && entry.nominationPoints > 0 && (
          <Badge className="text-[10px]">+{entry.nominationPoints} pts (6D)</Badge>
        )}
      </div>
      {entry.calculatorHref && (
        <Link
          href={entry.calculatorHref}
          className="mt-3 text-sm font-medium text-primary hover:underline"
        >
          Open points calculator →
        </Link>
      )}
    </li>
  );
}

export function VisaCatalogGrid({ categoryIds }: { categoryIds?: typeof VISA_CATEGORIES[number]["id"][] }) {
  const categories = categoryIds
    ? VISA_CATEGORIES.filter((c) => categoryIds.includes(c.id))
    : VISA_CATEGORIES;

  return (
    <div className="space-y-12">
      {categories.map((cat) => {
        const visas = getVisasByCategory(cat.id);
        if (visas.length === 0) return null;
        return (
          <section key={cat.id} aria-labelledby={`visa-cat-${cat.id}`}>
            <h2 id={`visa-cat-${cat.id}`} className="text-xl font-semibold tracking-tight">
              {cat.title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{cat.description}</p>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visas.map((entry) => (
                <VisaCard key={catalogEntryId(entry)} entry={entry} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
