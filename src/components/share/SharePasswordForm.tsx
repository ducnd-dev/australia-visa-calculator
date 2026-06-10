"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifySharePasswordAction } from "@/app/share/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SharePasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = await verifySharePasswordAction(token, password);
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Incorrect password");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm"
      >
        <h1 className="text-lg font-semibold text-foreground">Password required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the password from your migration agent to view this assessment.
        </p>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-4"
          placeholder="Share password"
          autoComplete="current-password"
          required
        />
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        <Button type="submit" className="mt-4 w-full" disabled={pending}>
          {pending ? "Checking…" : "View assessment"}
        </Button>
      </form>
    </div>
  );
}
