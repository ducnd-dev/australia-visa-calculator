import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HomeFeaturesGrid } from "@/components/home/HomeFeaturesGrid";
import { HomeStatsStrip } from "@/components/home/HomeStatsStrip";
import { VisaPathwaysStrip } from "@/components/home/VisaPathwaysStrip";
import { AdBanner } from "@/components/ads/AdBanner";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeReveal } from "@/components/home/HomeReveal";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqJsonLd, buildMetadata } from "@/lib/seo";
import { LAST_UPDATED } from "@/lib/visa-rules/sources";
import { getBlogPosts } from "@/lib/blog/posts";
import { HOMEPAGE_FAQS } from "@/lib/static-content/faqs";

export const metadata = buildMetadata({
  title: "Australia Visa Points Calculator for Migration Agents",
  description:
    "Schedule 6D points for GSM 189, 190, 491. Visa directory for 35+ Australian subclasses. Save client reports and share results.",
  path: "/",
});

export default function HomePage() {
  const posts = getBlogPosts().slice(0, 3);
  return (
    <>
      <JsonLd data={faqJsonLd(HOMEPAGE_FAQS)} />
      <HomeHero lastUpdated={LAST_UPDATED} />

      <HomeStatsStrip />

      <div className="mx-auto max-w-6xl px-4">
        <AdBanner slot="home-below-hero" />
      </div>

      <HomeFeaturesGrid />

      <VisaPathwaysStrip />

      <section
        aria-labelledby="faq-heading"
        className="relative overflow-hidden border-y border-border/60 bg-gradient-to-b from-violet-500/5 via-background to-sky-500/5 py-14 md:py-20"
      >
        <div
          className="pointer-events-none absolute right-0 top-0 size-64 rounded-full bg-violet-400/10 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-4">
          <HomeReveal>
            <SectionHeading
              id="faq-heading"
              eyebrow="FAQ"
              title="Frequently asked questions"
              align="center"
            />
          </HomeReveal>
          <div className="mt-8 space-y-3">
            {HOMEPAGE_FAQS.map((f, i) => (
              <HomeReveal key={f.question} delayMs={i * 60}>
                <Card className="overflow-hidden border-border/80 bg-card/90 shadow-sm backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-md">
                  <details className="group">
                    <summary className="cursor-pointer list-none px-5 py-4 font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                      <span className="flex items-center justify-between gap-3">
                        {f.question}
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm text-primary transition-transform duration-300 group-open:rotate-180">
                          ▼
                        </span>
                      </span>
                    </summary>
                    <CardContent className="border-t border-border/60 pb-5 text-muted-foreground leading-relaxed">
                      {f.answer}
                    </CardContent>
                  </details>
                </Card>
              </HomeReveal>
            ))}
          </div>
          <HomeReveal delayMs={200}>
            <p className="mt-8 text-center text-sm text-muted-foreground">
              <Link href="/faq" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
                View all FAQs
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </p>
          </HomeReveal>
        </div>
      </section>

      <section aria-labelledby="blog-heading" className="py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <HomeReveal className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              id="blog-heading"
              eyebrow="Guides"
              title="Latest migration points guides"
              description="Practical articles on English bands, employment caps, state nomination, and more."
            />
            <Button variant="outline" className="gap-1 shrink-0" asChild>
              <Link href="/blog">
                All articles
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </HomeReveal>
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {posts.map((p, i) => (
              <HomeReveal key={p.slug} delayMs={i * 100}>
                <li>
                  <Card className="group h-full overflow-hidden border-border/80 bg-card/90 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg">
                    <div className="h-1 bg-gradient-to-r from-primary via-blue-500 to-sky-400 opacity-0 transition-opacity group-hover:opacity-100" />
                    <CardHeader>
                      <CardTitle className="text-base leading-snug">
                        <Link href={`/blog/${p.slug}`} className="hover:text-primary">
                          {p.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="line-clamp-3 leading-relaxed">
                        {p.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </li>
              </HomeReveal>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
