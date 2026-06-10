"use client";

import Link from "next/link";
import { Check, Circle, X } from "lucide-react";
import { dismissOnboarding } from "@/app/(app)/app/onboarding-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OnboardingState } from "@/lib/onboarding/steps";
import { cn } from "@/lib/utils";

export function OnboardingChecklist({ state }: { state: OnboardingState }) {
  if (state.dismissed || state.allDone) return null;

  const doneCount = state.steps.filter((s) => s.done).length;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <CardTitle className="text-base">Get started with your practice</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {doneCount} of {state.steps.length} steps complete
          </p>
        </div>
        <form action={dismissOnboarding}>
          <Button type="submit" variant="ghost" size="icon" className="shrink-0" aria-label="Dismiss checklist">
            <X className="size-4" aria-hidden />
          </Button>
        </form>
      </CardHeader>
      <CardContent className="pt-4">
        <ol className="space-y-3">
          {state.steps.map((step) => (
            <li key={step.id}>
              <Link
                href={step.href}
                className={cn(
                  "flex items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                  step.done
                    ? "border-emerald-200/80 bg-emerald-50/50 text-muted-foreground dark:border-emerald-900/40 dark:bg-emerald-950/20"
                    : "border-border bg-card hover:border-primary/30 hover:bg-muted/30"
                )}
              >
                {step.done ? (
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
                ) : (
                  <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                )}
                <span className={step.done ? "line-through" : "font-medium text-foreground"}>
                  {step.label}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
