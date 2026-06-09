"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/(app)/app/actions";
import { AppNav } from "@/components/layout/AppNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { ClipboardPlus, LayoutDashboard, LogOut, Settings, Users } from "lucide-react";

const mobileNav: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
}[] = [
  { href: "/app", label: "Home", icon: LayoutDashboard, exact: true },
  { href: "/app/clients", label: "Clients", icon: Users },
  { href: "/app/assessments/new", label: "Assess", icon: ClipboardPlus },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function AppShell({ profile, children }: { profile: UserProfile; children: React.ReactNode }) {
  const pathname = usePathname();
  const plan = profile.organizations?.plan ?? "trial";
  const orgName = profile.organizations?.name ?? "Workspace";

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
        <div className="border-b border-border px-5 py-5">
          <Link href="/app" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-500 text-xs font-bold text-primary-foreground">
              AV
            </span>
            <span className="truncate text-sm font-semibold">Agency workspace</span>
          </Link>
          <p className="mt-3 truncate text-sm font-medium text-foreground">{orgName}</p>
          <Badge
            variant={plan === "agency" || plan === "enterprise" ? "success" : "secondary"}
            className="mt-2"
          >
            {plan}
          </Badge>
        </div>
        <AppNav />
        <form action={signOut} className="mt-auto border-t border-border p-3">
          <Button type="submit" variant="outline" size="sm" className="w-full gap-2">
            <LogOut className="size-3.5" aria-hidden />
            Sign out
          </Button>
        </form>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-md md:px-8">
          <div className="min-w-0 md:hidden">
            <p className="truncate text-sm font-semibold">{orgName}</p>
            <p className="text-xs text-muted-foreground">{profile.full_name ?? "Agent"}</p>
          </div>
          <p className="hidden text-sm text-muted-foreground md:block">
            Signed in as{" "}
            <span className="font-medium text-foreground">{profile.full_name ?? "Agent"}</span>
          </p>
          <div className="flex items-center gap-2 md:hidden">
            <Button size="sm" asChild>
              <Link href="/app/assessments/new">New</Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-2 py-1.5 backdrop-blur-md md:hidden"
        aria-label="Mobile agency"
      >
        <div className="flex">
          {mobileNav.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="size-5" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="h-[4.25rem] md:hidden" aria-hidden />
    </div>
  );
}
