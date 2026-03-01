'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { getCharacter } from '@/data/characters';
import { useGameStore } from '@/lib/store';

interface CharacterProps {
  characterId: string;
  initialPosition?: [number, number, number];
}

function CharacterFace({ characterId }: { characterId: string }) {
  // Only attempt to load for characters that actually have generated textures
  const hasTexture = characterId === 'sam' || characterId === 'mike';
  const texturePath = hasTexture ? `/textures/faces/${characterId}_face.png` : null;

  // useTexture can handle null, but we'll use a local fallback to be safe and avoid suspension issues
  const texture = useTexture(texturePath || '/textures/faces/sam_face.png', (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
  });

  if (!hasTexture) return null;

  return (
    <mesh position={[0, 0, 0.2]}>
      <planeGeometry args={[0.4, 0.4]} />
      <meshStandardMaterial
        map={texture}
        transparent
        alphaTest={0.5}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
}

export default function Character({ characterId }: CharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);

  const character = getCharacter(characterId);

  const characterPositions = useGameStore((state) => state.characterPositions);
  const characterAnimations = useGameStore((state) => state.characterAnimations);
  const characterStates = useGameStore((state) => state.characterStates);

  const position = characterPositions[characterId];
  const animation = characterAnimations[characterId] || 'idle';
  const state = characterStates[characterId];

  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    timeRef.current += delta;

    const walkSpeed = 8;
    const isWalking = animation === 'walk';

    const bobOffset = isWalking
      ? Math.abs(Math.sin(timeRef.current * walkSpeed)) * 0.1
      : Math.sin(timeRef.current * 2) * 0.02;

    groupRef.current.position.y = position.y + bobOffset;

    // Limb swinging
    if (isWalking) {
      const swingAngle = Math.sin(timeRef.current * walkSpeed) * 0.5;
      if (leftArmRef.current) leftArmRef.current.rotation.x = swingAngle;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -swingAngle;
      if (leftLegRef.current) leftLegRef.current.rotation.x = -swingAngle;
      if (rightLegRef.current) rightLegRef.current.rotation.x = swingAngle;
    } else {
      // Return to idle stance
      if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, 0.1);
      if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 0.1);
      if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, 0.1);
      if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, 0.1);
    }

    if (isWalking) {
      const dx = position.x - groupRef.current.position.x;
      const dz = position.z - groupRef.current.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist > 0.1) {
        groupRef.current.position.x += dx * delta * 2;
        groupRef.current.position.z += dz * delta * 2;

        // Rotate character towards movement direction
        const targetRotation = Math.atan2(dx, dz);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          targetRotation,
          0.1
        );
      }
    } else {
      groupRef.current.position.x = position.x;
      groupRef.current.position.z = position.z;
    }
  });

  if (state === 'dead') return null;

  const skinMat = <meshStandardMaterial color="#ffdbac" roughness={0.8} />;
  const clothingMat = <meshStandardMaterial color={character.color} roughness={0.7} />;

  return (
    <group ref={groupRef} position={[position.x, 0, position.z]}>
      {/* Head */}
      <mesh castShadow position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.22, 32, 32]} />
        {skinMat}
      </mesh>

      {/* Character Specific Hair/Features */}
      {characterId === 'sam' && (
        <group position={[0, 1.6, 0]}>
          <mesh position={[0, 0.1, -0.05]}>
            <sphereGeometry args={[0.23, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial color="#d4af37" />
          </mesh>
          <mesh position={[0, -0.1, -0.2]} rotation={[-0.5, 0, 0]}>
            <capsuleGeometry args={[0.05, 0.3, 4, 8]} />
            <meshStandardMaterial color="#d4af37" />
          </mesh>
        </group>
      )}
      {characterId === 'mike' && (
        <mesh position={[0, 1.7, 0]}>
          <sphereGeometry args={[0.23, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      )}
      {(characterId === 'jessica' || characterId === 'emily') && (
        <group position={[0, 1.6, 0]}>
          <mesh position={[0, 0, -0.05]}>
            <sphereGeometry args={[0.24, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
            <meshStandardMaterial color={characterId === 'jessica' ? '#f3e5ab' : '#111'} />
          </mesh>
          <mesh position={[0.15, -0.2, -0.1]}>
            <capsuleGeometry args={[0.04, 0.4, 4, 8]} />
            <meshStandardMaterial color={characterId === 'jessica' ? '#f3e5ab' : '#111'} />
          </mesh>
          <mesh position={[-0.15, -0.2, -0.1]}>
            <capsuleGeometry args={[0.04, 0.4, 4, 8]} />
            <meshStandardMaterial color={characterId === 'jessica' ? '#f3e5ab' : '#111'} />
          </mesh>
        </group>
      )}
      {characterId === 'ashley' && (
        <mesh position={[0, 1.75, 0]}>
          <sphereGeometry args={[0.24, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
          <meshStandardMaterial color="#8b0000" /> {/* Beanie */}
        </mesh>
      )}
      {characterId === 'chris' && (
        <group position={[0, 1.6, 0]}>
          <mesh position={[0, 1.73, 0]}>
            <sphereGeometry args={[0.23, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
            <meshStandardMaterial color="#5c4033" />
          </mesh>
          <mesh position={[0, 0.05, 0.2]}>
            <torusGeometry args={[0.1, 0.01, 8, 32]} />
            <meshStandardMaterial color="#000" />
          </mesh>
        </group>
      )}
      {(characterId === 'josh' || characterId === 'matt') && (
        <mesh position={[0, 1.72, 0]}>
          <sphereGeometry args={[0.23, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
          <meshStandardMaterial color={characterId === 'josh' ? '#333' : '#111'} />
        </mesh>
      )}

      {/* Face Overlay */}
      <group position={[0, 1.6, 0]}>
        <CharacterFace characterId={characterId} />
      </group>

      {/* Torso - Stylish humanoid shape */}
      <mesh castShadow position={[0, 1, 0]}>
        <capsuleGeometry args={[0.22, 0.65, 8, 16]} />
        {clothingMat}
      </mesh>

      {/* Left arm */}
      <group position={[-0.3, 1.25, 0]} ref={leftArmRef}>
        <mesh castShadow position={[0, -0.25, 0]}>
          <capsuleGeometry args={[0.07, 0.45, 4, 8]} />
          {clothingMat}
        </mesh>
        <mesh position={[0, -0.55, 0]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          {skinMat}
        </mesh>
      </group>

      {/* Right arm */}
      <group position={[0.3, 1.25, 0]} ref={rightArmRef}>
        <mesh castShadow position={[0, -0.25, 0]}>
          <capsuleGeometry args={[0.07, 0.45, 4, 8]} />
          {clothingMat}
        </mesh>
        <mesh position={[0, -0.55, 0]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          {skinMat}
        </mesh>
      </group>

      {/* Left leg */}
      <group position={[-0.12, 0.65, 0]} ref={leftLegRef}>
        <mesh castShadow position={[0, -0.4, 0]}>
          <capsuleGeometry args={[0.1, 0.7, 4, 8]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      </group>

      {/* Right leg */}
      <group position={[0.12, 0.65, 0]} ref={rightLegRef}>
        <mesh castShadow position={[0, -0.4, 0]}>
          <capsuleGeometry args={[0.1, 0.7, 4, 8]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      </group>
    </group>
  );
}
