import type { VisaSubclass } from "../types";
export const DEFAULT_COMPETITIVE: Record<VisaSubclass, number> = { "189": 85, "190": 75, "491": 70 };
export type SuggestionTarget = { kind: "minimum" } | { kind: "competitive"; visa: VisaSubclass } | { kind: "custom"; points: number };
export function resolveTargetPoints(target: SuggestionTarget): number {
  if (target.kind === "minimum") return 65;
  if (target.kind === "custom") return target.points;
  return DEFAULT_COMPETITIVE[target.visa];
}
