import Link from "next/link";
import { Sparkles } from "lucide-react";
import { isAgencyPlan } from "@/lib/billing/plans";

export function TrialUpgradeBanner({ plan }: { plan: string | null | undefined }) {
  if (isAgencyPlan(plan)) return null;

  return (
    <div className="flex flex-wrap items-start gap-3 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/8 via-primary/5 to-transparent px-4 py-3.5 text-sm">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <Sparkles className="size-4" aria-hidden />
      </div>
      <p className="min-w-0 flex-1 leading-relaxed text-foreground">
        <strong className="font-semibold">Trial workspace.</strong> Upgrade to unlock PDF export,
        branded share links, and higher email limits.{" "}
        <Link href="/app/billing" className="font-medium text-primary hover:underline">
          View billing →
        </Link>
      </p>
    </div>
  );
}
