import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface ProceduralBookProps {
  scale?: number;
  interactive?: boolean;
  mousePosition?: { x: number; y: number };
  glowColor?: string;
  isHovered?: boolean;
}

export const ProceduralBook: React.FC<ProceduralBookProps> = ({
  scale = 1,
  interactive = true,
  mousePosition = { x: 0, y: 0 },
  glowColor = '#6366f1',
  isHovered = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const floatingGroupRef = useRef<THREE.Group>(null);
  const leftPagesRef = useRef<THREE.Mesh>(null);
  const rightPagesRef = useRef<THREE.Mesh>(null);
  const pageFlutter1Ref = useRef<THREE.Group>(null);
  const pageFlutter2Ref = useRef<THREE.Group>(null);
  const ribbonRef = useRef<THREE.Mesh>(null);

  // Generate a procedural text/diagram texture for open pages
  const pageTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Warm parchment background
      ctx.fillStyle = '#fbf9f4';
      ctx.fillRect(0, 0, 512, 512);

      // Header line
      ctx.fillStyle = '#6366f1';
      ctx.fillRect(40, 45, 120, 8);

      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(360, 48, 100, 4);

      // Chapter title
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(40, 75, 220, 14);

      // Paragraph lines
      ctx.fillStyle = '#475569';
      for (let y = 115; y < 440; y += 18) {
        const width = 180 + Math.sin(y * 0.1) * 30;
        ctx.fillRect(40, y, width, 5);
      }

      // Diagram / Chart box on the right
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.strokeRect(280, 120, 180, 130);

      ctx.fillStyle = '#e0e7ff';
      ctx.fillRect(290, 130, 160, 110);

      ctx.fillStyle = '#4f46e5';
      ctx.beginPath();
      ctx.moveTo(300, 220);
      ctx.lineTo(340, 170);
      ctx.lineTo(380, 190);
      ctx.lineTo(430, 145);
      ctx.lineWidth = 3;
      ctx.stroke();

      // Second paragraph
      ctx.fillStyle = '#475569';
      for (let y = 275; y < 440; y += 18) {
        const width = 175 + Math.cos(y * 0.12) * 25;
        ctx.fillRect(280, y, width, 5);
      }

      // Footer page numbers
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('p. 42', 40, 480);
      ctx.fillText('p. 43', 430, 480);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    return texture;
  }, []);

  // Procedural cover texture with subtle embossing
  const coverTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Deep elegant midnight blue
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 512, 512);

      // Gold/Indigo border filigree
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 6;
      ctx.strokeRect(30, 30, 452, 452);

      ctx.strokeStyle = '#c7d2fe';
      ctx.lineWidth = 2;
      ctx.strokeRect(45, 45, 422, 422);

      // Subtle geometric diamond in center
      ctx.strokeStyle = '#a5b4fc';
      ctx.beginPath();
      ctx.moveTo(256, 180);
      ctx.lineTo(316, 256);
      ctx.lineTo(256, 332);
      ctx.lineTo(196, 256);
      ctx.closePath();
      ctx.stroke();
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    if (floatingGroupRef.current) {
      // Gentle floating levitation
      floatingGroupRef.current.position.y = Math.sin(t * 1.4) * 0.12;
      floatingGroupRef.current.rotation.z = Math.sin(t * 0.9) * 0.03;
    }

    if (groupRef.current && interactive) {
      // Target rotation based on mouse parallax + natural idle turn
      const targetRotX = 0.45 + mousePosition.y * 0.35 + (isHovered ? -0.1 : 0);
      const targetRotY = mousePosition.x * 0.5 + Math.sin(t * 0.4) * 0.08;
      const targetRotZ = -mousePosition.x * 0.15;

      groupRef.current.rotation.x = THREE.MathUtils.damp(
        groupRef.current.rotation.x,
        targetRotX,
        4,
        delta
      );
      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        targetRotY,
        4,
        delta
      );
      groupRef.current.rotation.z = THREE.MathUtils.damp(
        groupRef.current.rotation.z,
        targetRotZ,
        4,
        delta
      );
    }

    // Page fluttering animation
    if (pageFlutter1Ref.current) {
      pageFlutter1Ref.current.rotation.y =
        -0.15 + Math.sin(t * 2.8) * 0.08 + (isHovered ? Math.sin(t * 6) * 0.12 : 0);
    }
    if (pageFlutter2Ref.current) {
      pageFlutter2Ref.current.rotation.y =
        0.18 + Math.cos(t * 2.2) * 0.06 + (isHovered ? Math.cos(t * 5.5) * 0.1 : 0);
    }

    // Ribbon sway
    if (ribbonRef.current) {
      ribbonRef.current.rotation.z = Math.sin(t * 1.8) * 0.08;
    }
  });

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      <group ref={floatingGroupRef}>
        {/* Central Book Spine / Binding */}
        <mesh position={[0, -0.05, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.22, 0.22, 3.4, 16, 1, false, Math.PI, Math.PI]} />
          <meshStandardMaterial
            color="#1e1b4b"
            roughness={0.4}
            metalness={0.2}
          />
        </mesh>

        {/* Left Hard Cover */}
        <group position={[-0.08, 0, 0]} rotation={[0, 0.38, 0]}>
          <mesh position={[-1.25, -0.06, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.45, 0.08, 3.5]} />
            <meshStandardMaterial
              map={coverTexture}
              color="#1e1b4b"
              roughness={0.35}
              metalness={0.25}
            />
          </mesh>

          {/* Left Page Block (Stack) */}
          <mesh ref={leftPagesRef} position={[-1.2, 0.12, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.3, 0.26, 3.3]} />
            <meshStandardMaterial
              color="#f8fafc"
              roughness={0.8}
            />
          </mesh>

          {/* Left Top Page Surface */}
          <mesh position={[-1.2, 0.255, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[2.28, 3.28]} />
            <meshStandardMaterial
              map={pageTexture}
              roughness={0.65}
            />
          </mesh>
        </group>

        {/* Right Hard Cover */}
        <group position={[0.08, 0, 0]} rotation={[0, -0.38, 0]}>
          <mesh position={[1.25, -0.06, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.45, 0.08, 3.5]} />
            <meshStandardMaterial
              map={coverTexture}
              color="#1e1b4b"
              roughness={0.35}
              metalness={0.25}
            />
          </mesh>

          {/* Right Page Block (Stack) */}
          <mesh ref={rightPagesRef} position={[1.2, 0.12, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.3, 0.26, 3.3]} />
            <meshStandardMaterial
              color="#f8fafc"
              roughness={0.8}
            />
          </mesh>

          {/* Right Top Page Surface */}
          <mesh position={[1.2, 0.255, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[2.28, 3.28]} />
            <meshStandardMaterial
              map={pageTexture}
              roughness={0.65}
            />
          </mesh>
        </group>

        {/* Dynamic Turning / Fluttering Page 1 (Left leaning) */}
        <group ref={pageFlutter1Ref} position={[0, 0.26, 0]}>
          <mesh position={[-1.1, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.2, 3.26, 4, 4]} />
            <meshStandardMaterial
              map={pageTexture}
              color="#ffffff"
              side={THREE.DoubleSide}
              roughness={0.7}
            />
          </mesh>
        </group>

        {/* Dynamic Turning / Fluttering Page 2 (Right leaning) */}
        <group ref={pageFlutter2Ref} position={[0, 0.26, 0]}>
          <mesh position={[1.1, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.2, 3.26, 4, 4]} />
            <meshStandardMaterial
              map={pageTexture}
              color="#ffffff"
              side={THREE.DoubleSide}
              roughness={0.7}
            />
          </mesh>
        </group>

        {/* Silk Bookmark Ribbon */}
        <group position={[0, 0.28, -1.6]}>
          <mesh ref={ribbonRef} position={[0.1, -0.6, 0.4]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.14, 0.02, 1.8]} />
            <meshStandardMaterial
              color="#f59e0b"
              roughness={0.3}
              metalness={0.4}
              emissive="#d97706"
              emissiveIntensity={0.2}
            />
          </mesh>
        </group>

        {/* Holographic Glowing Auras & Particles emanating from book */}
        <pointLight
          position={[0, 0.8, 0]}
          color={glowColor}
          intensity={isHovered ? 2.5 : 1.4}
          distance={5}
        />
        <pointLight
          position={[0, -0.5, 0.5]}
          color="#38bdf8"
          intensity={0.8}
          distance={3.5}
        />
      </group>
    </group>
  );
};
