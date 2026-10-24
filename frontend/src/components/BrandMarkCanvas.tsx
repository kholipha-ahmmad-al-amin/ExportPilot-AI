import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Interactive 3D echo of the Master Favicon mark: three flat container ribs
 * and an upward arrow volume, flat-shaded, cursor-reactive, theme-aware.
 * Pure geometry only: no lights beyond ambient + one directional, no glow.
 */

interface RigProps {
  accent: string;
  cut: string;
}

function MarkRig({ accent, cut }: RigProps) {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    const g = group.current;
    // Gentle idle rotation plus cursor parallax.
    g.rotation.y += delta * 0.18;
    const targetX = state.pointer.y * 0.25;
    const targetZ = state.pointer.x * 0.35;
    g.rotation.x += (targetX - g.rotation.x) * 0.06;
    g.rotation.z += (targetZ - g.rotation.z) * 0.06;
  });

  return (
    <group ref={group}>
      {/* Container tile */}
      <RoundedBoxMesh args={[2.1, 2.1, 0.24]} radius={0.3} color={accent} />
      {/* Upward arrow: triangular head + shaft, extruded forward */}
      <mesh position={[0, 0.28, 0.16]}>
        <extrudeGeometry
          args={[
            new THREE.Shape([
              new THREE.Vector2(-0.36, 0.44),
              new THREE.Vector2(0.36, 0.44),
              new THREE.Vector2(0, 1.0),
            ]),
            { depth: 0.08, bevelEnabled: false },
          ]}
        />
        <meshStandardMaterial color={cut} flatShading />
      </mesh>
      <mesh position={[0, -0.12, 0.16]}>
        <boxGeometry args={[0.26, 0.62, 0.08]} />
        <meshStandardMaterial color={cut} flatShading />
      </mesh>
      {/* Three corrugation ribs */}
      {[0.62, 0.86, 1.1].map((y, i) => (
        <mesh key={i} position={[0, -y + 0.06, 0.16]}>
          <boxGeometry args={[0.92, 0.11, 0.08]} />
          <meshStandardMaterial color={cut} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function RoundedBoxMesh({ args, radius, color }: { args: [number, number, number]; radius: number; color: string }) {
  const shape = useMemo(() => {
    const [w, h] = args;
    const s = new THREE.Shape();
    const x = w / 2;
    const y = h / 2;
    s.moveTo(-x + radius, -y);
    s.lineTo(x - radius, -y);
    s.quadraticCurveTo(x, -y, x, -y + radius);
    s.lineTo(x, y - radius);
    s.quadraticCurveTo(x, y, x - radius, y);
    s.lineTo(-x + radius, y);
    s.quadraticCurveTo(-x, y, -x, y - radius);
    s.lineTo(-x, -y + radius);
    s.quadraticCurveTo(-x, -y, -x + radius, -y);
    return s;
  }, [args, radius]);

  return (
    <mesh>
      <extrudeGeometry args={[shape, { depth: 0.24, bevelEnabled: false }]} />
      <meshStandardMaterial color={color} flatShading />
    </mesh>
  );
}

export const BrandMarkCanvas: React.FC<{ theme: 'light' | 'dark' }> = ({ theme }) => {
  const accent = theme === 'dark' ? '#10B981' : '#047857';
  const cut = theme === 'dark' ? '#0B1120' : '#FFFFFF';

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 4.2], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 5]} intensity={theme === 'dark' ? 0.9 : 1.1} />
      <MarkRig accent={accent} cut={cut} />
    </Canvas>
  );
};
