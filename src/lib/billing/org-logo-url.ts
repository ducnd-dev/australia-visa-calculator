import { r2PublicUrl } from "@/lib/storage/r2";

export function orgLogoPublicUrl(logoPath: string | null | undefined): string | null {
  if (!logoPath) return null;

  const r2Url = r2PublicUrl(logoPath);
  if (r2Url) return r2Url;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!base) return null;
  return `${base}/storage/v1/object/public/org-logos/${logoPath}`;
}
