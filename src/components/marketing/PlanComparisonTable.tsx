import { Check, Minus } from "lucide-react";
import { TRIAL_PLAN_FEATURES, AGENCY_PLAN_FEATURES } from "@/lib/static-content/plans";
import { monthlyAiLimit } from "@/lib/ai/limits";
import { monthlyMarketingLimit } from "@/lib/email/plan-limits";

type Row = { feature: string; trial: boolean | string; pro: boolean | string };

const rows: Row[] = [
  { feature: "Unlimited clients & assessments", trial: true, pro: true },
  { feature: "Share links & transactional email", trial: true, pro: true },
  {
    feature: `AI explanations / month`,
    trial: String(monthlyAiLimit("trial")),
    pro: String(monthlyAiLimit("agency")),
  },
  {
    feature: `Marketing sends / month`,
    trial: String(monthlyMarketingLimit("trial")),
    pro: String(monthlyMarketingLimit("agency")),
  },
  { feature: "PDF export", trial: false, pro: true },
  { feature: "Practice logo on share pages", trial: false, pro: true },
  { feature: "Branded workspace experience", trial: false, pro: true },
];

function Cell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="mx-auto size-4 text-primary" aria-label="Included" />;
  if (value === false) return <Minus className="mx-auto size-4 text-muted-foreground" aria-label="Not included" />;
  return <span className="text-sm font-medium tabular-nums">{value}</span>;
}

export function PlanComparisonTable() {
  return (
    <div className="not-prose overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-sm">
      <table className="w-full min-w-[480px] text-sm">
        <caption className="sr-only">Trial vs Professional plan comparison</caption>
        <thead>
          <tr className="border-b border-border bg-muted/30 text-left">
            <th scope="col" className="px-4 py-3 font-semibold text-foreground">
              Feature
            </th>
            <th scope="col" className="px-4 py-3 text-center font-semibold text-foreground">
              Trial
            </th>
            <th scope="col" className="px-4 py-3 text-center font-semibold text-primary">
              Professional
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.feature} className="border-b border-border/60 last:border-0">
              <td className="px-4 py-3 text-muted-foreground">{row.feature}</td>
              <td className="px-4 py-3 text-center">
                <Cell value={row.trial} />
              </td>
              <td className="px-4 py-3 text-center">
                <Cell value={row.pro} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="grid gap-4 border-t border-border/60 bg-muted/20 p-4 text-xs text-muted-foreground md:grid-cols-2">
        <div>
          <p className="font-semibold text-foreground">Trial includes</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            {TRIAL_PLAN_FEATURES.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-foreground">Professional adds</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            {AGENCY_PLAN_FEATURES.filter((f) => f !== "Everything in trial").map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
