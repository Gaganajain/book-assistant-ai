import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ProceduralBook } from './ProceduralBook';
import { CanvasErrorBoundary } from './CanvasErrorBoundary';

// Floating Particles in the background
const AmbientParticles: React.FC<{ count?: number; color?: string }> = ({
  count = 90,
  color = '#818cf8',
}) => {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, scales] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sca = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
      sca[i] = Math.random() * 0.08 + 0.02;
    }
    return [pos, sca];
  }, [count]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * 0.04;
      pointsRef.current.rotation.x = Math.sin(t * 0.02) * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        color={color}
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// Subtle Floating Holographic Nodes (Representing Knowledge & Citations)
const FloatingKnowledgeNodes: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = -t * 0.06;
    }
  });

  const nodes = [
    { pos: [-3.2, 1.4, -1] as [number, number, number], color: '#6366f1', size: 0.12 },
    { pos: [3.4, 0.8, -1.5] as [number, number, number], color: '#38bdf8', size: 0.1 },
    { pos: [-2.6, -1.6, 0.5] as [number, number, number], color: '#f59e0b', size: 0.08 },
    { pos: [2.8, -1.2, 0.2] as [number, number, number], color: '#10b981', size: 0.09 },
  ];

  return (
    <group ref={groupRef}>
      {nodes.map((n, i) => (
        <mesh key={i} position={n.pos}>
          <octahedronGeometry args={[n.size]} />
          <meshStandardMaterial
            color={n.color}
            emissive={n.color}
            emissiveIntensity={0.6}
            wireframe
          />
        </mesh>
      ))}
    </group>
  );
};

export const Hero3DScene: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      setMousePos({
        x: Math.max(-1, Math.min(1, x)),
        y: Math.max(-1, Math.min(1, y)),
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full h-[360px] sm:h-[420px] md:h-[480px] select-none ${className}`}
    >
      <CanvasErrorBoundary>
        <Canvas
          camera={{ position: [0, 0.9, 5.2], fov: 42 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          className="w-full h-full pointer-events-none"
        >
          {/* Lighting */}
          <ambientLight intensity={1.1} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.8}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight
            position={[-5, 4, -3]}
            intensity={0.9}
            color="#818cf8"
          />
          <pointLight
            position={[0, -2, 3]}
            intensity={0.6}
            color="#38bdf8"
          />

          {/* 3D Floating Book */}
          <ProceduralBook
            scale={0.95}
            interactive={true}
            mousePosition={mousePos}
            isHovered={isHovered}
            glowColor="#6366f1"
          />

          {/* Atmospheric Elements */}
          <AmbientParticles count={110} color="#818cf8" />
          <FloatingKnowledgeNodes />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
};
