export type AttentionPriority = "high" | "medium" | "low";

export type AttentionItemType =
  | "no_assessment"
  | "stale_assessment"
  | "low_points"
  | "failed_email"
  | "share_expiring"
  | "missing_email"
  | "no_anzsco";

export type AttentionItem = {
  itemType: AttentionItemType;
  priority: AttentionPriority;
  clientId: string;
  clientName: string;
  assessmentId: string | null;
  message: string;
  href: string;
};

export function attentionItemHref(
  clientId: string,
  assessmentId: string | null,
  itemType: AttentionItemType
): string {
  if (itemType === "no_assessment" || itemType === "no_anzsco" || itemType === "missing_email") {
    return `/app/clients/${clientId}`;
  }
  if (assessmentId) return `/app/assessments/${assessmentId}`;
  return `/app/clients/${clientId}`;
}

export function priorityLabel(priority: AttentionPriority): string {
  switch (priority) {
    case "high":
      return "High";
    case "medium":
      return "Medium";
    default:
      return "Low";
  }
}
