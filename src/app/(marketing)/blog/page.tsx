import Link from "next/link";
import { Clock } from "lucide-react";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { getBlogPosts } from "@/lib/blog/posts";

const BLOG_DESCRIPTION =
  "SEO-friendly guides on Schedule 6D points for subclasses 189, 190, and 491 — English, age, employment cap, state nomination, and more.";

export const metadata = buildMetadata({
  title: "Australian Visa Points Guides & SkillSelect Tips",
  description: BLOG_DESCRIPTION,
  path: "/blog",
  keywords: [
    "Australia visa points calculator",
    "189 visa points guide",
    "190 visa points",
    "491 regional visa points",
    "skilled migration Australia blog",
  ],
});

export default function BlogPage() {
  const posts = getBlogPosts();

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Migration points guides",
    description: BLOG_DESCRIPTION,
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/blog`,
    hasPart: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/blog/${p.slug}`,
    })),
  };

  return (
    <>
      <JsonLd data={collectionJsonLd} />
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/70 p-8 shadow-sm backdrop-blur-sm md:p-10">
          <div
            className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-primary/15 blur-3xl"
            aria-hidden
          />
          <SectionHeading
            eyebrow="Guides"
            title="Australian visa points guides"
            description={
              <>
                Clear, factual articles on Schedule 6D skilled migration points. Use our{" "}
                <Link href="/calculator" className="font-medium text-primary hover:underline">
                  free calculator
                </Link>{" "}
                for a line-by-line breakdown.
              </>
            }
          />
        </div>
        <ul className="mt-10 grid gap-6 md:grid-cols-2">
          {posts.map((p) => (
            <li key={p.slug}>
              <article>
                <Card className="group h-full overflow-hidden border-border/80 bg-card/90 transition-all hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg">
                  <div className="h-1 bg-gradient-to-r from-primary via-blue-500 to-sky-400 opacity-0 transition-opacity group-hover:opacity-100" />
                  <CardHeader className="gap-3">
                    <CardTitle className="text-lg leading-snug">
                      <Link
                        href={`/blog/${p.slug}`}
                        className="transition-colors hover:text-primary"
                      >
                        {p.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-2 leading-relaxed">
                      {p.description}
                    </CardDescription>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="size-3.5" aria-hidden />
                      <time dateTime={p.date}>{p.date}</time>
                      {p.readingTimeMinutes ? ` · ${p.readingTimeMinutes} min read` : null}
                    </p>
                  </CardHeader>
                </Card>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
