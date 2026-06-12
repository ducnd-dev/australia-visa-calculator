# Blog SEO — cấu trúc & thêm bài mới

## Đã có sẵn

- **8 bài** trong `src/lib/blog/posts/*.ts`
- Mỗi bài: title, meta description, keywords, H2/H3, FAQ (tuỳ chọn), CTA → `/calculator`
- Schema: `BlogPosting`, `BreadcrumbList`, `FAQPage`, `CollectionPage` (listing)
- Sitemap + `generateStaticParams` tự động
- Table of contents, reading time, related posts

## Thêm bài mới

1. Tạo file `src/lib/blog/posts/your-slug.ts`:

```ts
import type { BlogPost } from "../types";
import { estimateReadingTime } from "../utils";

const sections: BlogPost["sections"] = [
  { type: "p", text: "Intro paragraph with primary keyword..." },
  { type: "h2", text: "Main section" },
  { type: "p", text: "..." },
  { type: "cta", text: "Calculate points", href: "/calculator", label: "Try calculator →" },
];

export const post: BlogPost = {
  slug: "your-slug",
  title: "Title Under 60 Characters",
  description: "Meta description 50–160 chars with keyword.",
  date: "2026-06-15",
  keywords: ["keyword 1", "keyword 2"],
  readingTimeMinutes: estimateReadingTime(sections),
  sections,
  relatedSlugs: ["how-many-points-for-australian-pr"],
};
```

2. Import trong `src/lib/blog/posts/index.ts` và thêm vào mảng `allPosts`.

3. Chạy:

```bash
npm run blog:validate
npm run build
```

## Checklist SEO mỗi bài

- [ ] Title ≤ 60 ký tự, có keyword chính
- [ ] Meta description 50–160 ký tự
- [ ] Ít nhất 2× `h2`, có `h3` nếu dài
- [ ] 1 CTA nội bộ → `/calculator` hoặc `/login`
- [ ] FAQ 2–3 câu (nếu phù hợp featured snippet)
- [ ] `relatedSlugs` 2–3 bài liên quan
- [ ] Disclaimer “not migration advice”

## Lệnh

| Lệnh | Mô tả |
|------|--------|
| `npm run blog:validate` | Kiểm tra slug, title, description, h2 |
