"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Lock } from "lucide-react";
import { SectionCard } from "@/components/layout/SectionCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { canExportPdf } from "@/lib/billing/plans";

export function PdfPreviewPanel({
  assessmentId,
  plan,
}: {
  assessmentId: string;
  plan?: string | null;
}) {
  const [tab, setTab] = useState("preview");
  const allowed = canExportPdf(plan);

  return (
    <SectionCard
      title="Report preview"
      description="Preview the printable assessment report before downloading or emailing."
    >
      {!allowed ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/60 p-4 text-sm dark:border-amber-900/50 dark:bg-amber-950/30">
          <Lock className="mt-0.5 size-4 shrink-0 text-amber-700" aria-hidden />
          <div>
            <p className="font-medium text-foreground">PDF preview on Professional plan</p>
            <p className="mt-1 text-muted-foreground">
              Upgrade to preview and download branded PDF reports.
            </p>
            <Button size="sm" className="mt-3" asChild>
              <Link href="/app/billing">View billing</Link>
            </Button>
          </div>
        </div>
      ) : (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="download">Download</TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="mt-4">
            <div className="overflow-hidden rounded-xl border border-border bg-muted/20">
              <iframe
                title="Assessment report preview"
                src={`/app/assessments/${assessmentId}/print`}
                className="h-[480px] w-full bg-white"
              />
            </div>
          </TabsContent>
          <TabsContent value="download" className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Download a PDF generated from the same layout as the print preview.
            </p>
            <Button asChild className="gap-2">
              <a href={`/api/assessments/${assessmentId}/pdf`} download>
                <FileText className="size-4" aria-hidden />
                Download PDF
              </a>
            </Button>
          </TabsContent>
        </Tabs>
      )}
    </SectionCard>
  );
}
