"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/calculator", label: "Calculator" },
  { href: "/visas", label: "Visas" },
  { href: "/for-agents", label: "For agents" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "FAQ" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MarketingHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold tracking-tight text-foreground"
          onClick={() => setOpen(false)}
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-500 text-sm font-bold text-primary-foreground shadow-sm">
            AV
          </span>
          <span className="hidden sm:inline">Australia Visa Points</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-0.5 md:flex">
          {LINKS.map((l) => {
            const active = isActive(pathname, l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                aria-current={active ? "page" : undefined}
              >
                {l.label}
              </Link>
            );
          })}
          <Button size="sm" className="ml-2 shadow-sm" asChild>
            <Link href="/login">Agent sign in</Link>
          </Button>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Button size="sm" asChild>
            <Link href="/calculator">Calculate</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={cn(
          "border-t border-border bg-background md:hidden",
          open ? "block" : "hidden"
        )}
      >
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4" aria-label="Mobile">
          {LINKS.map((l) => {
            const active = isActive(pathname, l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-lg px-3 py-3 text-sm font-medium",
                  active ? "bg-primary/10 text-primary" : "hover:bg-muted"
                )}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            );
          })}
          <Button className="mt-2 w-full" asChild>
            <Link href="/login" onClick={() => setOpen(false)}>
              Agent sign in
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
