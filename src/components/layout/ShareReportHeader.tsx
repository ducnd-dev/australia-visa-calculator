import Image from "next/image";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export function ShareReportHeader({
  orgName,
  logoUrl,
  clientName,
  branded,
  visaSubclass,
  lastUpdated,
  className,
}: {
  orgName?: string | null;
  logoUrl?: string | null;
  clientName?: string | null;
  branded?: boolean;
  visaSubclass?: string;
  lastUpdated?: string;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "mb-8 rounded-2xl border border-border/80 bg-card p-6 shadow-sm",
        branded && "border-primary/20 bg-gradient-to-br from-primary/[0.04] to-card",
        className
      )}
    >
      {branded && orgName ? (
        <div className="flex flex-wrap items-center gap-4">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={`${orgName} logo`}
              width={140}
              height={56}
              className="h-14 w-auto object-contain"
              unoptimized
            />
          ) : (
            <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="size-6" aria-hidden />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-foreground">{orgName}</p>
            <p className="text-sm text-muted-foreground">
              Prepared for {clientName ?? "Client"}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="size-5" aria-hidden />
          </div>
          <div>
            <p className="font-semibold text-foreground">Points assessment summary</p>
            <p className="text-sm text-muted-foreground">
              Prepared for {clientName ?? "Client"}
            </p>
          </div>
        </div>
      )}
      {(visaSubclass || lastUpdated) && (
        <p className="mt-4 border-t border-border/60 pt-4 text-xs text-muted-foreground">
          {visaSubclass ? `Subclass ${visaSubclass}` : null}
          {visaSubclass && lastUpdated ? " · " : null}
          {lastUpdated ? `Rules ${lastUpdated}` : null}
        </p>
      )}
    </header>
  );
}
