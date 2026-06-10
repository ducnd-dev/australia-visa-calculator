"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { seedGettingStartedClient } from "@/app/(app)/app/onboarding-actions";
import { Button } from "@/components/ui/button";

export function SeedExampleClientButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const res = await seedGettingStartedClient();
          if (res.clientId) router.push(`/app/clients/${res.clientId}`);
        });
      }}
    >
      {pending ? "Creating…" : "Add example client"}
    </Button>
  );
}
