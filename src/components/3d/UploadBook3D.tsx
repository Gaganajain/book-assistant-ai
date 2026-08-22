import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CanvasErrorBoundary } from './CanvasErrorBoundary';

interface UploadBook3DProps {
  isDragActive?: boolean;
  isProcessing?: boolean;
  progress?: number;
  className?: string;
}

const InteractiveUploadMesh: React.FC<{
  isDragActive: boolean;
  isProcessing: boolean;
  progress: number;
}> = ({ isDragActive, isProcessing, progress }) => {
  const bookRef = useRef<THREE.Group>(null);
  const leftCoverRef = useRef<THREE.Group>(null);
  const rightCoverRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const scanBeamRef = useRef<THREE.Mesh>(null);

  // Dynamic animations based on state
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    if (bookRef.current) {
      // Floating motion
      const floatSpeed = isDragActive ? 4 : isProcessing ? 2.5 : 1.2;
      const floatHeight = isDragActive ? 0.25 : 0.12;
      bookRef.current.position.y = Math.sin(t * floatSpeed) * floatHeight;

      // Rotation
      if (isProcessing) {
        bookRef.current.rotation.y += delta * 1.5;
        bookRef.current.rotation.x = THREE.MathUtils.damp(
          bookRef.current.rotation.x,
          0.35,
          4,
          delta
        );
      } else if (isDragActive) {
        bookRef.current.rotation.y = Math.sin(t * 2) * 0.2;
        bookRef.current.rotation.x = THREE.MathUtils.damp(
          bookRef.current.rotation.x,
          0.6,
          5,
          delta
        );
      } else {
        bookRef.current.rotation.y = Math.sin(t * 0.8) * 0.15;
        bookRef.current.rotation.x = THREE.MathUtils.damp(
          bookRef.current.rotation.x,
          0.35,
          3,
          delta
        );
      }
    }

    // Dynamic cover opening angles
    const targetLeftAngle = isDragActive ? 0.65 : isProcessing ? 0.5 : 0.38;
    const targetRightAngle = isDragActive ? -0.65 : isProcessing ? -0.5 : -0.38;

    if (leftCoverRef.current) {
      leftCoverRef.current.rotation.y = THREE.MathUtils.damp(
        leftCoverRef.current.rotation.y,
        targetLeftAngle,
        5,
        delta
      );
    }
    if (rightCoverRef.current) {
      rightCoverRef.current.rotation.y = THREE.MathUtils.damp(
        rightCoverRef.current.rotation.y,
        targetRightAngle,
        5,
        delta
      );
    }

    // Energy Vortex Ring
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 2;
      ringRef.current.scale.setScalar(
        isDragActive ? 1.2 + Math.sin(t * 5) * 0.1 : 1 + Math.sin(t * 2) * 0.05
      );
    }

    // Laser Scan Beam for Processing
    if (scanBeamRef.current && isProcessing) {
      scanBeamRef.current.position.y = Math.sin(t * 4) * 0.8;
      scanBeamRef.current.scale.x = 1 + Math.sin(t * 8) * 0.1;
    }
  });

  return (
    <group>
      {/* Dynamic Book */}
      <group ref={bookRef} scale={[0.7, 0.7, 0.7]}>
        {/* Spine */}
        <mesh position={[0, -0.04, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 2.6, 16]} />
          <meshStandardMaterial color="#312e81" roughness={0.3} metalness={0.4} />
        </mesh>

        {/* Left Side */}
        <group ref={leftCoverRef} position={[-0.05, 0, 0]}>
          <mesh position={[-0.9, -0.05, 0]} castShadow>
            <boxGeometry args={[1.8, 0.06, 2.7]} />
            <meshStandardMaterial
              color={isDragActive ? '#4f46e5' : '#1e1b4b'}
              roughness={0.3}
              metalness={0.4}
              emissive={isDragActive ? '#4338ca' : '#000000'}
              emissiveIntensity={isDragActive ? 0.3 : 0}
            />
          </mesh>
          <mesh position={[-0.85, 0.08, 0]} castShadow>
            <boxGeometry args={[1.7, 0.2, 2.5]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.7} />
          </mesh>
        </group>

        {/* Right Side */}
        <group ref={rightCoverRef} position={[0.05, 0, 0]}>
          <mesh position={[0.9, -0.05, 0]} castShadow>
            <boxGeometry args={[1.8, 0.06, 2.7]} />
            <meshStandardMaterial
              color={isDragActive ? '#4f46e5' : '#1e1b4b'}
              roughness={0.3}
              metalness={0.4}
              emissive={isDragActive ? '#4338ca' : '#000000'}
              emissiveIntensity={isDragActive ? 0.3 : 0}
            />
          </mesh>
          <mesh position={[0.85, 0.08, 0]} castShadow>
            <boxGeometry args={[1.7, 0.2, 2.5]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.7} />
          </mesh>
        </group>

        {/* Laser / Scanner beam when processing */}
        {isProcessing && (
          <mesh ref={scanBeamRef} position={[0, 0, 0]} rotation={[0, 0, 0]}>
            <boxGeometry args={[2.8, 0.04, 2.8]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.75}
              wireframe
            />
          </mesh>
        )}
      </group>

      {/* Orbiting Energy Ring */}
      <mesh ref={ringRef} position={[0, -0.2, 0]} rotation={[Math.PI / 2.5, 0, 0]}>
        <torusGeometry args={[1.4, 0.02, 16, 64]} />
        <meshStandardMaterial
          color={isDragActive ? '#6366f1' : isProcessing ? '#06b6d4' : '#818cf8'}
          emissive={isDragActive ? '#6366f1' : isProcessing ? '#06b6d4' : '#6366f1'}
          emissiveIntensity={isDragActive || isProcessing ? 1.5 : 0.6}
          roughness={0.2}
        />
      </mesh>

      {/* Point Lights */}
      <pointLight
        position={[0, 1, 0.5]}
        color={isDragActive ? '#818cf8' : isProcessing ? '#38bdf8' : '#6366f1'}
        intensity={isDragActive ? 2.5 : isProcessing ? 2.2 : 1.2}
        distance={4}
      />
    </group>
  );
};

export const UploadBook3D: React.FC<UploadBook3DProps> = ({
  isDragActive = false,
  isProcessing = false,
  progress = 0,
  className = 'w-36 h-36',
}) => {
  return (
    <div className={`relative select-none flex items-center justify-center ${className}`}>
      <CanvasErrorBoundary>
        <Canvas
          camera={{ position: [0, 0.8, 3.6], fov: 40 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
          className="w-full h-full pointer-events-none"
        >
          <ambientLight intensity={1.2} />
          <directionalLight position={[3, 5, 4]} intensity={1.5} />
          <directionalLight position={[-3, 2, -2]} intensity={0.6} color="#818cf8" />
          <InteractiveUploadMesh
            isDragActive={isDragActive}
            isProcessing={isProcessing}
            progress={progress}
          />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
};
