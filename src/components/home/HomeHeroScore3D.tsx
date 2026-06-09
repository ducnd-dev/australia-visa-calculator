"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Center, Text3D } from "@react-three/drei";
import type { Group } from "three";

export const HERO_SCORE_FONT = "/fonts/helvetiker_bold.typeface.json";

const scoreMat = {
  color: "#f8fafc",
  metalness: 0.85,
  roughness: 0.08,
  emissive: "#818cf8",
  emissiveIntensity: 0.65,
  envMapIntensity: 2,
};

const labelMat = {
  color: "#a5b4fc",
  metalness: 0.6,
  roughness: 0.2,
  emissive: "#6366f1",
  emissiveIntensity: 0.35,
};

/** Holographic extruded score — floats above the energy nexus. */
export function HomeHeroScore3D() {
  const group = useRef<Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = Math.sin(t * 0.38) * 0.1;
    group.current.rotation.x = Math.sin(t * 0.28) * 0.05;
    group.current.position.y = Math.sin(t * 0.9) * 0.04;
  });

  return (
    <group ref={group} position={[0, 0, 0.55]}>
      <Center top position={[0, 0.16, 0]}>
        <Text3D
          font={HERO_SCORE_FONT}
          size={0.38}
          height={0.12}
          bevelEnabled
          bevelThickness={0.024}
          bevelSize={0.016}
          bevelSegments={5}
          curveSegments={16}
        >
          75
          <meshPhysicalMaterial {...scoreMat} clearcoat={1} clearcoatRoughness={0.05} transmission={0.15} thickness={0.2} />
        </Text3D>
      </Center>
      <Center top position={[0, -0.22, 0]}>
        <Text3D
          font={HERO_SCORE_FONT}
          size={0.085}
          height={0.03}
          bevelEnabled
          bevelThickness={0.006}
          bevelSize={0.004}
          bevelSegments={3}
          curveSegments={10}
          letterSpacing={0.06}
        >
          POINTS
          <meshStandardMaterial {...labelMat} />
        </Text3D>
      </Center>
    </group>
  );
}
