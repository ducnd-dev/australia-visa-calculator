import type { BlogPost } from "../types";
import { estimateReadingTime } from "../utils";

const sections: BlogPost["sections"] = [
  {
    type: "p",
    text: "Age is one of the largest Schedule 6D components. Points are based on your age at time of invitation — not at EOI lodgement — so timing matters when you are near a band boundary.",
  },
  { type: "h2", text: "Age points bands (overview)" },
  {
    type: "ul",
    items: [
      "18–24: lower band",
      "25–32: typically maximum age points",
      "33–39: reduced points",
      "40–44: further reduction",
      "45+: usually zero age points and may affect visa eligibility",
    ],
  },
  {
    type: "p",
    text: "Confirm exact points in the current Schedule 6D and legislative instruments. A calculator should map your date of birth to the correct band automatically.",
  },
  { type: "h2", text: "Planning around a birthday" },
  {
    type: "p",
    text: "If you will move to a lower age band soon, invitation timing can change your total by 10–15 points. Migration agents often model best-case and worst-case invitation dates with clients.",
  },
  {
    type: "cta",
    text: "Check your age band",
    href: "/calculator",
    label: "Calculate age points →",
  },
];

export const post: BlogPost = {
  slug: "age-points-skilled-migration",
  title: "Age Points for Australian Skilled Migration",
  description:
    "How Schedule 6D age bands affect your 189, 190, and 491 points score — and why invitation timing matters.",
  date: "2026-05-28",
  keywords: ["age points Australia visa", "25-32 points migration", "age limit skilled visa"],
  readingTimeMinutes: estimateReadingTime(sections),
  sections,
  relatedSlugs: ["how-many-points-for-australian-pr"],
};
