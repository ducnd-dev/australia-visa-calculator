"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { OptionCard } from "@/components/ui/option-card";
import {
  REFERENCE_VISA_CATEGORY_IDS,
  VISA_CATEGORIES,
  catalogEntryId,
  getVisasByCategory,
  pointsSupportLabel,
} from "@/lib/visa-rules/visa-catalog";
import { GSM_PATHWAYS } from "@/lib/visa-rules/gsm/visa-pathways";
import type { CalculatorAnswers } from "@/lib/visa-rules/gsm/calculator-schema";
import { PathwayScoresPanel } from "./PathwayScoresPanel";
import type { AllPathwayScores } from "@/lib/visa-rules/gsm/calculate-all-pathways";

type VisaStepSelectorProps = {
  selected: CalculatorAnswers["visaSubclass"];
  onSelect: (code: CalculatorAnswers["visaSubclass"]) => void;
  allPathways: AllPathwayScores | null;
};

export function VisaStepSelector({ selected, onSelect, allPathways }: VisaStepSelectorProps) {
  const gsmVisas = getVisasByCategory("gsm");
  const selectedMeta = gsmVisas.find((v) => v.code === selected);
  const selectedPathway = GSM_PATHWAYS.find((p) => p.code === selected);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">
          Choose your GSM pathway — Schedule 6D points for <strong>189</strong>, <strong>190</strong>, and{" "}
          <strong>491</strong> update together below.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {gsmVisas.map((entry) => {
            const pathway = GSM_PATHWAYS.find((p) => p.code === entry.code)!;
            const isSelected = selected === entry.code;
            return (
              <OptionCard
                key={entry.code}
                selected={isSelected}
                onClick={() => onSelect(entry.code as CalculatorAnswers["visaSubclass"])}
              >
                <div className="space-y-2 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-lg font-bold text-primary">Subclass {entry.code}</span>
                    {entry.nominationPoints !== undefined && entry.nominationPoints > 0 && (
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        +{entry.nominationPoints} pts
                      </Badge>
                    )}
                  </div>
                  <p className="font-medium leading-snug text-foreground">{entry.label}</p>
                  {entry.stream && (
                    <p className="text-xs text-muted-foreground">{entry.stream}</p>
                  )}
                  <p className="text-xs leading-relaxed text-muted-foreground line-clamp-3">
                    {entry.description}
                  </p>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-primary/80">
                    {pathway.shortLabel}
                  </p>
                </div>
              </OptionCard>
            );
          })}
        </div>
      </div>

      {selectedMeta && selectedPathway && (
        <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            Selected pathway
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            Subclass {selectedMeta.code} — {selectedMeta.label}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{selectedMeta.description}</p>
          <p className="mt-2 text-sm text-foreground">
            <span className="font-medium">Nomination:</span> {selectedPathway.nominationNote}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Schedule 6D citation: {selectedPathway.citation}
          </p>
        </div>
      )}

      {allPathways && <PathwayScoresPanel all={allPathways} />}

      <details className="group rounded-xl border border-dashed border-border bg-muted/20">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
          Other Australian visas (reference — not scored here)
          <span className="ml-2 text-xs font-normal text-muted-foreground group-open:hidden">
            Show {REFERENCE_VISA_CATEGORY_IDS.length} categories
          </span>
        </summary>
        <div className="space-y-6 border-t border-border px-4 py-4">
          {REFERENCE_VISA_CATEGORY_IDS.map((catId) => {
            const cat = VISA_CATEGORIES.find((c) => c.id === catId)!;
            const visas = getVisasByCategory(catId).filter((v) => v.status !== "legacy");
            return (
              <div key={catId}>
                <h3 className="text-sm font-semibold text-foreground">{cat.title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{cat.description}</p>
                <ul className="mt-2 space-y-2">
                  {visas.map((v) => (
                    <li
                      key={catalogEntryId(v)}
                      className="rounded-lg border border-border/80 bg-card px-3 py-2 text-sm"
                    >
                      <span className="font-semibold text-primary">{v.code}</span>
                      <span className="text-foreground">
                        {" "}
                        — {v.stream ? `${v.label} (${v.stream})` : v.label}
                      </span>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{v.description}</p>
                      <Badge variant="outline" className="mt-1.5 text-[10px] font-normal">
                        {pointsSupportLabel(v.pointsSupport)}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          <Link
            href="/visas"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Full visa directory
            <ExternalLink className="size-3.5" aria-hidden />
          </Link>
        </div>
      </details>
    </div>
  );
}
