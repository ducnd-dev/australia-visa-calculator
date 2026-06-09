import { AdSlot } from "./AdSlot";

/** Full-width horizontal ad reserve (e.g. below hero). */
export function AdBanner({ slot, className }: { slot: string; className?: string }) {
  return <AdSlot slot={slot} format="banner" className={className} />;
}
