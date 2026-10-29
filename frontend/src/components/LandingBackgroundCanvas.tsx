import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAuth } from '../context/AuthContext';

/**
 * Ambient 3D landing background: a sparse field of flat-shaded container
 * tiles (echoing the master brand mark) drifting on a slow orbital current
 * with a subtle architectural wireframe grid plane. Theme-aware, dpr-capped,
 * zero glow. Purpose: give the landing page spatial depth without
 * decorative gimmickry. The tiles echo the container face from the brand
 * mark, grounding the background in the platform's domain (cargo, export).
 */

const TILE_COUNT = 14;

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

interface TileProps {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  color: string;
  speed: number;
}

function ContainerTile({ position, rotation, scale, color, speed }: TileProps) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.z += delta * speed * 0.3;
    mesh.current.position.y += Math.sin(state.clock.elapsedTime * speed * 0.4) * delta * 0.08;
  });

  return (
    <mesh ref={mesh} position={position} rotation={rotation} scale={scale}>
      <boxGeometry args={[1, 1, 0.18]} />
      <meshStandardMaterial color={color} flatShading transparent opacity={0.45} roughness={0.9} metalness={0} />
    </mesh>
  );
}

function GridPlane({ color }: { color: string }) {
  return (
    <group rotation={[-Math.PI / 2.4, 0, 0]} position={[0, -2.2, 0]}>
      <gridHelper args={[24, 24, color, color]} />
      {/* Fade the grid with distance using a fog-like fade plane */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[48, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.0} />
      </mesh>
    </group>
  );
}

function TileField({ theme }: { theme: 'light' | 'dark' }) {
  const group = useRef<THREE.Group>(null);
  const rand = useMemo(() => seededRandom(42), []);

  const tiles = useMemo(() => {
    const items: TileProps[] = [];
    for (let i = 0; i < TILE_COUNT; i++) {
      const angle = rand() * Math.PI * 2;
      const radius = 3 + rand() * 5;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius - 2;
      const y = (rand() - 0.4) * 3.5;
      const rot: [number, number, number] = [rand() * 0.4, rand() * Math.PI, rand() * 0.3];
      const scale = 0.3 + rand() * 0.5;
      const speed = 0.2 + rand() * 0.5;
      items.push({ position: [x, y, z], rotation: rot, scale, color: '', speed });
    }
    return items;
  }, [rand]);

  const tileColor = theme === 'dark' ? '#0E8A5F' : '#069669';
  const gridColor = theme === 'dark' ? '#1C2940' : '#E2E8F0';

  useFrame((_state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <group ref={group}>
      <GridPlane color={gridColor} />
      {tiles.map((t, i) => (
        <ContainerTile key={i} {...t} color={tileColor} />
      ))}
    </group>
  );
}

/**
 * Full-viewport ambient background. Mount as a fixed-position layer behind
 * the landing page content. Uses pointer-events: none so it never
 * intercepts clicks. Theme-aware, dpr [1, 1.5], flat-shaded, no glow.
 */
export const LandingBackgroundCanvas: React.FC<{ theme: 'light' | 'dark' }> = ({ theme }) => {
  const { liteMode } = useAuth();
  if (liteMode) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.5, 9], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 6, 8]} intensity={theme === 'dark' ? 0.5 : 0.7} />
        <TileField theme={theme} />
      </Canvas>
    </div>
  );
};
