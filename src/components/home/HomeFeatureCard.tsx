"use client";

import type { LucideIcon } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ACCENTS = [
  { icon: "from-violet-500 to-purple-600", glow: "bg-violet-400/20", ring: "group-hover:border-violet-300/50" },
  { icon: "from-primary to-blue-500", glow: "bg-primary/20", ring: "group-hover:border-primary/40" },
  { icon: "from-emerald-500 to-teal-600", glow: "bg-emerald-400/20", ring: "group-hover:border-emerald-300/50" },
  { icon: "from-amber-500 to-orange-500", glow: "bg-amber-400/20", ring: "group-hover:border-amber-300/50" },
] as const;

export function HomeFeatureCard({
  icon: Icon,
  title,
  desc,
  index,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  index: number;
}) {
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-border/80 bg-card/80 backdrop-blur-sm transition-all duration-300",
        "hover:-translate-y-1.5 hover:shadow-xl",
        accent.ring
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-8 -top-8 size-28 rounded-full blur-2xl transition-opacity opacity-0 group-hover:opacity-100",
          accent.glow
        )}
        aria-hidden
      />
      <CardHeader className="relative">
        <div
          className={cn(
            "mb-3 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br text-primary-foreground shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3",
            accent.icon
          )}
        >
          <Icon className="size-5" aria-hidden />
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="leading-relaxed">{desc}</CardDescription>
        <span className="absolute right-4 top-4 font-mono text-3xl font-bold text-foreground/5">
          {String(index + 1).padStart(2, "0")}
        </span>
      </CardHeader>
    </Card>
  );
}
