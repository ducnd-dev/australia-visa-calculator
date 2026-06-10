import { cn } from "@/lib/utils";

export type AdFormat = "banner" | "rectangle" | "sidebar" | "in-article";

const formatClass: Record<AdFormat, string> = {
  banner: "min-h-[90px] w-full",
  rectangle: "min-h-[250px] w-full",
  sidebar: "min-h-[250px] w-full",
  "in-article": "my-8 min-h-[250px] w-full",
};

function adsEnabled() {
  return Boolean(process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim());
}

/** Reserved ad area — hidden until AdSense client id is configured. */
export function AdSlot({
  slot,
  format = "rectangle",
  className,
}: {
  slot: string;
  format?: AdFormat;
  className?: string;
}) {
  if (!adsEnabled()) return null;

  return (
    <div
      aria-hidden
      data-ad-slot={slot}
      className={cn(formatClass[format], className)}
    />
  );
}
