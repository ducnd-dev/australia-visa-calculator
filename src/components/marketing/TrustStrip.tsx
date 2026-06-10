import Link from "next/link";
import { BookOpen, Scale, Shield } from "lucide-react";

const items = [
  {
    icon: Shield,
    title: "Built for registered migration agents",
    description: "Client files, assessments, and professional outputs in one workspace.",
  },
  {
    icon: BookOpen,
    title: "Schedule 6D with citations",
    description: "Deterministic points engine aligned to published GSM rules.",
  },
  {
    icon: Scale,
    title: "Not migration advice",
    description: (
      <>
        Estimates only — verify on{" "}
        <Link href="/sources" className="font-medium text-primary hover:underline">
          official sources
        </Link>{" "}
        before lodging.
      </>
    ),
  },
] as const;

export function TrustStrip() {
  return (
    <section
      aria-label="Trust and compliance"
      className="border-y border-border/60 bg-muted/30 py-10 md:py-12"
    >
      <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-3">
        {items.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
