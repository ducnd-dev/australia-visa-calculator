import { cn } from "@/lib/utils";

/** Shared typography for long-form HTML (static pages, blog, email previews). */
export const proseClassName = cn(
  "prose prose-neutral max-w-none dark:prose-invert",
  "prose-headings:scroll-mt-24 prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground",
  "prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-border/60 prose-h2:pb-3 prose-h2:text-xl md:prose-h2:text-2xl",
  "prose-h2:first:mt-0",
  "prose-h3:mt-7 prose-h3:mb-3 prose-h3:text-lg",
  "prose-p:leading-7 prose-p:text-muted-foreground",
  "prose-li:leading-7 prose-li:text-muted-foreground",
  "prose-strong:font-semibold prose-strong:text-foreground",
  "prose-a:font-medium prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
  "prose-ul:my-5 prose-ol:my-5",
  "prose-li:my-1.5 prose-li:marker:text-primary/50",
  "prose-code:rounded-md prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-medium prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none",
  "prose-em:text-foreground/90",
);
