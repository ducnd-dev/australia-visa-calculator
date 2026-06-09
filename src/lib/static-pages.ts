/** Public static routes for sitemap, robots, and footer navigation */

export const STATIC_PAGE_PATHS = [
  "/",
  "/calculator",
  "/visas",
  "/blog",
  "/about",
  "/pricing",
  "/faq",
  "/for-agents",
  "/contact",
  "/sources",
  "/disclaimer",
  "/privacy",
  "/terms",
] as const;

export const FOOTER_LINKS = {
  product: [
    { href: "/calculator", label: "Points calculator" },
    { href: "/visas", label: "Visa directory" },
    { href: "/blog", label: "Guides" },
    { href: "/pricing", label: "Pricing" },
    { href: "/for-agents", label: "For migration agents" },
  ],
  company: [
    { href: "/about", label: "About" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
    { href: "/sources", label: "Official sources" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/disclaimer", label: "Disclaimer" },
    { href: "/llms.txt", label: "LLMs" },
  ],
} as const;
