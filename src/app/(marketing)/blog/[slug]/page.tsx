import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock } from "lucide-react";
import { BlogArticleBody } from "@/components/blog/BlogArticleBody";
import { BlogTableOfContents } from "@/components/blog/BlogTableOfContents";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent } from "@/components/ui/card";
import { articleJsonLd, breadcrumbJsonLd, buildMetadata, faqJsonLd } from "@/lib/seo";
import { getBlogPost, getBlogPosts, getRelatedPosts } from "@/lib/blog/posts";
import { LAST_UPDATED } from "@/lib/visa-rules/sources";

export function generateStaticParams() {
  return getBlogPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return buildMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${slug}`,
    keywords: post.keywords,
    publishedTime: post.date,
    modifiedTime: post.updatedAt ?? post.date,
    ogType: "article",
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const related = getRelatedPosts(slug);
  const path = `/blog/${slug}`;

  return (
    <>
      <JsonLd
        data={articleJsonLd({
          title: post.title,
          description: post.description,
          path,
          datePublished: post.date,
          dateModified: post.updatedAt,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path },
        ])}
      />
      {post.faq?.length ? <JsonLd data={faqJsonLd(post.faq)} /> : null}
      <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="transition-colors hover:text-primary hover:underline">
                Home
              </Link>
            </li>
            <li aria-hidden className="text-border">
              /
            </li>
            <li>
              <Link href="/blog" className="transition-colors hover:text-primary hover:underline">
                Blog
              </Link>
            </li>
            <li aria-hidden className="text-border">
              /
            </li>
            <li className="truncate font-medium text-foreground">{post.title}</li>
          </ol>
        </nav>

        <article itemScope itemType="https://schema.org/BlogPosting">
          <header className="mb-8">
            <h1
              className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
              itemProp="headline"
            >
              {post.title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground" itemProp="description">
              {post.description}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <time dateTime={post.date} itemProp="datePublished">
                Published {post.date}
              </time>
              {post.updatedAt && (
                <>
                  <span aria-hidden>·</span>
                  <time dateTime={post.updatedAt}>Updated {post.updatedAt}</time>
                </>
              )}
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" aria-hidden />
                {post.readingTimeMinutes} min read
              </span>
            </div>
          </header>

          <BlogTableOfContents sections={post.sections} />
          <BlogArticleBody sections={post.sections} />

          <footer className="mt-12 space-y-8 border-t border-border pt-10">
            <p className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              Estimate only — not migration advice. Schedule 6D rules updated {LAST_UPDATED}. Verify
              on{" "}
              <a
                href="https://immi.homeaffairs.gov.au"
                className="font-medium text-primary hover:underline"
                rel="noopener noreferrer"
              >
                immi.homeaffairs.gov.au
              </a>{" "}
              before lodging.
            </p>

            {post.faq && post.faq.length > 0 && (
              <section aria-labelledby="post-faq">
                <h2 id="post-faq" className="text-xl font-semibold text-foreground">
                  Frequently asked questions
                </h2>
                <dl className="mt-5 space-y-5">
                  {post.faq.map((f) => (
                    <Card key={f.question} className="border-border/80 shadow-sm">
                      <CardContent className="p-5">
                        <dt className="font-medium text-foreground">{f.question}</dt>
                        <dd className="mt-2 leading-relaxed text-muted-foreground">{f.answer}</dd>
                      </CardContent>
                    </Card>
                  ))}
                </dl>
              </section>
            )}

            {related.length > 0 && (
              <section aria-labelledby="related-posts">
                <h2 id="related-posts" className="text-lg font-semibold text-foreground">
                  Related guides
                </h2>
                <ul className="mt-4 space-y-2">
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link
                        href={`/blog/${r.slug}`}
                        className="group flex items-center justify-between rounded-xl border border-border/80 bg-card px-4 py-3 text-sm transition-colors hover:border-primary/30 hover:bg-muted/40"
                      >
                        <span className="font-medium text-foreground group-hover:text-primary">
                          {r.title}
                        </span>
                        <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </footer>
        </article>
      </div>
    </>
  );
}
