import { Suspense } from "react";
import { CalculatorWizard } from "@/components/calculator/CalculatorWizard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Australia Skilled Migration Points Calculator | 189, 190, 491",
  description: "Calculate your GSM points test score based on Schedule 6D.",
  path: "/calculator",
});

function CalculatorSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-4 w-full max-w-lg" />
      <Skeleton className="h-2 w-full rounded-full" />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-28" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function CalculatorPage() {
  return (
    <Suspense fallback={<CalculatorSkeleton />}>
      <CalculatorWizard />
    </Suspense>
  );
}
