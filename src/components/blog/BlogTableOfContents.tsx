import type { BlogSection } from "@/lib/blog/types";
import { slugifyHeading } from "@/lib/blog/utils";
import { List } from "lucide-react";

export function BlogTableOfContents({ sections }: { sections: BlogSection[] }) {
  const headings = sections.filter((s) => s.type === "h2") as Extract<BlogSection, { type: "h2" }>[];
  if (headings.length < 2) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="mb-8 rounded-2xl border border-border/80 bg-muted/30 p-5 text-sm shadow-sm"
    >
      <p className="flex items-center gap-2 font-medium text-foreground">
        <List className="size-4 text-primary" aria-hidden />
        On this page
      </p>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-muted-foreground">
        {headings.map((h) => {
          const id = h.id ?? slugifyHeading(h.text);
          return (
            <li key={id}>
              <a href={`#${id}`} className="transition-colors hover:text-primary hover:underline">
                {h.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
