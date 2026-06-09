import type { BlogPost } from "../types";
import { estimateReadingTime } from "../utils";

const sections: BlogPost["sections"] = [
  {
    type: "p",
    text: "Subclasses 189, 190, and 491 are the main skilled migration pathways that use the same Schedule 6D points test — but nomination requirements, where you can live, and invitation dynamics differ. Choosing the right subclass affects both your points total and your strategy.",
  },
  { type: "h2", text: "Subclass 189 — Skilled Independent" },
  {
    type: "p",
    text: "The 189 visa is for workers who are not sponsored by an employer or nominated by a state. You rely on federal invitation rounds in SkillSelect. There is no extra nomination points on top of Schedule 6D — so your age, English, employment, and qualifications must stand alone at competitive levels.",
  },
  { type: "h2", text: "Subclass 190 — State or territory nominated" },
  {
    type: "p",
    text: "The 190 visa requires nomination by an Australian state or territory government. Successful nomination adds 5 points to your Schedule 6D score. You must commit to living in the nominating state for a period after grant. Each state publishes its own occupation lists and nomination criteria.",
  },
  { type: "h2", text: "Subclass 491 — Regional nominated or sponsored" },
  {
    type: "p",
    text: "The 491 is a provisional skilled visa leading toward permanent residence. Nomination by a state or territory government in a designated regional area adds 15 points. You must live and work in a designated regional area. Pathways to permanent 191 visa exist after meeting residence requirements.",
  },
  { type: "h2", text: "Points comparison table" },
  {
    type: "ul",
    items: [
      "189: +0 nomination points — highest federal competition",
      "190: +5 nomination points — state list + commitment",
      "491: +15 nomination points — regional focus + provisional stage",
    ],
  },
  { type: "h2", text: "Which pathway should you model first?" },
  {
    type: "p",
    text: "Run your Schedule 6D breakdown under each subclass in a calculator. Compare totals with and without nomination points, then check state lists and invitation trends for your ANZSCO occupation.",
  },
  {
    type: "cta",
    text: "Compare 189, 190, and 491 points",
    href: "/calculator",
    label: "Open visa points calculator →",
  },
];

const faq = [
  {
    question: "Do 189, 190, and 491 use the same points test?",
    answer: "Yes. All use Schedule 6D; 190 adds 5 nomination points and 491 adds 15 when nominated.",
  },
  {
    question: "Is 491 easier because of extra points?",
    answer: "The +15 points help, but you must meet regional nomination rules and live in a designated regional area.",
  },
];

export const post: BlogPost = {
  slug: "189-vs-190-vs-491",
  title: "189 vs 190 vs 491 Visa: Points and Pathways Compared",
  description:
    "Compare Skilled Independent (189), state nominated (190), and regional (491) visas — nomination points, living requirements, and SkillSelect strategy.",
  date: "2026-05-10",
  updatedAt: "2026-06-01",
  keywords: [
    "189 vs 190 vs 491",
    "190 visa points",
    "491 visa points",
    "state nomination Australia",
    "regional visa Australia",
  ],
  readingTimeMinutes: estimateReadingTime(sections),
  sections,
  faq,
  relatedSlugs: ["how-many-points-for-australian-pr", "state-nomination-190-491-points"],
};
