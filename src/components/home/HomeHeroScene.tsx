"use client";

import { useEffect, useMemo, useRef } from "react";
import { extend, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Float,
  Line,
  MeshDistortMaterial,
  shaderMaterial,
  Sparkles,
  Stars,
  Text,
} from "@react-three/drei";
import * as THREE from "three";
import type { Group, Mesh, Points, ShaderMaterial } from "three";
import { heroPointerTarget } from "./hero-pointer";
import { HomeHeroScore3D } from "./HomeHeroScore3D";

const AuroraMaterialImpl = shaderMaterial(
  {
    uTime: 0,
    uColorA: new THREE.Color("#6366f1"),
    uColorB: new THREE.Color("#22d3ee"),
    uColorC: new THREE.Color("#c084fc"),
  },
  /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /* glsl */ `
    uniform float uTime;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform vec3 uColorC;
    varying vec2 vUv;

    void main() {
      float wave1 = sin(vUv.x * 5.0 + uTime * 0.28) * cos(vUv.y * 3.5 - uTime * 0.18);
      float wave2 = sin(vUv.y * 6.0 + uTime * 0.22) * 0.5;
      float blend = smoothstep(0.05, 0.95, vUv.y + wave1 * 0.18 + wave2 * 0.12);
      vec3 color = mix(uColorA, uColorB, blend);
      color = mix(color, uColorC, sin(uTime * 0.12 + vUv.x * 3.0) * 0.5 + 0.5);
      float vignette = smoothstep(0.0, 0.55, 1.0 - abs(vUv.x - 0.5) * 1.6);
      float alpha = (0.06 + wave1 * 0.035) * vignette;
      gl_FragColor = vec4(color, alpha);
    }
  `
);

extend({ AuroraMaterialImpl });

declare module "@react-three/fiber" {
  interface ThreeElements {
    auroraMaterialImpl: THREE.Object3D & {
      uTime?: number;
      uColorA?: THREE.Color;
      uColorB?: THREE.Color;
      uColorC?: THREE.Color;
    };
  }
}

const VISA_NODES = [
  {
    code: "189",
    position: [-1.55, 0.72, 0.35] as [number, number, number],
    rotation: [0.15, -0.48, 0.08] as [number, number, number],
    hue: "#818cf8",
    accent: "#a5b4fc",
    speed: 1.1,
  },
  {
    code: "190",
    position: [1.48, 0.28, 0.52] as [number, number, number],
    rotation: [0.08, 0.52, -0.12] as [number, number, number],
    hue: "#22d3ee",
    accent: "#67e8f9",
    speed: 1.45,
  },
  {
    code: "491",
    position: [0.12, -1.18, 0.22] as [number, number, number],
    rotation: [-0.2, 0.18, 0.14] as [number, number, number],
    hue: "#c084fc",
    accent: "#d8b4fe",
    speed: 1.25,
  },
] as const;

