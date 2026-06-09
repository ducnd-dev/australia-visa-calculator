"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { ResultsSummary } from "@/components/calculator/ResultsSummary";
import { calculateAllPathways, calculatePoints } from "@/lib/visa-rules/gsm/calculate-points";
import { decodeAnswers } from "@/lib/visa-rules/gsm/encode-answers";
import { buildResultsShareUrl } from "@/lib/share-url";
import { defaultTargetForVisa, suggestImprovements } from "@/lib/visa-rules/gsm/suggest-improvements";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function ResultsContent() {
  const params = useSearchParams();
  const encoded = params.get("d");
  const data = useMemo(() => {
    if (!encoded) return null;
    const answers = decodeAnswers(encoded);
    if (!answers) return null;
    const result = calculatePoints(answers);
    const allPathways = calculateAllPathways(answers);
    const { gap, suggestions } = suggestImprovements(answers, result, defaultTargetForVisa(result.visaSubclass));
    return {
      answers,
      result,
      allPathways,
      suggestions,
      gap,
      shareUrl: buildResultsShareUrl(encoded),
    };
  }, [encoded]);

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-12">
          <h1 className="text-2xl font-semibold text-foreground">Invalid or missing results</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            The link may be broken or expired. Run the calculator again to get a fresh results page.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/calculator">Go to calculator</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <h1 className="sr-only">Assessment results</h1>
      <ResultsSummary {...data} />
    </div>
  );
}

export default function ResultsPage() {
  return <Suspense><ResultsContent /></Suspense>;
}
