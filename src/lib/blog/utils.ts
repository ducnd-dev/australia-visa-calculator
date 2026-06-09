import type { BlogSection } from "./types";

export function estimateReadingTime(sections: BlogSection[]): number {
  const text = sections
    .map((s) => {
      if (s.type === "p" || s.type === "h2" || s.type === "h3") return s.text;
      if (s.type === "ul" || s.type === "ol") return s.items.join(" ");
      return "";
    })
    .join(" ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
