"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import "./home-animations.css";

type Particle = { x: number; y: number; vx: number; vy: number; r: number };

function initParticles(w: number, h: number, count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: 1 + Math.random() * 1.5,
  }));
}

/** Full-bleed animated hero backdrop (grid, glow, particle mesh). */
export function HomeHeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let particles: Particle[] = [];
    let raf = 0;
    let visible = true;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.floor(rect.width);
      h = Math.floor(rect.height);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(90, Math.floor((w * h) / 14000));
      particles = initParticles(w, h, Math.max(40, count));
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    io.observe(wrap);

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      pointer.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };
    wrap.addEventListener("pointermove", onMove, { passive: true });

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!visible || reduced) return;

      ctx.clearRect(0, 0, w, h);
      const px = (pointer.current.x - 0.5) * 18;
      const py = (pointer.current.y - 0.5) * 12;

      for (const p of particles) {
        p.x += p.vx + px * 0.02;
        p.y += p.vy + py * 0.02;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
      }

      const linkDist = 120;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < linkDist) {
            const alpha = (1 - d / linkDist) * 0.14;
            ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(96, 165, 250, 0.55)";
        ctx.fill();
      }
    };

    if (!reduced) draw();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      wrap.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div ref={wrapRef} className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-background to-background" />

      <div
        className={cn(
          "absolute -left-[20%] top-[-30%] h-[70%] w-[55%] rounded-full",
          "bg-[radial-gradient(circle,oklch(0.55_0.2_264/0.22)_0%,transparent_68%)]",
          "home-animate-glow home-animate-mesh-a"
        )}
      />
      <div
        className={cn(
          "absolute right-[-10%] top-[10%] h-[55%] w-[45%] rounded-full",
          "bg-[radial-gradient(circle,oklch(0.72_0.14_230/0.18)_0%,transparent_70%)]",
          "home-animate-glow home-animate-mesh-b"
        )}
      />
      <div
        className={cn(
          "absolute bottom-[-25%] left-[30%] h-[50%] w-[50%] rounded-full",
          "bg-[radial-gradient(circle,oklch(0.6_0.16_250/0.12)_0%,transparent_72%)]",
          "home-animate-glow home-animate-mesh-c"
        )}
      />

      <div
        className="absolute inset-0 opacity-[0.35] home-animate-grid"
        style={{
          backgroundImage: `
            linear-gradient(to right, oklch(0.55 0.2 264 / 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, oklch(0.55 0.2 264 / 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage: "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)",
        }}
      />

      <div
        className="absolute inset-0 opacity-40 home-animate-beam"
        style={{
          backgroundImage: `
            linear-gradient(105deg, transparent 40%, oklch(0.65 0.12 250 / 0.06) 50%, transparent 60%)
          `,
          backgroundSize: "200% 100%",
        }}
      />

      <canvas ref={canvasRef} className="absolute inset-0 size-full opacity-50" />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 85% 75% at 18% 45%, transparent 0%, var(--background) 72%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-24"
        style={{
          background: "linear-gradient(to top, var(--background), transparent)",
        }}
      />
    </div>
  );
}
