import type { MetadataRoute } from "next";
import { STATIC_PAGE_PATHS } from "@/lib/static-pages";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Indexable marketing routes */
const PUBLIC = [...STATIC_PAGE_PATHS];

const DISALLOW = ["/app/", "/admin/", "/share/", "/results", "/login", "/unsubscribe/"];

export default function robots(): MetadataRoute.Robots {
  const rules = { allow: PUBLIC, disallow: DISALLOW };
  return {
    rules: [
      { userAgent: "*", ...rules },
      { userAgent: "GPTBot", ...rules },
      { userAgent: "ClaudeBot", ...rules },
      { userAgent: "PerplexityBot", ...rules },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
