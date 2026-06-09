"use client";

import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

/** Ethereal bloom — selective glow on emissive / bright surfaces. */
export function HomeHeroEffects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        blendFunction={BlendFunction.ADD}
        intensity={0.85}
        luminanceThreshold={0.15}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
    </EffectComposer>
  );
}
