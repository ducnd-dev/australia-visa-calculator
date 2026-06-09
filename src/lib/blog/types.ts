export type BlogSection =
  | { type: "p"; text: string }
  | { type: "h2"; id?: string; text: string }
  | { type: "h3"; id?: string; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "cta"; text: string; href: string; label?: string };

export type BlogFaq = { question: string; answer: string };

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updatedAt?: string;
  keywords: string[];
  readingTimeMinutes: number;
  sections: BlogSection[];
  faq?: BlogFaq[];
  relatedSlugs?: string[];
};
