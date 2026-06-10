import Link from "next/link";
import { ArrowRight, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Server-rendered hero copy — full SEO/LCP text (not inside WebGL). */
export function HomeHeroContent({ lastUpdated }: { lastUpdated: string }) {
  return (
    <div className="relative max-w-xl lg:max-w-lg">
      <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary backdrop-blur-sm">
        <Calculator className="size-3.5" aria-hidden />
        Schedule 6D · Updated {lastUpdated}
      </p>
      <h1
        id="hero-heading"
        className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-[1.1]"
      >
        Australia skilled migration{" "}
        <span className="bg-gradient-to-r from-primary via-blue-500 to-sky-400 bg-clip-text text-transparent">
          points calculator
        </span>
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
        Estimate GSM points for subclasses 189, 190, and 491. Built for migration agents — fast
        public calculator, saved client assessments, branded share links.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button size="lg" className="gap-2 shadow-lg shadow-primary/20" asChild>
          <Link href="/calculator">
            Start free calculator
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
        <Button size="lg" variant="outline" className="bg-background/60 backdrop-blur-sm" asChild>
          <Link href="/login">Free trial</Link>
        </Button>
      </div>
      <ul className="mt-10 flex flex-wrap gap-4 text-sm">
        {[
          ["65+", "EOI minimum"],
          ["189 · 190 · 491", "GSM scored together"],
          ["Schedule 6D", "points test"],
        ].map(([v, l]) => (
          <li
            key={l}
            className="rounded-xl border border-border/80 bg-card/80 px-4 py-2 backdrop-blur-sm"
          >
            <span className="block font-semibold text-foreground">{v}</span>
            <span className="text-muted-foreground">{l}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
