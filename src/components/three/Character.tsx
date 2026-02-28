'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getCharacter } from '@/data/characters';
import { useGameStore } from '@/lib/store';

interface CharacterProps {
  characterId: string;
  initialPosition?: [number, number, number];
}

function CharacterFace({ color }: { color: string }) {
  const faceTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 128, 128);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(40, 50, 12, 0, Math.PI * 2);
    ctx.arc(88, 50, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#222222';
    ctx.beginPath();
    ctx.arc(40, 50, 5, 0, Math.PI * 2);
    ctx.arc(88, 50, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(64, 75, 20, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    return new THREE.CanvasTexture(canvas);
  }, [color]);

  if (!faceTexture) return null;

  return (
    <mesh position={[0, 0, 0.26]}>
      <planeGeometry args={[0.42, 0.42]} />
      <meshBasicMaterial map={faceTexture} transparent />
    </mesh>
  );
}

export default function Character({ characterId }: CharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
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

    const bobOffset =
      animation === 'walk'
        ? Math.sin(timeRef.current * 8) * 0.1
        : Math.sin(timeRef.current * 2) * 0.05;

    groupRef.current.position.y = position.y + bobOffset;

    if (animation === 'walk') {
      const dx = position.x - groupRef.current.position.x;
      const dz = position.z - groupRef.current.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist > 0.1) {
        groupRef.current.position.x += dx * delta * 2;
        groupRef.current.position.z += dz * delta * 2;
      }
    } else {
      groupRef.current.position.x = position.x;
      groupRef.current.position.z = position.z;
    }
  });

  if (state === 'dead') return null;

  const mat = <meshStandardMaterial color={character.color} roughness={0.7} />;

  return (
    <group ref={groupRef} position={[position.x, 0, position.z]}>
      {/* Head */}
      <mesh castShadow position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.25, 8, 8]} />
        {mat}
      </mesh>
      {/* Face on head front */}
      <group position={[0, 1.6, 0]}>
        <CharacterFace color={character.color} />
      </group>

      {/* Torso */}
      <mesh castShadow position={[0, 1.05, 0]}>
        <boxGeometry args={[0.5, 0.6, 0.25]} />
        {mat}
      </mesh>

      {/* Left arm */}
      <mesh castShadow position={[-0.38, 1.05, 0]} rotation={[0, 0, 0.25]}>
        <boxGeometry args={[0.18, 0.52, 0.18]} />
        {mat}
      </mesh>

      {/* Right arm */}
      <mesh castShadow position={[0.38, 1.05, 0]} rotation={[0, 0, -0.25]}>
        <boxGeometry args={[0.18, 0.52, 0.18]} />
        {mat}
      </mesh>

      {/* Left leg */}
      <mesh castShadow position={[-0.13, 0.42, 0]}>
        <boxGeometry args={[0.22, 0.52, 0.22]} />
        {mat}
      </mesh>

      {/* Right leg */}
      <mesh castShadow position={[0.13, 0.42, 0]}>
        <boxGeometry args={[0.22, 0.52, 0.22]} />
        {mat}
      </mesh>
    </group>
  );
}
