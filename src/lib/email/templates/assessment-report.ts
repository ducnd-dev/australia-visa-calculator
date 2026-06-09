export function assessmentReportHtml(params: {
  agencyName: string;
  clientName: string;
  totalPoints: number;
  visaSubclass: string;
  shareUrl: string;
  disclaimer: string;
}): string {
  const { agencyName, clientName, totalPoints, visaSubclass, shareUrl, disclaimer } = params;
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Points assessment</title></head>
<body style="font-family: system-ui, sans-serif; color: #0f172a; line-height: 1.5; max-width: 560px; margin: 0 auto; padding: 24px;">
  <p style="color: #64748b; font-size: 14px;">${agencyName}</p>
  <h1 style="font-size: 20px; margin: 0 0 16px;">Your points assessment summary</h1>
  <p>Hi ${escapeHtml(clientName)},</p>
  <p>Your migration agent has shared an estimate of your skilled migration points:</p>
  <p style="font-size: 24px; font-weight: 600; margin: 16px 0;"><strong>${totalPoints} points</strong> · Subclass ${visaSubclass}</p>
  <p><a href="${shareUrl}" style="display: inline-block; background: #2563eb; color: #fff; text-decoration: none; padding: 10px 18px; border-radius: 8px;">View full breakdown</a></p>
  <p style="font-size: 12px; color: #64748b; margin-top: 32px;">${escapeHtml(disclaimer)}</p>
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

export function assessmentReportSubject(clientName: string, totalPoints: number): string {
  return `Points assessment: ${totalPoints} points — ${clientName}`;
}
