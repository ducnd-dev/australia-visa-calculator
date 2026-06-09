import type { BlogPost } from "../types";
import { estimateReadingTime } from "../utils";

const sections: BlogPost["sections"] = [
  {
    type: "p",
    text: "Partner status can add 0, 5, or 10 points under Schedule 6D depending on whether your partner is included in the application and meets skills and English criteria. Getting this wrong is a common EOI error.",
  },
  { type: "h2", text: "Single applicant (10 points)" },
  {
    type: "p",
    text: "If you do not include a partner in the application, you may claim points for single status — typically 10 points under current Schedule 6D partner provisions.",
  },
  { type: "h2", text: "Partner with competent English only (5 points)" },
  {
    type: "p",
    text: "If your partner is included but does not have a suitable skills assessment and skilled occupation, you may still claim a lower band when they demonstrate competent English.",
  },
  { type: "h2", text: "Partner skills and English (10 points)" },
  {
    type: "p",
    text: "Maximum partner points usually require your partner to have a positive skills assessment in an eligible occupation and competent English (or higher). Evidence must support the claim at time of invitation.",
  },
  {
    type: "cta",
    text: "Test partner scenarios",
    href: "/calculator",
    label: "Open calculator →",
  },
];

export const post: BlogPost = {
  slug: "partner-skills-points-australia",
  title: "Partner Skills Points for Australian Skilled Visas",
  description:
    "Schedule 6D partner points explained: single, partner English only, and partner skills + English for 189, 190, and 491.",
  date: "2026-05-25",
  keywords: ["partner points Australia visa", "partner skills assessment migration"],
  readingTimeMinutes: estimateReadingTime(sections),
  sections,
  relatedSlugs: ["how-to-increase-australia-pr-points"],
};
