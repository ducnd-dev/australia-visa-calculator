"use client";

import { Button } from "@/components/ui/button";

export function PrintTrigger() {
  return (
    <Button type="button" onClick={() => window.print()}>
      Print / Save as PDF
    </Button>
  );
}
