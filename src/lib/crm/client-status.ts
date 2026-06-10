export const CLIENT_STATUSES = ["lead", "active", "lodged", "archived"] as const;
export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export function clientStatusLabel(status: string): string {
  switch (status) {
    case "lead":
      return "Lead";
    case "lodged":
      return "Lodged";
    case "archived":
      return "Archived";
    default:
      return "Active";
  }
}

export function clientStatusVariant(
  status: string
): "default" | "secondary" | "success" | "warning" | "outline" {
  switch (status) {
    case "lead":
      return "warning";
    case "lodged":
      return "success";
    case "archived":
      return "secondary";
    default:
      return "default";
  }
}

export function parseClientStatus(value: string | null | undefined): ClientStatus {
  if (value && CLIENT_STATUSES.includes(value as ClientStatus)) return value as ClientStatus;
  return "active";
}
