import Link from "next/link";
import { PageIntro } from "@/components/layout/PageIntro";
import { Button } from "@/components/ui/button";

export function StaticPage({
  title,
  description,
  children,
  cta,
  wide,
}: {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  cta?: { label: string; href: string };
  wide?: boolean;
}) {
  return (
    <div className={wide ? "mx-auto max-w-6xl px-4 py-10 md:py-14" : "mx-auto max-w-3xl px-4 py-10 md:py-14"}>
      <div className="relative mb-10 overflow-hidden rounded-3xl border border-border/60 bg-card/70 p-8 shadow-sm backdrop-blur-sm md:p-10">
        <div
          className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-12 -left-12 size-40 rounded-full bg-sky-400/10 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <PageIntro title={title} description={description}>
            {cta ? (
              <Button className="mt-4 gap-2 shadow-md shadow-primary/15" asChild>
                <Link href={cta.href}>{cta.label}</Link>
              </Button>
            ) : null}
          </PageIntro>
        </div>
      </div>
      <div className="prose prose-neutral max-w-none prose-headings:scroll-mt-24 prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-li:marker:text-primary/60">
        {children}
      </div>
    </div>
  );
}
