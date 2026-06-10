import Link from "next/link";
import { Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type EmptyStateStep = {
  label: string;
  href: string;
  done?: boolean;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  steps,
  children,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  steps?: EmptyStateStep[];
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center",
        className
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-background shadow-sm ring-1 ring-border">
        <Icon className="size-7 text-muted-foreground" aria-hidden />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
      {steps && steps.length > 0 ? (
        <ol className="mt-6 w-full max-w-sm space-y-2 text-left text-sm">
          {steps.map((step) => (
            <li key={step.href}>
              <Link
                href={step.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors",
                  step.done
                    ? "border-emerald-200/80 bg-emerald-50/40 text-muted-foreground line-through dark:border-emerald-900/40"
                    : "border-border bg-card hover:border-primary/30"
                )}
              >
                {step.done ? (
                  <Check className="size-4 shrink-0 text-emerald-600" aria-hidden />
                ) : (
                  <span className="size-4 shrink-0 rounded-full border border-muted-foreground/40" aria-hidden />
                )}
                {step.label}
              </Link>
            </li>
          ))}
        </ol>
      ) : null}
      {children ? <div className="mt-6 flex flex-wrap justify-center gap-2">{children}</div> : null}
    </div>
  );
}
