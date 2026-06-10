import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { SectionCard } from "@/components/layout/SectionCard";
import { STATE_NOMINATION_REFS } from "@/lib/occupations/state-nomination-refs";

export function StateNominationPanel({
  anzscoCode,
  anzscoTitle,
  visaSubclass,
}: {
  anzscoCode: string | null;
  anzscoTitle: string | null;
  visaSubclass?: string | null;
}) {
  const relevant = visaSubclass === "190" || visaSubclass === "491" || !visaSubclass;
  if (!anzscoCode || !relevant) return null;

  return (
    <SectionCard
      title="State nomination reference"
      description="Curated links only — always verify occupation eligibility on the official state site."
    >
      {anzscoTitle && (
        <p className="mb-4 text-sm text-muted-foreground">
          Occupation: <span className="font-medium text-foreground">ANZSCO {anzscoCode}</span>
          {" — "}
          {anzscoTitle}
        </p>
      )}
      <ul className="space-y-3">
        {STATE_NOMINATION_REFS.map((ref) => (
          <li
            key={ref.code}
            className="rounded-lg border border-border/80 bg-muted/20 px-3 py-2.5 text-sm"
          >
            <p className="font-medium text-foreground">{ref.state}</p>
            <p className="mt-1 text-xs text-muted-foreground">{ref.notes}</p>
            <div className="mt-2 flex flex-wrap gap-3">
              <Link
                href={ref.subclass190Url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                190 info
                <ExternalLink className="size-3" aria-hidden />
              </Link>
              <Link
                href={ref.subclass491Url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                491 info
                <ExternalLink className="size-3" aria-hidden />
              </Link>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-muted-foreground">
        Not migration advice. Cross-check ANZSCO {anzscoCode} on{" "}
        <Link
          href="https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Home Affairs occupation search
        </Link>
        .
      </p>
    </SectionCard>
  );
}
