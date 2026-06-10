import type { BreakdownLine } from "@/lib/visa-rules/types";
import { cn } from "@/lib/utils";

export function PointsBreakdownChart({
  breakdown,
  className,
}: {
  breakdown: BreakdownLine[];
  className?: string;
}) {
  const sorted = [...breakdown].sort((a, b) => b.points - a.points);
  const max = Math.max(...sorted.map((l) => l.points), 1);

  return (
    <div className={cn("space-y-3", className)} role="img" aria-label="Points breakdown chart">
      {sorted.map((line) => (
        <div key={line.category}>
          <div className="mb-1 flex items-center justify-between gap-2 text-sm">
            <span className="text-foreground">{line.category}</span>
            <span className="shrink-0 font-semibold tabular-nums text-primary">{line.points}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-blue-500 transition-all"
              style={{ width: `${Math.max((line.points / max) * 100, line.points > 0 ? 8 : 0)}%` }}
            />
          </div>
          {line.note ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{line.note}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
