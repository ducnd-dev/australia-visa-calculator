"use client";

import { cn } from "@/lib/utils";
import "./home-animations.css";

const VISAS = [
  { code: "189", style: { "--rx": "8deg", "--ry": "-18deg", "--rz": "-4deg", "--delay": "0s" } as React.CSSProperties },
  { code: "190", style: { "--rx": "4deg", "--ry": "12deg", "--rz": "2deg", "--delay": "0.8s" } as React.CSSProperties },
  { code: "491", style: { "--rx": "-6deg", "--ry": "20deg", "--rz": "3deg", "--delay": "1.6s" } as React.CSSProperties },
];

const VISA_PLACES_FULL = [
  { left: "52%", top: "14%" },
  { left: "72%", top: "28%" },
  { left: "58%", top: "52%" },
] as const;

/** Lightweight CSS 3D placeholder until WebGL loads (or when WebGL unavailable). */
export function HomeHeroFallbackVisual({
  animate = true,
  hideScoreHub = false,
  fullBleed = false,
}: {
  animate?: boolean;
  hideScoreHub?: boolean;
  fullBleed?: boolean;
}) {
  const hubClass = fullBleed
    ? "left-[62%] top-[46%] -translate-x-1/2 -translate-y-1/2"
    : "relative z-20";

  return (
    <div
      className={cn(
        "items-center justify-center",
        fullBleed ? "absolute inset-0" : "relative flex h-[min(380px,65vw)] w-full max-w-md lg:max-w-lg"
      )}
      aria-hidden
    >
      <div
        className={cn(
          "pointer-events-none rounded-full border border-violet-400/20",
          fullBleed ? "absolute left-[62%] top-[46%] size-[min(72vw,520px)] -translate-x-1/2 -translate-y-1/2" : "absolute size-[85%]",
          animate && "home-animate-orbit-slow"
        )}
      />
      <div
        className={cn(
          "pointer-events-none rounded-full border border-cyan-400/25",
          fullBleed ? "absolute left-[62%] top-[46%] size-[min(58vw,420px)] -translate-x-1/2 -translate-y-1/2" : "absolute size-[68%]",
          animate && "home-animate-orbit-fast"
        )}
      />
      <div
        className={cn(
          "absolute flex size-28 flex-col items-center justify-center rounded-full border border-violet-400/40 bg-gradient-to-br from-violet-500/15 via-indigo-500/10 to-cyan-400/10 shadow-2xl shadow-violet-500/30 backdrop-blur-md transition-opacity duration-700",
          hubClass,
          animate && "home-animate-score",
          hideScoreHub && "pointer-events-none opacity-0"
        )}
      >
        <span className="text-3xl font-bold tabular-nums text-violet-200">75</span>
        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-cyan-400/80">
          points
        </span>
      </div>
      {VISAS.map((v, i) => (
        <div
          key={v.code}
          className={cn("absolute w-36 sm:w-40", !fullBleed && i === 0 && "left-[14%] top-[8%]")}
          style={
            fullBleed
              ? { left: VISA_PLACES_FULL[i].left, top: VISA_PLACES_FULL[i].top }
              : {
                  left: i === 0 ? "14%" : i === 1 ? "50%" : "28%",
                  top: i === 0 ? "8%" : i === 1 ? "22%" : "48%",
                }
          }
        >
          <div
            className={cn(
              "flex flex-col items-center gap-1 rounded-full border border-violet-400/30 bg-gradient-to-br from-violet-500/10 via-cyan-400/5 to-transparent px-5 py-4 shadow-xl shadow-violet-500/15 backdrop-blur-md",
              animate && "home-animate-float"
            )}
            style={v.style}
          >
            <div className="size-3 rounded-full bg-gradient-to-br from-cyan-300 to-violet-400 shadow-[0_0_12px_oklch(0.65_0.2_280/0.5)]" />
            <p className="text-lg font-bold tracking-widest text-violet-300">{v.code}</p>
            <p className="text-[9px] uppercase tracking-[0.2em] text-cyan-400/70">visa</p>
          </div>
        </div>
      ))}
    </div>
  );
}
