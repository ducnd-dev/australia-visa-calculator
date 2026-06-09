import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <MarketingShell>
      <main id="main" className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <FileQuestion className="size-8" aria-hidden />
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground">Page not found</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          The page you requested does not exist. Try the calculator or browse our guides.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/calculator">Calculator</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/blog">Blog</Link>
          </Button>
        </div>
      </main>
    </MarketingShell>
  );
}