function AuroraBackdrop() {
  const mat = useRef<ShaderMaterial>(null);

  useFrame((state) => {
    if (mat.current) mat.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh position={[0, 0, -3.8]} scale={[14, 10, 1]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      {/* @ts-expect-error extended shader material */}
      <auroraMaterialImpl ref={mat} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

function EnergyRings() {
  const outer = useRef<Mesh>(null);
  const mid = useRef<Mesh>(null);
  const inner = useRef<Mesh>(null);
  const halo = useRef<Mesh>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (outer.current) {
      outer.current.rotation.z += delta * 0.22;
      outer.current.rotation.x = Math.sin(t * 0.3) * 0.22;
      outer.current.scale.setScalar(1 + Math.sin(t * 0.8) * 0.02);
    }
    if (mid.current) {
      mid.current.rotation.z -= delta * 0.36;
      mid.current.rotation.y = t * 0.1;
    }
    if (inner.current) {
      inner.current.rotation.x += delta * 0.48;
      inner.current.rotation.z = Math.sin(t * 0.5) * 0.3;
    }
    if (halo.current) {
      halo.current.rotation.y = -t * 0.08;
      const pulse = 1 + Math.sin(t * 1.2) * 0.04;
      halo.current.scale.setScalar(pulse);
    }
  });

  const ring = (color: string, opacity: number) => (
    <meshBasicMaterial
      color={color}
      transparent
      opacity={opacity}
      toneMapped={false}
      blending={THREE.AdditiveBlending}
      depthWrite={false}
    />
  );

  return (
    <group>
      <mesh ref={halo} rotation={[Math.PI / 2.2, 0.1, 0]}>
        <torusGeometry args={[1.55, 0.04, 8, 96]} />
        {ring("#6366f1", 0.18)}
      </mesh>
      <mesh ref={outer} rotation={[Math.PI / 2.6, 0.25, 0]}>
        <torusGeometry args={[1.42, 0.022, 12, 96]} />
        {ring("#818cf8", 0.65)}
      </mesh>
      <mesh ref={mid} rotation={[Math.PI / 3.4, 0.75, 0.35]}>
        <torusGeometry args={[1.15, 0.014, 8, 72]} />
        {ring("#22d3ee", 0.42)}
      </mesh>
      <mesh ref={inner} rotation={[0.45, 0.15, Math.PI / 3.5]}>
        <torusGeometry args={[0.9, 0.009, 6, 56]} />
        {ring("#c084fc", 0.32)}
      </mesh>
    </group>
  );
}

function NebulaField() {
  const count = 240;
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      new THREE.Color("#818cf8"),
      new THREE.Color("#22d3ee"),
      new THREE.Color("#c084fc"),
      new THREE.Color("#60a5fa"),
    ];
    for (let i = 0; i < count; i++) {
      const r = 4.8 * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return { positions: pos, colors: col };
  }, []);

  const ref = useRef<Points>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.025;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.05;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        vertexColors
        transparent
        opacity={0.65}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function DataStreams() {
  const arcPoints = useMemo(() => {
    const hub = new THREE.Vector3(0, 0, 0);
    return VISA_NODES.map((v) => {
      const end = new THREE.Vector3(...v.position);
      const mid = hub.clone().add(end).multiplyScalar(0.5);
      mid.y += 0.42;
      mid.z += 0.28;
      mid.x += Math.sin(v.position[0]) * 0.15;
      const curve = new THREE.QuadraticBezierCurve3(hub, mid, end);
      return curve.getPoints(36).map((p) => p.toArray() as [number, number, number]);
    });
  }, []);

  return (
    <group>
      {arcPoints.map((points, i) => (
        <Line
          key={VISA_NODES[i].code}
          points={points}
          color={VISA_NODES[i].accent}
          lineWidth={1.2}
          transparent
          opacity={0.35}
          dashed
          dashSize={0.06}
          gapSize={0.1}
        />
      ))}
    </group>
  );
}

function HolographicVisa({
  code,
  position,
  rotation,
  hue,
  accent,
  speed,
}: {
  code: string;
  position: [number, number, number];
  rotation: [number, number, number];
  hue: string;
  accent: string;
  speed: number;
}) {
  const crystal = useRef<Mesh>(null);
  const ring = useRef<Mesh>(null);
  const wireGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.4, 0)), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed * 0.4;
    if (crystal.current) crystal.current.rotation.y = t;
    if (ring.current) ring.current.rotation.z = -t * 0.6;
  });

  return (
    <Float speed={speed} rotationIntensity={0.55} floatIntensity={0.9}>
      <group position={position} rotation={rotation}>
        <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.72, 0.006, 8, 64]} />
          <meshBasicMaterial color={accent} transparent opacity={0.45} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>

        <mesh ref={crystal}>
          <octahedronGeometry args={[0.38, 0]} />
          <meshPhysicalMaterial
            color={hue}
            metalness={0.15}
            roughness={0.04}
            transmission={0.88}
            thickness={0.35}
            transparent
            opacity={0.92}
            emissive={accent}
            emissiveIntensity={0.3}
            clearcoat={1}
            clearcoatRoughness={0.05}
            envMapIntensity={1.4}
            ior={1.45}
          />
        </mesh>

        <lineSegments geometry={wireGeo}>
          <lineBasicMaterial color={accent} transparent opacity={0.55} blending={THREE.AdditiveBlending} />
        </lineSegments>

        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.85} toneMapped={false} />
        </mesh>

        <Text
          position={[0, 0.62, 0]}
          fontSize={0.28}
          color="#f8fafc"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.06}
          outlineWidth={0.018}
          outlineColor={hue}
          outlineOpacity={0.8}
        >
          {code}
        </Text>

        <Text position={[0, 0.42, 0]} fontSize={0.07} color={accent} anchorX="center" anchorY="middle" letterSpacing={0.12}>
          VISA
        </Text>

        <Sparkles count={16} scale={1.4} size={2} speed={0.5} opacity={0.7} color={accent} />
      </group>
    </Float>
  );
}

