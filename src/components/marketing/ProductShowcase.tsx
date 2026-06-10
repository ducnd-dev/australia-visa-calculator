import Image from "next/image";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { HomeReveal } from "@/components/home/HomeReveal";
import { cn } from "@/lib/utils";

export type ShowcasePanel = {
  step: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
};

const DEFAULT_PANELS: ShowcasePanel[] = [
  {
    step: "01",
    title: "Manage clients",
    description: "Profiles, ANZSCO occupation, status tags, and search — your practice CRM.",
    image: "/marketing/dashboard.svg",
    imageAlt: "Practice dashboard with client list and stats",
  },
  {
    step: "02",
    title: "Run assessments",
    description: "Same Schedule 6D wizard as the public calculator, saved to each client file.",
    image: "/marketing/assessment.svg",
    imageAlt: "Assessment results with points breakdown and pathway scores",
  },
  {
    step: "03",
    title: "Deliver professionally",
    description: "Share links, email reports, and PDF export on the Professional plan.",
    image: "/marketing/share.svg",
    imageAlt: "Branded share page and report delivery options",
  },
];

export function ProductShowcase({
  panels = DEFAULT_PANELS,
  eyebrow = "Product",
  title = "From intake to client delivery",
  description = "See how migration agents run consultations with accurate points estimates and polished outputs.",
  className,
}: {
  panels?: ShowcasePanel[];
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <section className={cn("py-14 md:py-20", className)} aria-labelledby="showcase-heading">
      <div className="mx-auto max-w-6xl px-4">
        <HomeReveal>
          <SectionHeading
            id="showcase-heading"
            eyebrow={eyebrow}
            title={title}
            description={description}
            align="center"
          />
        </HomeReveal>
        <div className="mt-12 grid gap-10 lg:grid-cols-3">
          {panels.map((panel, i) => (
            <HomeReveal key={panel.step} delayMs={i * 80}>
              <article className="flex h-full flex-col">
                <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-md ring-1 ring-border/40">
                  <div className="flex items-center gap-1.5 border-b border-border/60 bg-muted/50 px-3 py-2">
                    <span className="size-2 rounded-full bg-red-400/80" aria-hidden />
                    <span className="size-2 rounded-full bg-amber-400/80" aria-hidden />
                    <span className="size-2 rounded-full bg-emerald-400/80" aria-hidden />
                  </div>
                  <div className="relative aspect-[4/3] bg-muted/20">
                    <Image
                      src={panel.image}
                      alt={panel.imageAlt}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  </div>
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-primary">
                  Step {panel.step}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-foreground font-[family-name:var(--font-dm-sans)]">
                  {panel.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{panel.description}</p>
              </article>
            </HomeReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
