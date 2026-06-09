"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  LayoutDashboard,
  Mail,
  Settings,
  UserPlus,
  Users,
  ClipboardPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const nav: { href: string; label: string; icon: LucideIcon; exact?: boolean }[] = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/app/clients", label: "Clients", icon: Users },
  { href: "/app/assessments/new", label: "New assessment", icon: ClipboardPlus },
  { href: "/app/marketing", label: "Marketing", icon: Mail },
  { href: "/app/settings", label: "Settings", icon: Settings },
  { href: "/app/billing", label: "Billing", icon: CreditCard },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-0.5 p-3" aria-label="Agency">
      {nav.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
            {item.label}
          </Link>
        );
      })}
      <Link
        href="/app/clients/new"
        className="mt-3 flex items-center gap-2.5 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
      >
        <UserPlus className="size-4" aria-hidden />
        Add client
      </Link>
    </nav>
  );
}
