import { cn } from "@/lib/utils";

export type AdFormat = "banner" | "rectangle" | "sidebar" | "in-article";

const formatClass: Record<AdFormat, string> = {
  banner: "min-h-[90px] w-full",
  rectangle: "min-h-[250px] w-full",
  sidebar: "min-h-[250px] w-full",
  "in-article": "my-8 min-h-[250px] w-full",
};

/** Reserved ad area — empty until AdSense is wired. No visible placeholder text. */
export function AdSlot({
  slot,
  format = "rectangle",
  className,
}: {
  slot: string;
  format?: AdFormat;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      data-ad-slot={slot}
      className={cn(formatClass[format], className)}
    />
  );
}