function ScoreNexus() {
  const knot = useRef<Mesh>(null);
  const aura = useRef<Mesh>(null);
  const innerGlow = useRef<Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pulse = 1 + Math.sin(t * 1.05) * 0.045;
    if (knot.current) {
      knot.current.rotation.x = t * 0.18;
      knot.current.rotation.y = t * 0.28;
      knot.current.scale.setScalar(pulse);
    }
    if (aura.current) {
      aura.current.rotation.y = -t * 0.12;
      aura.current.rotation.z = Math.sin(t * 0.4) * 0.1;
    }
    if (innerGlow.current) {
      innerGlow.current.scale.setScalar(pulse * 1.08);
      const mat = innerGlow.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.12 + Math.sin(t * 1.5) * 0.04;
    }
  });

  return (
    <group>
      <mesh ref={innerGlow}>
        <sphereGeometry args={[1.05, 32, 32]} />
        <meshBasicMaterial color="#6366f1" transparent opacity={0.14} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      <mesh ref={aura}>
        <sphereGeometry args={[0.88, 48, 48]} />
        <meshPhysicalMaterial
          color="#a5b4fc"
          metalness={0.1}
          roughness={0.02}
          transmission={0.92}
          thickness={0.5}
          transparent
          opacity={0.85}
          emissive="#6366f1"
          emissiveIntensity={0.2}
          clearcoat={1}
          clearcoatRoughness={0.04}
          envMapIntensity={1.5}
          ior={1.5}
        />
      </mesh>

      <mesh ref={knot}>
        <torusKnotGeometry args={[0.42, 0.09, 128, 24, 2, 3]} />
        <MeshDistortMaterial
          color="#4f46e5"
          emissive="#818cf8"
          emissiveIntensity={0.75}
          distort={0.38}
          speed={2.8}
          roughness={0.08}
          metalness={0.85}
          envMapIntensity={1.6}
        />
      </mesh>

      <Sparkles count={72} scale={2.8} size={3} speed={0.4} opacity={0.65} color="#e0e7ff" />
      <Sparkles count={32} scale={1.6} size={1.5} speed={0.8} opacity={0.45} color="#22d3ee" />

      <HomeHeroScore3D />
    </group>
  );
}

function FloatingOrbs() {
  const orbs = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        angle: (i / 6) * Math.PI * 2,
        radius: 1.85 + (i % 2) * 0.25,
        y: Math.sin(i * 1.4) * 0.35,
        size: 0.04 + (i % 3) * 0.015,
        speed: 0.3 + i * 0.08,
        color: ["#818cf8", "#22d3ee", "#c084fc"][i % 3],
      })),
    []
  );

  const group = useRef<Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.children.forEach((child, i) => {
      const o = orbs[i];
      child.position.x = Math.cos(t * o.speed + o.angle) * o.radius;
      child.position.z = Math.sin(t * o.speed + o.angle) * o.radius;
      child.position.y = o.y + Math.sin(t * 1.2 + i) * 0.12;
    });
  });

  return (
    <group ref={group}>
      {orbs.map((o, i) => (
        <mesh key={i}>
          <sphereGeometry args={[o.size, 12, 12]} />
          <meshBasicMaterial color={o.color} transparent opacity={0.9} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function HeroSceneContent() {
  const group = useRef<Group>(null);
  const { viewport } = useThree();
  const offsetX = viewport.width > 7 ? viewport.width * 0.22 : viewport.width * 0.08;
  const scale = viewport.width > 7 ? 1.22 : 1.05;
  const autoYaw = useRef(0);
  const smoothPointer = useRef({ x: 0, y: 0 });

  useFrame((_, delta) => {
    if (!group.current) return;

    const damp = 1 - Math.exp(-6 * delta);
    smoothPointer.current.x += (heroPointerTarget.x - smoothPointer.current.x) * damp;
    smoothPointer.current.y += (heroPointerTarget.y - smoothPointer.current.y) * damp;

    autoYaw.current += delta * 0.045;
    group.current.rotation.y = autoYaw.current + smoothPointer.current.x * 0.14;
    group.current.rotation.x = smoothPointer.current.y * 0.1;
  });

  return (
    <group ref={group} position={[offsetX, 0, 0]} scale={scale}>
      <AuroraBackdrop />
      <NebulaField />
      <EnergyRings />
      <DataStreams />
      <FloatingOrbs />
      <ScoreNexus />
      {VISA_NODES.map((v) => (
        <HolographicVisa key={v.code} {...v} />
      ))}
    </group>
  );
}

export function HomeHeroScene({ onSceneReady }: { onSceneReady?: () => void }) {
  useEffect(() => {
    onSceneReady?.();
  }, [onSceneReady]);

  return (
    <>
      <fog attach="fog" args={["#eef2ff", 7, 20]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 6, 5]} intensity={1.1} color="#e0e7ff" />
      <directionalLight position={[-5, -2, -3]} intensity={0.45} color="#22d3ee" />
      <pointLight position={[0, 0, 1.5]} intensity={1.2} color="#818cf8" distance={10} />
      <pointLight position={[2, -1, 2]} intensity={0.5} color="#c084fc" distance={8} />
      <spotLight position={[0, 4, 3]} angle={0.4} penumbra={1} intensity={0.55} color="#a5b4fc" distance={14} />

      <Stars radius={80} depth={40} count={1200} factor={2.2} saturation={0.35} fade speed={0.35} />
      <Environment preset="night" environmentIntensity={0.65} />
      <HeroSceneContent />
    </>
  );
}
