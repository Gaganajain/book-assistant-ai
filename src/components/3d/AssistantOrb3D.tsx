import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CanvasErrorBoundary } from './CanvasErrorBoundary';

interface AssistantOrb3DProps {
  state?: 'idle' | 'thinking' | 'speaking';
  size?: number;
  className?: string;
}

const OrbMesh: React.FC<{ state: 'idle' | 'thinking' | 'speaking' }> = ({ state }) => {
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((sceneState, delta) => {
    const t = sceneState.clock.getElapsedTime();

    const speed = state === 'thinking' ? 3.5 : state === 'speaking' ? 2 : 1;

    // Outer crystal rotation
    if (outerRef.current) {
      outerRef.current.rotation.x = t * 0.4 * speed;
      outerRef.current.rotation.y = t * 0.6 * speed;
      const pulse = state === 'thinking' ? 1 + Math.sin(t * 8) * 0.08 : 1 + Math.sin(t * 2) * 0.03;
      outerRef.current.scale.setScalar(pulse);
    }

    // Inner core
    if (innerRef.current) {
      innerRef.current.rotation.y = -t * 0.8 * speed;
      const corePulse = state === 'thinking' ? 1 + Math.cos(t * 10) * 0.15 : 1;
      innerRef.current.scale.setScalar(corePulse);
    }

    // Orbital rings
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += delta * 1.2 * speed;
      ring1Ref.current.rotation.y += delta * 0.8 * speed;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * 1.4 * speed;
      ring2Ref.current.rotation.z += delta * 0.6 * speed;
    }
  });

  const coreColor = state === 'thinking' ? '#38bdf8' : state === 'speaking' ? '#10b981' : '#6366f1';
  const wireColor = state === 'thinking' ? '#93c5fd' : '#a5b4fc';

  return (
    <group>
      {/* Inner Glowing Core */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial
          color={coreColor}
          emissive={coreColor}
          emissiveIntensity={state === 'thinking' ? 1.8 : 0.9}
          roughness={0.2}
        />
      </mesh>

      {/* Outer Holographic Crystal Cage */}
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[0.95, 0]} />
        <meshStandardMaterial
          color={wireColor}
          emissive={wireColor}
          emissiveIntensity={0.5}
          wireframe
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Orbiting Ring 1 */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[1.2, 0.015, 16, 64]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.6} />
      </mesh>

      {/* Orbiting Ring 2 */}
      <mesh ref={ring2Ref} rotation={[-Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[1.35, 0.012, 16, 64]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.5} />
      </mesh>

      <pointLight color={coreColor} intensity={2} distance={3} />
    </group>
  );
};

export const AssistantOrb3D: React.FC<AssistantOrb3DProps> = ({
  state = 'idle',
  className = 'w-10 h-10',
}) => {
  return (
    <div className={`relative select-none flex items-center justify-center ${className}`}>
      <CanvasErrorBoundary fallback={<div className="w-full h-full rounded-full bg-indigo-500/20 animate-pulse" />}>
        <Canvas
          camera={{ position: [0, 0, 3.2], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
          className="w-full h-full pointer-events-none"
        >
          <ambientLight intensity={1} />
          <directionalLight position={[2, 3, 2]} intensity={1.2} />
          <OrbMesh state={state} />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
};
