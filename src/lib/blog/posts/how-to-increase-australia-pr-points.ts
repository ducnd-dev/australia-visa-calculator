import type { BlogPost } from "../types";
import { estimateReadingTime } from "../utils";

const sections: BlogPost["sections"] = [
  {
    type: "p",
    text: "If your Schedule 6D total is below a competitive invitation level, you can often improve your score through English tests, skilled employment, qualifications, partner skills, and strategic visa subclass selection. This guide lists realistic levers — in order of impact for many applicants.",
  },
  { type: "h2", text: "Improve English language points" },
  {
    type: "p",
    text: "Moving from Competent to Proficient or Superior English is one of the fastest gains. PTE and IELTS are widely used; scores must match the current legislative instrument. Superior English can add substantially more than Competent alone.",
  },
  { type: "h2", text: "Maximise skilled employment points" },
  {
    type: "p",
    text: "Overseas and Australian skilled employment are capped at 20 points combined. Ensure your experience matches your nominated occupation and falls within accepted year bands (e.g. 3, 5, 8+ years). Document dates carefully for skills assessment and EOI.",
  },
  { type: "h2", text: "Qualifications and study bonuses" },
  {
    type: "ul",
    items: [
      "Doctorate, bachelor, diploma — only the highest qualification band applies",
      "Australian study requirement (+5) if eligible",
      "Regional study (+5) for qualifying courses in regional Australia",
      "Specialist education qualifications in STEM or ICT where applicable",
    ],
  },
  { type: "h2", text: "Partner, NAATI, and Professional Year" },
  {
    type: "p",
    text: "A skilled partner with competent English can add up to 10 points; partner with English only adds 5. NAATI/CCL community language tests can add 5 points. An Australian Professional Year in a qualifying discipline can add 5 points.",
  },
  { type: "h2", text: "Pathway strategy: 190 and 491 nomination" },
  {
    type: "p",
    text: "If your independent score is short, state nomination (190, +5) or regional nomination (491, +15) may close the gap. Research occupation demand in each state before committing — nomination is competitive and occupation-specific.",
  },
  {
    type: "cta",
    text: "See personalised pathway suggestions",
    href: "/calculator",
    label: "Run points calculator with suggestions →",
  },
];

export const post: BlogPost = {
  slug: "how-to-increase-australia-pr-points",
  title: "How to Increase Your Australia PR Points (Schedule 6D)",
  description:
    "Practical ways to boost skilled migration points: English, employment cap, qualifications, partner skills, NAATI, and 190/491 nomination.",
  date: "2026-05-15",
  updatedAt: "2026-06-01",
  keywords: [
    "increase Australia PR points",
    "boost skilled migration points",
    "English points Australia visa",
    "NAATI points migration",
  ],
  readingTimeMinutes: estimateReadingTime(sections),
  sections,
  relatedSlugs: ["pte-vs-ielts-for-australian-migration", "partner-skills-points-australia"],
};
