"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AssessmentComparePicker({
  clientId,
  assessments,
}: {
  clientId: string;
  assessments: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }

  function compare() {
    if (selected.length !== 2) return;
    const [a, b] = selected;
    router.push(`/app/clients/${clientId}/compare?a=${a}&b=${b}`);
  }

  if (assessments.length < 2) return null;

  return (
    <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/20 p-4">
      <p className="mb-3 text-sm font-medium text-foreground">Compare assessments</p>
      <ul className="mb-3 space-y-2">
        {assessments.map((a) => (
          <li key={a.id}>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(a.id)}
                onChange={() => toggle(a.id)}
                className="size-4 rounded border border-input accent-primary"
              />
              <span>{a.label}</span>
            </label>
          </li>
        ))}
      </ul>
      <Button type="button" size="sm" disabled={selected.length !== 2} onClick={compare}>
        Compare selected ({selected.length}/2)
      </Button>
    </div>
  );
}
