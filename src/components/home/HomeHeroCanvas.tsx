"use client";

import { Suspense, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import type { RootState } from "@react-three/fiber";
import { HomeHeroEffects } from "./HomeHeroEffects";
import { HomeHeroScene } from "./HomeHeroScene";

type HomeHeroCanvasProps = {
  onSceneReady?: () => void;
  onContextLost?: () => void;
  onContextRestored?: () => void;
};

export default function HomeHeroCanvas({
  onSceneReady,
  onContextLost,
  onContextRestored,
}: HomeHeroCanvasProps) {
  const onCreated = useCallback(
    (state: RootState) => {
      const el = state.gl.domElement;
      const lost = (e: Event) => {
        e.preventDefault();
        onContextLost?.();
      };
      const restored = () => {
        onContextRestored?.();
      };
      el.addEventListener("webglcontextlost", lost);
      el.addEventListener("webglcontextrestored", restored);
    },
    [onContextLost, onContextRestored]
  );

  return (
    <div className="absolute inset-0 size-full" aria-hidden>
      <Canvas
        className="!absolute inset-0 !size-full"
        camera={{ position: [0.3, 0.15, 6.8], fov: 46 }}
        dpr={[1, 1.5]}
        frameloop="always"
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: 4,
          toneMappingExposure: 1.15,
          preserveDrawingBuffer: true,
        }}
        onCreated={onCreated}
      >
        <Suspense fallback={null}>
          <HomeHeroScene onSceneReady={onSceneReady} />
        </Suspense>
        {/* Must stay outside Suspense — avoids hook-order errors when async assets resolve */}
        <HomeHeroEffects />
      </Canvas>
    </div>
  );
}
