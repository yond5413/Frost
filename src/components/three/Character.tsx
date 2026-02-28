'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';

import { getCharacter } from '@/data/characters';
import { useGameStore } from '@/lib/store';

interface CharacterProps {
  characterId: string;
  initialPosition?: [number, number, number];
}

const CAPSULE_HEIGHT = 1.8;
const CAPSULE_RADIUS = 0.3;

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

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, [color]);

  if (!faceTexture) return null;

  return (
    <mesh>
      <planeGeometry args={[0.5, 0.5]} />
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

    let bobOffset = 0;
    if (animation === 'walk') {
      bobOffset = Math.sin(timeRef.current * 8) * 0.1;
    } else {
      bobOffset = Math.sin(timeRef.current * 2) * 0.05;
    }

    groupRef.current.position.y = position.y + CAPSULE_HEIGHT / 2 + bobOffset;

    if (animation === 'walk') {
      const targetX = position.x;
      const targetZ = position.z;
      const dx = targetX - groupRef.current.position.x;
      const dz = targetZ - groupRef.current.position.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      if (distance > 0.1) {
        groupRef.current.position.x += dx * delta * 2;
        groupRef.current.position.z += dz * delta * 2;
      }
    } else {
      groupRef.current.position.x = position.x;
      groupRef.current.position.z = position.z;
    }
  });

  if (state === 'dead') return null;

  return (
    <group ref={groupRef} position={[position.x, 0, position.z]}>
      <mesh castShadow position={[0, CAPSULE_HEIGHT / 2, 0]}>
        <capsuleGeometry args={[CAPSULE_RADIUS, CAPSULE_HEIGHT - CAPSULE_RADIUS * 2, 4, 8]} />
        <meshStandardMaterial color={character.color} roughness={0.7} />
      </mesh>
      
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        <CharacterFace color={character.color} />
      </Billboard>
    </group>
  );
}
