import type { BlogPost } from "../types";
import { estimateReadingTime } from "../utils";

const sections: BlogPost["sections"] = [
  {
    type: "p",
    text: "Overseas and Australian skilled employment points are calculated separately under Schedule 6D, then combined with a maximum cap of 20 points total. Many applicants mistakenly assume overseas and Australian years stack without limit.",
  },
  { type: "h2", text: "How the 20-point cap works" },
  {
    type: "p",
    text: "If overseas skilled employment would give 15 points and Australian skilled employment would give 15 points, your combined employment score is capped at 20 — not 30. The cap applies after each stream is scored according to years of experience.",
  },
  { type: "h2", text: "What counts as skilled employment" },
  {
    type: "ul",
    items: [
      "Work in your nominated occupation or closely related field",
      "Paid employment at the required skill level",
      "Minimum hours per week as defined in current rules",
      "Evidence for skills assessment and visa application",
    ],
  },
  { type: "h2", text: "Modelling employment in a calculator" },
  {
    type: "p",
    text: "Use a tool that applies the cap automatically. Enter overseas years and Australian years separately and verify the breakdown line shows the capped employment total.",
  },
  {
    type: "cta",
    text: "Calculate employment points",
    href: "/calculator",
    label: "Employment points calculator →",
  },
];

export const post: BlogPost = {
  slug: "skilled-employment-cap-20-points",
  title: "Skilled Employment Points Cap (20 Points Maximum)",
  description:
    "Schedule 6D overseas and Australian employment points explained, including the combined 20-point cap for skilled migration.",
  date: "2026-06-01",
  keywords: [
    "skilled employment points Australia",
    "20 point cap employment",
    "Australian work experience points",
  ],
  readingTimeMinutes: estimateReadingTime(sections),
  sections,
  relatedSlugs: ["how-to-increase-australia-pr-points"],
};
