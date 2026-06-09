import type { OrgPlan } from "@/lib/billing/plans";

export function monthlyMarketingLimit(plan: string | null | undefined): number {
  if (plan === "enterprise") return 5000;
  if (plan === "agency") return 500;
  return 50;
}

export function isWithinMarketingLimit(sentThisMonth: number, plan: string | null | undefined): boolean {
  return sentThisMonth < monthlyMarketingLimit(plan);
}
