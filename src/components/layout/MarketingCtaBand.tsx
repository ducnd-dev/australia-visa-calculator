import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MarketingCtaBand() {
  return (
    <section
      aria-labelledby="cta-band-heading"
      className="relative overflow-hidden border-y border-primary/20"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-indigo-700" aria-hidden />
      <div className="marketing-cta-shine absolute inset-0 opacity-40" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 py-14 md:py-16">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/70">
              <Sparkles className="size-3.5" aria-hidden />
              Free · No sign-in required
            </p>
            <h2
              id="cta-band-heading"
              className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl"
            >
              Know your Schedule 6D score in minutes
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/80 md:text-base">
              Score subclasses 189, 190, and 491 together — then share results or save client
              assessments in your practice workspace.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap justify-center gap-3">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 bg-white text-primary shadow-lg hover:bg-white/90"
              asChild
            >
              <Link href="/calculator">
                Open calculator
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              asChild
            >
              <Link href="/login">Free trial</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
