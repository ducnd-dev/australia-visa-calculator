"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearSharePasswordAction,
  setSharePasswordAction,
} from "@/app/share/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SharePasswordControls({
  assessmentId,
  clientId,
  hasPassword,
}: {
  assessmentId: string;
  clientId: string;
  hasPassword: boolean;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSetPassword() {
    setPending(true);
    setMessage(null);
    const result = await setSharePasswordAction(assessmentId, clientId, password);
    setPending(false);
    if (!result.ok) {
      setMessage(result.error ?? "Failed");
      return;
    }
    setPassword("");
    setMessage("Password protection enabled");
    router.refresh();
  }

  async function clearPassword() {
    setPending(true);
    setMessage(null);
    const result = await clearSharePasswordAction(assessmentId, clientId);
    setPending(false);
    if (!result.ok) {
      setMessage(result.error ?? "Failed");
      return;
    }
    setMessage("Password protection removed");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-border bg-muted/20 p-3">
      <div className="min-w-[140px] flex-1">
        <p className="mb-1 text-xs font-medium text-muted-foreground">
          Share password {hasPassword ? "(active)" : "(optional)"}
        </p>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={hasPassword ? "New password" : "Set password"}
          className="h-8 text-sm"
        />
      </div>
      <Button type="button" size="sm" variant="outline" disabled={pending || !password} onClick={handleSetPassword}>
        {hasPassword ? "Update" : "Enable"}
      </Button>
      {hasPassword && (
        <Button type="button" size="sm" variant="ghost" disabled={pending} onClick={clearPassword}>
          Remove
        </Button>
      )}
      {message && <p className="w-full text-xs text-muted-foreground">{message}</p>}
    </div>
  );
}
