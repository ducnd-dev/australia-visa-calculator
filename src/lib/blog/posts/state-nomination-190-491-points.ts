import type { BlogPost } from "../types";
import { estimateReadingTime } from "../utils";

const sections: BlogPost["sections"] = [
  {
    type: "p",
    text: "State and territory nomination can add 5 points (Subclass 190) or 15 points (Subclass 491) to your Schedule 6D total. This article explains how nomination interacts with your points claim and what to check before applying to a state.",
  },
  { type: "h2", text: "+5 points for Subclass 190" },
  {
    type: "p",
    text: "When a state or territory nominates you for a 190 visa, five points are added to your assessed Schedule 6D score. You must meet that state's occupation list, often have Australian study or work ties, and agree to live in the nominating state after grant.",
  },
  { type: "h2", text: "+15 points for Subclass 491" },
  {
    type: "p",
    text: "Regional nomination for 491 adds fifteen points. The visa is provisional; you must live and work in a designated regional area. Many applicants use 491 when their independent score is below 189 thresholds but they qualify for regional lists.",
  },
  { type: "h2", text: "Nomination is not automatic" },
  {
    type: "ul",
    items: [
      "Each state publishes skilled occupation lists and intake rounds",
      "Fees, processing times, and evidence requirements vary",
      "Some states prioritise onshore graduates or workers in shortage sectors",
    ],
  },
  {
    type: "cta",
    text: "Calculate with 190 or 491 selected",
    href: "/calculator",
    label: "Points calculator →",
  },
];

export const post: BlogPost = {
  slug: "state-nomination-190-491-points",
  title: "State Nomination Points for 190 and 491 Visas",
  description:
    "How state and territory nomination adds 5 points (190) or 15 points (491) to your Australian skilled migration Schedule 6D score.",
  date: "2026-05-22",
  keywords: ["state nomination points", "190 nomination 5 points", "491 regional 15 points"],
  readingTimeMinutes: estimateReadingTime(sections),
  sections,
  relatedSlugs: ["189-vs-190-vs-491"],
};
