import Link from "next/link";
import { MarketingAtmosphere } from "@/components/layout/MarketingAtmosphere";
import { MarketingCtaBand } from "@/components/layout/MarketingCtaBand";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { Separator } from "@/components/ui/separator";
import { FOOTER_LINKS } from "@/lib/static-pages";
import { LAST_UPDATED } from "@/lib/visa-rules/sources";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <MarketingAtmosphere />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <MarketingHeader />
      {children}
      <MarketingCtaBand />
      <footer className="mt-auto border-t border-border/60 bg-card/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="max-w-sm">
              <Link href="/" className="flex items-center gap-2.5 font-semibold text-foreground">
                <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-500 text-sm font-bold text-primary-foreground shadow-sm">
                  AV
                </span>
                Australia Visa Points
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Schedule 6D estimator for skilled migration. Not migration advice — rules updated{" "}
                {LAST_UPDATED}.
              </p>
            </div>
            <div className="grid flex-1 gap-10 sm:grid-cols-3">
              {(
                [
                  ["Product", FOOTER_LINKS.product],
                  ["Company", FOOTER_LINKS.company],
                  ["Legal", FOOTER_LINKS.legal],
                ] as const
              ).map(([title, links]) => (
                <div key={title}>
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <ul className="mt-4 space-y-2.5">
                    {links.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          className="text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <Separator className="my-8" />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Australia Visa Points Calculator
          </p>
        </div>
      </footer>
    </div>
  );
}
