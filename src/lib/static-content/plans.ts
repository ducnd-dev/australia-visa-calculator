import { monthlyAiLimit } from "@/lib/ai/limits";
import { monthlyMarketingLimit } from "@/lib/email/plan-limits";

export const PUBLIC_PLAN_FEATURES = [
  "Schedule 6D calculator for subclasses 189, 190, and 491",
  "Side-by-side pathway scores from one assessment",
  "Gap-to-target suggestions and shareable results page",
  "Migration points guides and visa directory",
] as const;

export const TRIAL_PLAN_FEATURES = [
  "Unlimited client profiles and saved assessments",
  "Generic client share links and transactional email reports",
  `Marketing campaigns (up to ${monthlyMarketingLimit("trial")}/month)`,
  `AI explanations (up to ${monthlyAiLimit("trial")}/month; points never recalculated)`,
] as const;

export const AGENCY_PLAN_FEATURES = [
  "Everything in trial",
  "PDF export and agency logo on share pages",
  "Branded agency workspace experience",
  `Higher limits: ${monthlyMarketingLimit("agency")} marketing sends and ${monthlyAiLimit("agency")} AI explanations per month`,
] as const;
