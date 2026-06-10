export function teamInviteSubject(orgName: string): string {
  return `You're invited to join ${orgName} on Australia Visa Points Calculator`;
}

export function teamInviteHtml(params: {
  orgName: string;
  inviterName: string;
  role: string;
  inviteUrl: string;
}): string {
  const { orgName, inviterName, role, inviteUrl } = params;
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Team invite</title></head>
<body style="font-family: system-ui, sans-serif; color: #0f172a; line-height: 1.55; max-width: 560px; margin: 0 auto; padding: 24px;">
  <h1 style="font-size: 20px; margin: 0 0 16px;">Join ${escapeHtml(orgName)}</h1>
  <p>${escapeHtml(inviterName)} invited you as <strong>${escapeHtml(role)}</strong> on the practice workspace.</p>
  <p style="margin: 24px 0;"><a href="${escapeAttr(inviteUrl)}" style="display: inline-block; background: #2563eb; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 500;">Accept invitation</a></p>
  <p style="font-size: 12px; color: #64748b;">This link expires in 14 days. If you did not expect this email, you can ignore it.</p>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/'/g, "&#39;");
}
