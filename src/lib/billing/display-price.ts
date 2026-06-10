/** Human-readable Professional plan price for marketing and billing UI. */
export function agencyPriceDisplay(): string {
  const fromEnv = process.env.NEXT_PUBLIC_AGENCY_PRICE_DISPLAY?.trim();
  if (fromEnv) return fromEnv;
  return "$49 AUD/month";
}
