export type OrgPlan = "trial" | "agency" | "enterprise";

export function isAgencyPlan(plan: string | null | undefined): boolean {
  return plan === "agency" || plan === "enterprise";
}

export function canUseBranding(plan: string | null | undefined): boolean {
  return isAgencyPlan(plan);
}

export function canExportPdf(plan: string | null | undefined): boolean {
  return isAgencyPlan(plan);
}

export function planLabel(plan: string | null | undefined): string {
  switch (plan) {
    case "agency":
      return "Agency";
    case "enterprise":
      return "Enterprise";
    default:
      return "Trial";
  }
}
