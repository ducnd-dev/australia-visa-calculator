import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AttentionItem } from "@/lib/crm/attention-items";
import { priorityLabel } from "@/lib/crm/attention-items";
import { cn } from "@/lib/utils";

function priorityVariant(priority: AttentionItem["priority"]) {
  if (priority === "high") return "destructive" as const;
  if (priority === "medium") return "warning" as const;
  return "secondary" as const;
}

export function AttentionList({ items }: { items: AttentionItem[] }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertCircle className="size-4 text-amber-600" aria-hidden />
          Needs attention
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">All caught up — no items need attention right now.</p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={`${item.itemType}-${item.clientId}-${item.assessmentId ?? ""}`}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{item.clientName}</p>
                    <p className="text-sm text-muted-foreground">{item.message}</p>
                  </div>
                  <Badge variant={priorityVariant(item.priority)} className="shrink-0">
                    {priorityLabel(item.priority)}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
