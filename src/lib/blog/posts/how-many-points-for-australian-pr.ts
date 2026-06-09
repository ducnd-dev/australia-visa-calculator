import type { BlogPost } from "../types";
import { estimateReadingTime } from "../utils";

const sections: BlogPost["sections"] = [
  {
    type: "p",
    text: "If you are planning skilled migration to Australia, understanding points is the first step. This guide explains the minimum score to lodge an Expression of Interest (EOI), how competitive invitation thresholds differ by visa subclass, and how to estimate your score using Schedule 6D rules.",
  },
  { type: "h2", text: "Minimum 65 points vs competitive scores" },
  {
    type: "p",
    text: "You generally need at least 65 points to submit an EOI in SkillSelect for subclasses 189, 190, and 491. Meeting 65 points does not guarantee an invitation — Department of Home Affairs invitation rounds often select higher scores, especially for Subclass 189 (Skilled Independent).",
  },
  {
    type: "ul",
    items: [
      "Subclass 189: often competitive around 80–85+ points (varies by occupation round)",
      "Subclass 190: state nomination adds 5 points; competitive thresholds often lower than 189",
      "Subclass 491: regional nomination adds 15 points; pathways differ by state or territory",
    ],
  },
  { type: "h2", text: "What counts toward your score" },
  {
    type: "p",
    text: "Skilled migration points under Schedule 6D include age, English language ability, skilled employment (overseas and Australian), qualifications, and other bonuses such as Australian study, partner skills, NAATI/CCL, and Professional Year. Employment points are capped at 20 combined for overseas and Australian experience.",
  },
  { type: "h3", text: "Age and English" },
  {
    type: "p",
    text: "Age points peak between 25 and 32 years. English points require Competent English as a baseline for some visas; Proficient and Superior tests (IELTS, PTE, TOEFL, etc.) attract higher points. Always check the current legislative instrument for accepted tests and scores.",
  },
  { type: "h2", text: "How to estimate your points accurately" },
  {
    type: "p",
    text: "Use a calculator that implements Schedule 6D logic — not a generic spreadsheet. Your estimate should show a line-by-line breakdown so you can verify age bands, employment years, and nomination points for your chosen subclass.",
  },
  {
    type: "cta",
    text: "Try the free points calculator",
    href: "/calculator",
    label: "Calculate your points →",
  },
  { type: "h2", text: "Next steps after estimating" },
  {
    type: "ol",
    items: [
      "Confirm your occupation is on the relevant skilled occupation list",
      "Complete skills assessment with the correct assessing authority",
      "Lodge EOI in SkillSelect with accurate points claim",
      "Wait for invitation or pursue state/territory nomination where eligible",
    ],
  },
  {
    type: "p",
    text: "This article is general information only and not migration advice. Rules change — verify on the Department of Home Affairs website before lodging.",
  },
];

const faq = [
  {
    question: "Is 65 points enough for Australian PR?",
    answer:
      "65 points is the usual minimum to lodge an EOI, but invitation rounds often require higher scores depending on visa subclass and occupation.",
  },
  {
    question: "Which visa needs the highest points?",
    answer:
      "Subclass 189 independent visas typically have the highest competitive invitation scores because there is no state nomination bonus.",
  },
];

export const post: BlogPost = {
  slug: "how-many-points-for-australian-pr",
  title: "How Many Points Do You Need for Australian PR? (2026 Guide)",
  description:
    "Minimum 65 points for SkillSelect EOI explained, plus competitive scores for subclasses 189, 190, and 491 under Schedule 6D.",
  date: "2026-05-01",
  updatedAt: "2026-06-01",
  keywords: [
    "Australia PR points",
    "how many points for Australian PR",
    "minimum points SkillSelect",
    "189 visa points",
    "skilled migration points Australia",
  ],
  readingTimeMinutes: estimateReadingTime(sections),
  sections,
  faq,
  relatedSlugs: ["189-vs-190-vs-491", "how-to-increase-australia-pr-points"],
};
