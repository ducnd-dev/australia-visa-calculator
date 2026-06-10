import { z } from "zod";

/** MARN format: optional leading zeros, 6–8 digits (basic check only). */
export const maraNumberSchema = z
  .string()
  .trim()
  .max(20)
  .optional()
  .refine((v) => !v || /^\d{6,8}$/.test(v), {
    message: "MARN should be 6–8 digits",
  });

export const agencyProfileSchema = z.object({
  maraNumber: maraNumberSchema,
  registeredBusinessName: z.string().trim().max(200).optional(),
  phone: z.string().trim().max(40).optional(),
  website: z
    .string()
    .trim()
    .max(200)
    .optional()
    .refine((v) => !v || /^https?:\/\//i.test(v) || /^[\w.-]+\.[a-z]{2,}/i.test(v), {
      message: "Enter a valid website URL",
    }),
  disclaimerFooter: z.string().trim().max(2000).optional(),
  shareLinkExpiryDays: z.coerce.number().int().min(1).max(365).optional().nullable(),
});

export type AgencyProfile = z.infer<typeof agencyProfileSchema>;

export type AgencyProfileDisplay = {
  maraNumber: string | null;
  registeredBusinessName: string | null;
  phone: string | null;
  website: string | null;
  disclaimerFooter: string | null;
};

export const DEFAULT_AGENT_DISCLAIMER =
  "This assessment is an estimate only and is not migration advice. Points are calculated under Schedule 6D — confirm eligibility and scores with official Department of Home Affairs sources before lodging an Expression of Interest.";

export function formatMaraLine(maraNumber: string | null | undefined): string | null {
  if (!maraNumber?.trim()) return null;
  return `Registered Migration Agent MARN ${maraNumber.trim()}`;
}

export function resolveDisclaimerFooter(
  custom: string | null | undefined,
  maraNumber?: string | null
): string {
  if (custom?.trim()) return custom.trim();
  const mara = formatMaraLine(maraNumber);
  if (mara) {
    return `${mara}. ${DEFAULT_AGENT_DISCLAIMER}`;
  }
  return DEFAULT_AGENT_DISCLAIMER;
}

export function normalizeWebsite(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
