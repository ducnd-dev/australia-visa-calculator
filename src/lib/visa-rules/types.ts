export type VisaSubclass = "189" | "190" | "491";
export type ScoreTier = "below_minimum" | "competitive_band" | "strong";
export interface BreakdownLine { category: string; points: number; note?: string; citation?: string; }
export interface PointsResult { total: number; breakdown: BreakdownLine[]; tier: ScoreTier; tierMessage: string; visaSubclass: VisaSubclass; flags: string[]; }
