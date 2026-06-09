import type { BlogPost } from "../types";
import { estimateReadingTime } from "../utils";

const sections: BlogPost["sections"] = [
  {
    type: "p",
    text: "For Australian skilled visas, English ability is scored under Schedule 6D using Competent, Proficient, and Superior levels. Both PTE Academic and IELTS (and other approved tests) can qualify — the choice often comes down to test format, booking availability, and how quickly you can reach the next points band.",
  },
  { type: "h2", text: "Competent, Proficient, and Superior" },
  {
    type: "ul",
    items: [
      "Competent English — baseline for some requirements; may score 0 English points in the points test depending on criteria",
      "Proficient English — higher points band; common target for competitive EOIs",
      "Superior English — maximum English points for many applicants",
    ],
  },
  {
    type: "p",
    text: "Always check the current Department of Home Affairs legislative instrument for exact score equivalents across PTE, IELTS, TOEFL iBT, Cambridge C1 Advanced, and OET where applicable to your occupation.",
  },
  { type: "h2", text: "PTE vs IELTS: practical differences" },
  {
    type: "ul",
    items: [
      "PTE: computer-based, AI scoring, results often within 48 hours, integrated speaking into a computer",
      "IELTS: familiar two-module structure (Academic), human speaking examiner option, widely recognised globally",
      "Both: must meet minimum scores in each component (listening, reading, writing, speaking) for your target level",
    ],
  },
  { type: "h2", text: "Which test is better for points?" },
  {
    type: "p",
    text: "Neither test gives more points by name — only the level achieved matters. Pick the test you can prepare for most effectively. Many applicants retake the same test to move from Proficient to Superior for a meaningful points jump.",
  },
  {
    type: "cta",
    text: "Model English points in your total",
    href: "/calculator",
    label: "Calculate points with English bands →",
  },
];

const faq = [
  {
    question: "Does PTE give more points than IELTS?",
    answer: "No. Points depend on the Competent/Proficient/Superior level achieved, not the test brand.",
  },
];

export const post: BlogPost = {
  slug: "pte-vs-ielts-for-australian-migration",
  title: "PTE vs IELTS for Australian Migration Points",
  description:
    "Compare PTE Academic and IELTS for Competent, Proficient, and Superior English under Schedule 6D skilled migration points.",
  date: "2026-05-20",
  updatedAt: "2026-06-01",
  keywords: [
    "PTE vs IELTS Australia migration",
    "English points 189 visa",
    "Proficient English points",
    "Superior English Australia",
  ],
  readingTimeMinutes: estimateReadingTime(sections),
  sections,
  faq,
  relatedSlugs: ["how-to-increase-australia-pr-points"],
};
