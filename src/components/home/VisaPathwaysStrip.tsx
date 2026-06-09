import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { HomeReveal } from "./HomeReveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  REFERENCE_VISA_CATEGORY_IDS,
  VISA_CATEGORIES,
  catalogEntryId,
  getActiveVisaCount,
  getVisasByCategory,
  pointsSupportLabel,
} from "@/lib/visa-rules/visa-catalog";
import { GSM_PATHWAYS } from "@/lib/visa-rules/gsm/visa-pathways";
import { EOI_MINIMUM_POINTS } from "@/lib/visa-rules/sources";

export function VisaPathwaysStrip() {
  const activeCount = getActiveVisaCount();

  return (
    <section
      aria-labelledby="visa-strip-heading"
      className="border-y border-border/60 bg-gradient-to-br from-primary/8 via-background to-sky-500/5 py-12 md:py-16"
    >
      <HomeReveal className="mx-auto max-w-6xl px-4">
        <SectionHeading
          id="visa-strip-heading"
          eyebrow="Visa directory"
          title="GSM pathways scored in-app"
          description={`${activeCount}+ subclasses and streams in our reference list. Schedule 6D points for 189, 190, and 491 calculated together — minimum ${EOI_MINIMUM_POINTS} for SkillSelect EOI.`}
          align="center"
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {GSM_PATHWAYS.map((p) => (
            <Link
              key={p.code}
              href={`/calculator?visa=${p.code}`}
              className="group rounded-2xl border border-primary/25 bg-card px-6 py-8 text-center shadow-md transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
            >
              <p className="text-3xl font-bold text-primary">{p.code}</p>
              <p className="mt-1 text-sm font-medium text-foreground">{p.label}</p>
              <p className="mt-2 text-xs text-muted-foreground">{p.shortLabel}</p>
              <p className="mt-4 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {p.nominationPoints === 0
                  ? "Base Schedule 6D score"
                  : `+${p.nominationPoints} nomination`}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-12 space-y-8">
          {REFERENCE_VISA_CATEGORY_IDS.map((catId) => {
            const cat = VISA_CATEGORIES.find((c) => c.id === catId)!;
            const visas = getVisasByCategory(catId).filter((v) => v.status !== "legacy");
            return (
              <div key={catId}>
                <h3 className="text-sm font-semibold text-foreground">{cat.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{cat.description}</p>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {visas.map((v) => (
                    <li
                      key={catalogEntryId(v)}
                      className="rounded-lg border border-border/80 bg-card/70 px-3 py-2.5 text-sm"
                    >
                      <span className="font-semibold text-primary">{v.code}</span>
                      <span className="mx-1 text-muted-foreground">·</span>
                      <span className="text-foreground">
                        {v.stream ? `${v.label} (${v.stream})` : v.label}
                      </span>
                      <Badge variant="outline" className="mt-1.5 block w-fit text-[10px] font-normal">
                        {pointsSupportLabel(v.pointsSupport)}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button size="lg" className="gap-2" asChild>
            <Link href="/calculator">
              Score GSM pathways
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/visas">Full visa directory</Link>
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Family, visitor, and legacy subclasses are on the{" "}
          <Link href="/visas" className="text-primary hover:underline">
            full directory
          </Link>
          . Confirm requirements on{" "}
          <a
            href="https://immi.homeaffairs.gov.au"
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Home Affairs
          </a>
          .
        </p>
      </HomeReveal>
    </section>
  );
}
