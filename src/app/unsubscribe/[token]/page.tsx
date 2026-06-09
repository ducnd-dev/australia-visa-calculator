import { MailX, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { processUnsubscribe } from "@/lib/email/unsubscribe";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Unsubscribe",
  description: "Manage email preferences.",
  path: "/unsubscribe",
  noIndex: true,
});

export default async function UnsubscribePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ confirmed?: string }>;
}) {
  const { token } = await params;
  const { confirmed } = await searchParams;

  if (confirmed === "1") {
    const result = await processUnsubscribe(token);
    if (result.ok) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-16">
          <Card className="max-w-md border-border/80 text-center shadow-sm">
            <CardContent className="px-6 py-10">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                <CheckCircle2 className="size-7" aria-hidden />
              </div>
              <h1 className="mt-5 text-xl font-semibold text-foreground">You&apos;re unsubscribed</h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {result.kind === "client"
                  ? "You will no longer receive marketing emails from your migration agent via this service."
                  : "You will no longer receive product marketing emails from Visa Calculator."}
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-16">
        <Card className="max-w-md border-border/80 text-center shadow-sm">
          <CardContent className="px-6 py-10">
            <h1 className="text-xl font-semibold text-foreground">Link invalid or expired</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              This unsubscribe link may have already been used or has expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-16">
      <Card className="max-w-md border-border/80 text-center shadow-sm">
        <CardContent className="px-6 py-10">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <MailX className="size-7" aria-hidden />
          </div>
          <h1 className="mt-5 text-xl font-semibold text-foreground">Unsubscribe</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Confirm you want to stop receiving these marketing emails.
          </p>
          <form action={`/unsubscribe/${token}?confirmed=1`} method="get" className="mt-8">
            <input type="hidden" name="confirmed" value="1" />
            <Button type="submit" variant="destructive">
              Confirm unsubscribe
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
