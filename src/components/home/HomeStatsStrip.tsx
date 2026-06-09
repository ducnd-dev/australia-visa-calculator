import { BookOpen, Calculator, Globe2, Shield } from "lucide-react";
import { HomeReveal } from "./HomeReveal";
import { EOI_MINIMUM_POINTS } from "@/lib/visa-rules/sources";
import { getActiveVisaCount } from "@/lib/visa-rules/visa-catalog";

const stats = [
  { icon: Calculator, value: `${EOI_MINIMUM_POINTS}+`, label: "EOI minimum points" },
  { icon: Globe2, value: "189·190·491", label: "GSM scored together" },
  { icon: BookOpen, value: `${getActiveVisaCount()}+`, label: "Visa subclasses listed" },
  { icon: Shield, value: "Schedule 6D", label: "Deterministic engine" },
] as const;

export function HomeStatsStrip() {
  return (
    <section aria-label="Key facts" className="border-y border-border/60 bg-card/50 backdrop-blur-sm">
      <div className="mx-auto grid max-w-6xl gap-px bg-border/60 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <HomeReveal key={s.label} delayMs={i * 50}>
              <div className="flex items-center gap-4 bg-background/80 px-6 py-6 md:px-8">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-sky-400/10 text-primary">
                  <Icon className="size-5" aria-hidden />
                </div>
                <div>
                  <p className="text-lg font-bold tracking-tight text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </HomeReveal>
          );
        })}
      </div>
    </section>
  );
}
