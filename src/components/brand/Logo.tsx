import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-9 shrink-0", className)}
      aria-hidden
    >
      <rect width="36" height="36" rx="10" className="fill-primary" />
      <path
        d="M10 24V12h4.2l3.4 7.2L21 12h4.2v12h-3.2v-7.4L18.4 24h-2.8l-3.6-7.4V24H10z"
        className="fill-primary-foreground"
      />
      <circle cx="27" cy="11" r="3" className="fill-sky-300" />
    </svg>
  );
}

export function Logo({
  className,
  showWordmark = true,
  wordmark = "Australia Visa Points",
  compact = false,
}: {
  className?: string;
  showWordmark?: boolean;
  wordmark?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {showWordmark && (
        <span
          className={cn(
            "font-semibold tracking-tight text-foreground font-[family-name:var(--font-dm-sans)]",
            compact ? "text-sm" : "hidden sm:inline"
          )}
        >
          {wordmark}
        </span>
      )}
    </span>
  );
}
