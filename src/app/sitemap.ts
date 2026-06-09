import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/blog/posts";
import { STATIC_PAGE_PATHS } from "@/lib/static-pages";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const PRIORITY: Record<string, number> = {
  "/": 1,
  "/calculator": 0.95,
  "/for-agents": 0.85,
  "/pricing": 0.8,
  "/blog": 0.75,
  "/faq": 0.7,
};

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = STATIC_PAGE_PATHS.map((p) => ({
    url: `${BASE}${p}`,
    lastModified: new Date(),
    changeFrequency: (p === "/" || p === "/blog" ? "weekly" : "monthly") as "weekly" | "monthly",
    priority: PRIORITY[p] ?? 0.6,
  }));

  const blog = getBlogPosts().map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt ?? post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...blog];
}
