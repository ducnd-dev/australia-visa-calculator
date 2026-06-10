import { randomBytes } from "crypto";

export const INVITE_EXPIRY_DAYS = 14;

export function generateInviteToken(): string {
  return randomBytes(24).toString("hex");
}

export function inviteExpiresAt(): string {
  const d = new Date();
  d.setDate(d.getDate() + INVITE_EXPIRY_DAYS);
  return d.toISOString();
}

export function normalizeInviteEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isInviteValid(invite: {
  accepted_at: string | null;
  expires_at: string;
}): boolean {
  if (invite.accepted_at) return false;
  return new Date(invite.expires_at).getTime() > Date.now();
}

export type InviteAcceptError =
  | "invalid"
  | "wrong_email"
  | "cross_org";

/** Pure validation for accept-invite — used by server action and tests. */
export function validateInviteAccept(input: {
  inviteValid: boolean;
  userEmail: string | null | undefined;
  inviteEmail: string;
  existingOrgId: string | null | undefined;
  inviteOrgId: string;
}): InviteAcceptError | null {
  if (!input.inviteValid) return "invalid";
  const email = input.userEmail?.trim().toLowerCase();
  if (email && email !== normalizeInviteEmail(input.inviteEmail)) return "wrong_email";
  if (input.existingOrgId && input.existingOrgId !== input.inviteOrgId) return "cross_org";
  return null;
}
