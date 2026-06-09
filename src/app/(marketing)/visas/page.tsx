import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StaticPage } from "@/components/layout/StaticPage";
import { VisaCatalogGrid } from "@/components/visas/VisaCatalogGrid";
import { Button } from "@/components/ui/button";
import { getActiveVisaCount } from "@/lib/visa-rules/visa-catalog";
import { EOI_MINIMUM_POINTS } from "@/lib/visa-rules/sources";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Australian visa subclasses directory",
  description:
    "Reference list of skilled, employer-sponsored, regional, graduate, business, and family visa subclasses. Schedule 6D points calculator for GSM 189, 190, and 491.",
  path: "/visas",
  keywords: [
    "Australia visa subclasses list",
    "189 190 491 visa",
    "482 186 skilled visa Australia",
    "migration visa types",
  ],
});

export default function VisasPage() {
  const activeCount = getActiveVisaCount();

  return (
    <StaticPage
      wide
      title="Australian visa subclasses"
      description={`Reference directory of ${activeCount}+ common visa subclasses and streams. Use it alongside official Home Affairs guidance — not as a substitute for advice.`}
    >
      <div className="not-prose mb-10 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-6">
        <h2 className="text-base font-semibold text-foreground">Schedule 6D points calculator</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Only skilled migration subclasses <strong>189</strong> (Skilled Independent),{" "}
          <strong>190</strong> (Skilled Nominated), and <strong>491</strong> (Skilled Work Regional
          Provisional) use the Schedule 6D points test in this tool. All other subclasses listed below
          are for <strong>reference</strong> — they have different eligibility criteria (sponsorship,
          investment, study, family relationship, etc.).
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/calculator">
              GSM points calculator
              <ArrowRight className="ml-2 size-4" aria-hidden />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/sources">Official sources</Link>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          SkillSelect EOI minimum for GSM: {EOI_MINIMUM_POINTS} points. Competitive invitation scores
          are often higher and vary by occupation and round.
        </p>
      </div>

      <h2>Directory</h2>
      <p>
        Subclasses are grouped by pathway type. Status labels indicate whether a stream is commonly
        active, limited, or legacy. Always verify current status on Home Affairs before advising
        clients.
      </p>

      <VisaCatalogGrid />
    </StaticPage>
  );
}
