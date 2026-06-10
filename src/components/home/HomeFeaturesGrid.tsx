"use client";

import { FileText, Share2, Sparkles, Target } from "lucide-react";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { HomeFeatureCard } from "./HomeFeatureCard";
import { HomeReveal } from "./HomeReveal";

const features = [
  { icon: FileText, title: "Client files", desc: "Store clients and full assessment history in one workspace." },
  { icon: Target, title: "Accurate breakdown", desc: "Schedule 6D logic with employment cap and clear line items." },
  { icon: Sparkles, title: "Pathway suggestions", desc: "See gap-to-target improvements before you lodge an EOI." },
  { icon: Share2, title: "Share & PDF", desc: "Branded share links and print-ready reports on the Professional plan." },
] as const;

export function HomeFeaturesGrid() {
  return (
    <section aria-labelledby="features-heading" className="mx-auto max-w-6xl px-4 py-14 md:py-20">
      <HomeReveal>
        <SectionHeading
          id="features-heading"
          eyebrow="For agents"
          title="Built for registered migration agents"
          description="Depth where it matters — fast estimates, structured data, client-ready output."
        />
      </HomeReveal>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <HomeReveal key={f.title} delayMs={i * 80}>
            <HomeFeatureCard {...f} index={i} />
          </HomeReveal>
        ))}
      </div>
    </section>
  );
}
