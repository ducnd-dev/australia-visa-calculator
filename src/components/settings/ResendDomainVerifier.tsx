"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyResendDomainAction } from "@/app/(app)/app/settings/email-actions";
import type { ResendDnsRecord } from "@/lib/email/resend-domains";
import { Button } from "@/components/ui/button";

export function ResendDomainVerifier({
  domain,
  currentlyVerified,
}: {
  domain: string;
  currentlyVerified: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<ResendDnsRecord[] | null>(null);
  const [status, setStatus] = useState<string | null>(currentlyVerified ? "verified" : null);

  async function check() {
    if (!domain.trim()) {
      setError("Enter a domain above and save, then check verification.");
      return;
    }
    setPending(true);
    setError(null);
    const result = await verifyResendDomainAction(domain);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setStatus(result.status.status);
    setRecords(result.status.records);
    router.refresh();
  }

  if (!domain.trim()) return null;

  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-foreground">Resend domain verification</p>
          <p className="text-xs text-muted-foreground">
            {status === "verified"
              ? "Domain verified — reports send from your custom domain."
              : status === "not_found"
                ? "Domain not found in Resend. Add it in the Resend dashboard first."
                : "Add DNS records in Resend, then check verification."}
          </p>
        </div>
        <Button type="button" size="sm" variant="outline" disabled={pending} onClick={check}>
          {pending ? "Checking…" : "Check verification"}
        </Button>
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      {records && records.length > 0 && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-1 pr-2">Type</th>
                <th className="py-1 pr-2">Name</th>
                <th className="py-1 pr-2">Value</th>
                <th className="py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={i} className="border-b border-border/50 font-mono">
                  <td className="py-1.5 pr-2">{r.type}</td>
                  <td className="py-1.5 pr-2 break-all">{r.name}</td>
                  <td className="py-1.5 pr-2 break-all">{r.value}</td>
                  <td className="py-1.5">{r.status ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
