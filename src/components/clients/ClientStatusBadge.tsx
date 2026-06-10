import { Badge } from "@/components/ui/badge";
import type { ClientStatus } from "@/lib/crm/client-status";
import { clientStatusLabel, clientStatusVariant } from "@/lib/crm/client-status";

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  return (
    <Badge variant={clientStatusVariant(status)} className="text-[10px] uppercase tracking-wide">
      {clientStatusLabel(status)}
    </Badge>
  );
}
