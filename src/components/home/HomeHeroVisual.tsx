"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { HERO_SCORE_FONT } from "./HomeHeroScore3D";
import { heroPointerTarget } from "./hero-pointer";
import { HomeHeroFallbackVisual } from "./HomeHeroFallbackVisual";
import "./home-animations.css";

const HomeHeroCanvas = dynamic(() => import("./HomeHeroCanvas"), {
  ssr: false,
  loading: () => null,
});

function canUseWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Full-bleed hero 3D layer behind copy. */
export function HomeHeroVisual() {
  const rootRef = useRef<HTMLDivElement>(null);
  const webglOk = useRef(canUseWebGL());
  const [load3d, setLoad3d] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);

  const onSceneReady = useCallback(() => {
    setSceneReady(true);
  }, []);

  const onContextLost = useCallback(() => {
    setSceneReady(false);
  }, []);

  const onContextRestored = useCallback(() => {
    setCanvasKey((k) => k + 1);
    setSceneReady(false);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reduceMotion || !webglOk.current) return;

    // Hero is above the fold — load WebGL immediately (IO caused flaky unload in dev/HMR).
    setLoad3d(true);

    void import("./HomeHeroCanvas");
    void import("./HomeHeroScene");
    void import("@react-three/drei").then((d) => {
      d.useFont.preload(HERO_SCORE_FONT);
      d.useEnvironment.preload({ preset: "night" });
    });
  }, [reduceMotion]);

  useEffect(() => {
    let raf = 0;
    let clientX = 0;
    let clientY = 0;

    const flush = () => {
      raf = 0;
      const el = rootRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width < 1) return;
      heroPointerTarget.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      heroPointerTarget.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerMove = (e: PointerEvent) => {
      clientX = e.clientX;
      clientY = e.clientY;
      if (!raf) raf = requestAnimationFrame(flush);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const showCanvas = load3d && !reduceMotion && webglOk.current;

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 z-[1]"
      aria-hidden
    >
      <HomeHeroFallbackVisual
        animate={!showCanvas || !sceneReady}
        hideScoreHub={showCanvas && sceneReady}
        fullBleed
      />
      {showCanvas && (
        <div className="absolute inset-0 opacity-100">
          <HomeHeroCanvas
            key={canvasKey}
            onSceneReady={onSceneReady}
            onContextLost={onContextLost}
            onContextRestored={onContextRestored}
          />
        </div>
      )}
    </div>
  );
}
