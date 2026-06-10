/** Compute share link expiry from org default days (null = no expiry). */
export function computeShareExpiresAt(expiryDays: number | null | undefined): string | null {
  if (!expiryDays || expiryDays < 1) return null;
  const expires = new Date();
  expires.setDate(expires.getDate() + expiryDays);
  return expires.toISOString();
}

export function isShareLinkActive(assessment: {
  share_revoked_at?: string | null;
  share_expires_at?: string | null;
}): { active: boolean; reason?: string } {
  if (assessment.share_revoked_at) {
    return { active: false, reason: "This share link has been revoked." };
  }
  if (assessment.share_expires_at) {
    const expires = new Date(assessment.share_expires_at);
    if (expires.getTime() < Date.now()) {
      return { active: false, reason: "This share link has expired." };
    }
  }
  return { active: true };
}
