import { cn } from "@/lib/utils";

export function clientInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function ClientAvatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClass =
    size === "sm" ? "size-9 text-xs" : size === "lg" ? "size-14 text-lg" : "size-11 text-sm";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 font-semibold text-primary ring-1 ring-primary/15",
        sizeClass,
        className
      )}
      aria-hidden
    >
      {clientInitials(name)}
    </div>
  );
}
