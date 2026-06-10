import { monthlyAiLimit } from "@/lib/ai/limits";
import { monthlyMarketingLimit } from "@/lib/email/plan-limits";
import { DEFAULT_COMPETITIVE } from "@/lib/visa-rules/gsm/competitive-targets";
import { EOI_MINIMUM_POINTS, LAST_UPDATED } from "@/lib/visa-rules/sources";

const trialMarketing = monthlyMarketingLimit("trial");
const agencyMarketing = monthlyMarketingLimit("agency");
const trialAi = monthlyAiLimit("trial");
const agencyAi = monthlyAiLimit("agency");

export type FaqItem = { question: string; answer: string };

export const SITE_FAQS: FaqItem[] = [
  {
    question: "Is this official Department of Home Affairs advice?",
    answer:
      "No. This is an independent Schedule 6D points estimator. It is not affiliated with the Department of Home Affairs. Always verify requirements on immi.homeaffairs.gov.au and speak with a registered migration agent before lodging an Expression of Interest or visa application.",
  },
  {
    question: "What is the minimum points score for SkillSelect?",
    answer: `You generally need at least ${EOI_MINIMUM_POINTS} points to lodge an Expression of Interest (EOI) for subclasses 189, 190, or 491. Meeting the minimum does not guarantee an invitation — competitive scores vary by occupation, visa subclass, and invitation round.`,
  },
  {
    question: "What scores are competitive for 189, 190, and 491?",
    answer: `Invitation thresholds change each round. As a planning guide only, many agents use indicative targets around ${DEFAULT_COMPETITIVE["189"]} points for subclass 189, ${DEFAULT_COMPETITIVE["190"]} for 190 (including state nomination), and ${DEFAULT_COMPETITIVE["491"]} for 491 (including regional nomination). Your calculator results include pathway comparisons and gap-to-target suggestions — these are estimates, not predictions of future rounds.`,
  },
  {
    question: "Does one assessment cover 189, 190, and 491?",
    answer:
      "Yes. You enter your details once. The engine applies Schedule 6D and shows scores for all three GSM subclasses together — base points for 189, plus nomination points for 190 (+5) and 491 (+15) where applicable.",
  },
  {
    question: "Which visas are in the directory but not scored here?",
    answer:
      "Our visa directory lists common subclasses including employer-sponsored (186, 482, 494), graduate (485), Global Talent (858), business and investor visas, study visas, partner visas, and visitors. Only subclasses 189, 190, and 491 use the Schedule 6D points test in this calculator.",
  },
  {
    question: "How is skilled employment points capped?",
    answer:
      "Overseas and Australian skilled employment are assessed separately under Schedule 6D, then combined with a maximum of 20 points in total. The calculator applies this cap automatically.",
  },
  {
    question: "Does AI calculate my points?",
    answer:
      "No. Points are calculated only by our deterministic rules engine with automated tests. On agency plans, AI may generate a plain-English explanation of an already-calculated result — it never changes the score.",
  },
  {
    question: "Can migration agents save client assessments?",
    answer:
      "Yes. Agency workspaces let you store client profiles, run and save Schedule 6D assessments, generate share links, and email assessment reports. PDF export and logo branding on share pages require the paid Agency plan.",
  },
  {
    question: "What is included in the agency trial?",
    answer: `Trial workspaces include unlimited clients and saved assessments, generic (non-branded) share links, transactional assessment emails, up to ${trialMarketing} marketing sends per month, and up to ${trialAi} AI explanations per month. Upgrade to Agency for PDF export, branded share links, and higher limits (${agencyMarketing} marketing sends, ${agencyAi} AI explanations per month).`,
  },
  {
    question: "Are share links private?",
    answer:
      "Anyone with a share link can view that assessment summary while the link is active. Links are unlisted (not indexed for search) but not password-protected. Agencies can revoke links, generate new ones, and optionally set an expiry period in Settings. Do not share links publicly if the results are sensitive. Agency-branded share pages show your logo only on the paid Agency plan.",
  },
  {
    question: "How often are the rules updated?",
    answer: `We publish a rules version and last-reviewed date (${LAST_UPDATED}). Legislation and policy can change without notice — confirm the current Schedule 6D and invitation criteria before lodging.`,
  },
  {
    question: "Can multiple agents share one agency workspace?",
    answer:
      "Yes. Workspace admins can invite team members from Settings → Team. Agents sign in with their own accounts and share the same clients and assessments. Admins manage billing, branding, and email settings; agents run assessments and manage client files.",
  },
  {
    question: "How do I archive a client?",
    answer:
      "Open the client → Edit → Archive client. Archived clients are hidden from the active list and excluded from marketing segments, but saved assessments are kept. Restore anytime from the same screen or find them under Clients → Archived.",
  },
  {
    question: "Can I compare two assessments for the same client?",
    answer:
      "Yes. On the client detail page, select two assessments in the compare picker to see point deltas, changed answers, and breakdown differences — useful when English scores or employment history change between runs.",
  },
];

/** Subset for homepage accordion + JSON-LD */
export const HOMEPAGE_FAQS: FaqItem[] = SITE_FAQS.slice(0, 3);
