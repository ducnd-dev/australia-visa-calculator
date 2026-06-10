import type { CalculatorAnswers } from "./calculator-schema";
import type { PointsResult } from "../types";
import { calculatePoints } from "./calculate-points";
import {
  ANSWER_FIELD_LABELS,
  answerChangePointsDelta,
  formatAnswerLabel,
} from "./answer-labels";

export type AnswerChange = {
  field: keyof CalculatorAnswers;
  label: string;
  before: string;
  after: string;
  pointsDelta: number | null;
};

export type BreakdownChange = {
  category: string;
  before: number;
  after: number;
  delta: number;
};

export type AssessmentCompareResult = {
  beforeId: string;
  afterId: string;
  beforeTotal: number;
  afterTotal: number;
  totalDelta: number;
  beforeDate: string;
  afterDate: string;
  answerChanges: AnswerChange[];
  breakdownChanges: BreakdownChange[];
};

export function compareAssessments(input: {
  beforeId: string;
  afterId: string;
  beforeAnswers: CalculatorAnswers;
  afterAnswers: CalculatorAnswers;
  beforeDate: string;
  afterDate: string;
}): AssessmentCompareResult {
  const beforeResult = calculatePoints(input.beforeAnswers);
  const afterResult = calculatePoints(input.afterAnswers);

  const breakdownChanges = diffBreakdown(beforeResult, afterResult);

  const answerChanges: AnswerChange[] = [];
  const keys = Object.keys(input.beforeAnswers) as (keyof CalculatorAnswers)[];
  for (const key of keys) {
    if (key === "clientReference") continue;
    const b = input.beforeAnswers[key];
    const a = input.afterAnswers[key];
    if (b !== a) {
      answerChanges.push({
        field: key,
        label: ANSWER_FIELD_LABELS[key] ?? key,
        before: formatAnswerLabel(key, b),
        after: formatAnswerLabel(key, a),
        pointsDelta: answerChangePointsDelta(
          key,
          input.beforeAnswers,
          input.afterAnswers,
          breakdownChanges
        ),
      });
    }
  }

  return {
    beforeId: input.beforeId,
    afterId: input.afterId,
    beforeTotal: beforeResult.total,
    afterTotal: afterResult.total,
    totalDelta: afterResult.total - beforeResult.total,
    beforeDate: input.beforeDate,
    afterDate: input.afterDate,
    answerChanges,
    breakdownChanges,
  };
}

function diffBreakdown(before: PointsResult, after: PointsResult): BreakdownChange[] {
  const map = new Map<string, { before: number; after: number }>();
  for (const line of before.breakdown) {
    map.set(line.category, { before: line.points, after: 0 });
  }
  for (const line of after.breakdown) {
    const row = map.get(line.category) ?? { before: 0, after: 0 };
    row.after = line.points;
    map.set(line.category, row);
  }

  return [...map.entries()]
    .map(([category, pts]) => ({
      category,
      before: pts.before,
      after: pts.after,
      delta: pts.after - pts.before,
    }))
    .filter((r) => r.delta !== 0 || r.before !== r.after)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}
