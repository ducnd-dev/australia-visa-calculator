import Link from "next/link";
import { Fragment } from "react";
import { AdSlot } from "@/components/ads/AdSlot";
import type { BlogSection } from "@/lib/blog/types";
import { slugifyHeading } from "@/lib/blog/utils";
import { cn } from "@/lib/utils";
import { proseClassName } from "@/lib/ui/prose";

function renderSection(section: BlogSection) {
  switch (section.type) {
    case "p":
      return <p>{section.text}</p>;
    case "h2": {
      const id = section.id ?? slugifyHeading(section.text);
      return (
        <h2 id={id} className="scroll-mt-20">
          {section.text}
        </h2>
      );
    }
    case "h3": {
      const id = section.id ?? slugifyHeading(section.text);
      return (
        <h3 id={id} className="scroll-mt-20">
          {section.text}
        </h3>
      );
    }
    case "ul":
      return (
        <ul>
          {section.items.map((item, j) => (
            <li key={j}>{item}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol>
          {section.items.map((item, j) => (
            <li key={j}>{item}</li>
          ))}
        </ol>
      );
    case "cta":
      return (
        <p className="not-prose">
          <Link
            href={section.href}
            className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {section.label ?? section.text}
          </Link>
        </p>
      );
    default:
      return null;
  }
}

export function BlogArticleBody({ sections }: { sections: BlogSection[] }) {
  const adAfter = Math.max(1, Math.floor(sections.length / 2));

  return (
    <div className={cn(proseClassName, "mt-8")}>
      {sections.map((section, i) => (
        <Fragment key={i}>
          {renderSection(section)}
          {i === adAfter - 1 && <AdSlot slot="blog-in-article" format="in-article" />}
        </Fragment>
      ))}
    </div>
  );
}
