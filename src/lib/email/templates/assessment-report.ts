import { formatMaraLine } from "@/lib/billing/agency-profile";

export function assessmentReportHtml(params: {
  agencyName: string;
  clientName: string;
  totalPoints: number;
  visaSubclass: string;
  shareUrl: string;
  disclaimer: string;
  logoUrl?: string | null;
  maraNumber?: string | null;
  pathwaySummary?: string | null;
  phone?: string | null;
  website?: string | null;
  customIntro?: string | null;
}): string {
  const {
    agencyName,
    clientName,
    totalPoints,
    visaSubclass,
    shareUrl,
    disclaimer,
    logoUrl,
    maraNumber,
    pathwaySummary,
    phone,
    website,
    customIntro,
  } = params;

  const maraLine = formatMaraLine(maraNumber);
  const contactParts = [phone, website?.replace(/^https?:\/\//i, "")].filter(Boolean);

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Points assessment</title></head>
<body style="font-family: system-ui, -apple-system, sans-serif; color: #0f172a; line-height: 1.55; max-width: 560px; margin: 0 auto; padding: 24px;">
  ${logoUrl ? `<p style="margin: 0 0 16px;"><img src="${escapeAttr(logoUrl)}" alt="" style="max-height: 48px; width: auto;" /></p>` : ""}
  <p style="color: #64748b; font-size: 14px; margin: 0 0 4px;">${escapeHtml(agencyName)}</p>
  ${maraLine ? `<p style="color: #64748b; font-size: 12px; margin: 0 0 16px;">${escapeHtml(maraLine)}</p>` : ""}
  <h1 style="font-size: 20px; margin: 0 0 16px; font-weight: 600;">Your points assessment summary</h1>
  <p style="margin: 0 0 12px;">Hi ${escapeHtml(clientName)},</p>
  ${customIntro ? `<p style="margin: 0 0 16px;">${escapeHtml(customIntro)}</p>` : `<p style="margin: 0 0 16px;">Your migration agent has shared an estimate of your skilled migration points under Schedule 6D:</p>`}
  <p style="font-size: 24px; font-weight: 600; margin: 16px 0; color: #1e40af;"><strong>${totalPoints} points</strong> · Subclass ${visaSubclass}</p>
  ${pathwaySummary ? `<p style="font-size: 14px; color: #475569; margin: 0 0 16px;">${escapeHtml(pathwaySummary)}</p>` : ""}
  <p style="margin: 20px 0;"><a href="${escapeAttr(shareUrl)}" style="display: inline-block; background: #2563eb; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 500;">View full breakdown</a></p>
  ${contactParts.length ? `<p style="font-size: 13px; color: #64748b; margin: 24px 0 0;">Contact: ${escapeHtml(contactParts.join(" · "))}</p>` : ""}
  <p style="font-size: 12px; color: #64748b; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px;">${escapeHtml(disclaimer)}</p>
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

export function assessmentReportSubject(clientName: string, totalPoints: number): string {
  return `Points assessment: ${totalPoints} points — ${clientName}`;
}
