'use client';

import { useRef } from 'react';
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
  const hasTexture = characterId === 'sam' || characterId === 'mike';
  const texturePath = hasTexture ? `/textures/faces/${characterId}_face.png` : null;

  const texture = useTexture(texturePath || '/textures/faces/sam_face.png', (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
  });

  if (!hasTexture) return null;

  return (
    <mesh position={[0, 0, 0.22]}>
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

function ScaredEyes({ intensity = 1 }: { intensity?: number }) {
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (leftEyeRef.current && rightEyeRef.current) {
      const shake = Math.sin(state.clock.elapsedTime * 15) * 0.01 * intensity;
      leftEyeRef.current.position.x = -0.06 + shake;
      rightEyeRef.current.position.x = 0.06 + shake;
    }
  });

  return (
    <>
      <mesh ref={leftEyeRef} position={[-0.06, 0.05, 0.18]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh ref={rightEyeRef} position={[0.06, 0.05, 0.18]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.06, 0.05, 0.19]}>
        <sphereGeometry args={[0.02, 6, 6]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      <mesh position={[0.06, 0.05, 0.19]}>
        <sphereGeometry args={[0.02, 6, 6]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
    </>
  );
}

function ShockedMouth() {
  return (
    <mesh position={[0, -0.08, 0.18]} rotation={[0.2, 0, 0]}>
      <circleGeometry args={[0.04, 16]} />
      <meshStandardMaterial color="#222222" side={THREE.DoubleSide} />
    </mesh>
  );
}

function Eyebrows({ mood = 'neutral', intensity = 1 }: { mood?: string; intensity?: number }) {
  const leftRef = useRef<THREE.Mesh>(null);
  const rightRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!leftRef.current || !rightRef.current) return;
    const time = state.clock.elapsedTime;

    // Subtle movement
    const jitter = Math.sin(time * 10) * 0.002 * intensity;

    if (mood === 'angry') {
      leftRef.current.rotation.z = -0.4;
      rightRef.current.rotation.z = 0.4;
      leftRef.current.position.y = 0.12 + jitter;
      rightRef.current.position.y = 0.12 + jitter;
    } else if (mood === 'scared' || mood === 'shock') {
      leftRef.current.rotation.z = 0.3;
      rightRef.current.rotation.z = -0.3;
      leftRef.current.position.y = 0.16 + jitter;
      rightRef.current.position.y = 0.16 + jitter;
    } else {
      leftRef.current.rotation.z = 0;
      rightRef.current.rotation.z = 0;
      leftRef.current.position.y = 0.14 + jitter;
      rightRef.current.position.y = 0.14 + jitter;
    }
  });

  return (
    <group position={[0, 0, 0.19]}>
      <mesh ref={leftRef} position={[-0.1, 0.14, 0]}>
        <boxGeometry args={[0.1, 0.02, 0.01]} />
        <meshStandardMaterial color="#332211" />
      </mesh>
      <mesh ref={rightRef} position={[0.1, 0.14, 0]}>
        <boxGeometry args={[0.1, 0.02, 0.01]} />
        <meshStandardMaterial color="#332211" />
      </mesh>
    </group>
  );
}

export default function Character({ characterId }: CharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);

  const character = getCharacter(characterId);

  const characterPositions = useGameStore((state) => state.characterPositions);
  const characterAnimations = useGameStore((state) => state.characterAnimations);
  const characterStates = useGameStore((state) => state.characterStates);
  const fearLevel = useGameStore((state) => state.fearLevel);

  const position = characterPositions[characterId];
  const animation = characterAnimations[characterId] || 'idle';
  const charState = characterStates[characterId];

  const timeRef = useRef(0);

  const isScared = animation === 'gesture_scared' || animation === 'fear' || fearLevel > 50;
  const isShocked = animation === 'shock';

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    timeRef.current += delta;

    // Base breathing animation (Idle)
    const breathOffset = Math.sin(timeRef.current * 1.5) * 0.01;

    const walkSpeed = 8;
    const isWalking = animation === 'walk';
    const isTalking = animation === 'talking';

    const bobOffset = isWalking
      ? Math.abs(Math.sin(timeRef.current * walkSpeed)) * 0.12
      : isScared
        ? Math.sin(timeRef.current * 15) * 0.01 // Fast tremble
        : breathOffset;

    groupRef.current.position.y = position.y + bobOffset;

    if (isWalking) {
      const swingAngle = Math.sin(timeRef.current * walkSpeed) * 0.6;
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = swingAngle;
        leftArmRef.current.rotation.z = -0.1;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -swingAngle;
        rightArmRef.current.rotation.z = 0.1;
      }
      if (leftLegRef.current) leftLegRef.current.rotation.x = -swingAngle;
      if (rightLegRef.current) rightLegRef.current.rotation.x = swingAngle;
    } else if (isScared) {
      const tremble = Math.sin(timeRef.current * 30) * 0.02;
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = 0.4 + tremble;
        leftArmRef.current.rotation.z = -0.3;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = 0.4 + tremble;
        rightArmRef.current.rotation.z = 0.3;
      }
    } else if (isTalking) {
      const talkNod = Math.sin(timeRef.current * 4) * 0.05;
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = 0.2 + talkNod;
        leftArmRef.current.rotation.z = -0.1;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = 0.1 - talkNod;
        rightArmRef.current.rotation.z = 0.1;
      }
    } else {
      // Idle / Default
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0.1, 0.1);
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, -0.05, 0.1);
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0.1, 0.1);
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, 0.05, 0.1);
      }
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

  if (charState === 'dead') return null;

  const skinMat = <meshStandardMaterial color="#e8c4a0" roughness={0.8} emissive="#e8c4a0" emissiveIntensity={0.05} />;
  const clothingMat = <meshStandardMaterial color={character.color} roughness={0.7} emissive={character.color} emissiveIntensity={0.03} />;

  const silhouetteProfiles = {
    sam: { height: 1.7, width: 0.44, build: 'average', hairColor: '#d4a574' },
    mike: { height: 1.85, width: 0.52, build: 'broad', hairColor: '#2a2a2a' },
    jessica: { height: 1.65, width: 0.38, build: 'slim', hairColor: '#c9a86c' },
    emily: { height: 1.68, width: 0.4, build: 'slim', hairColor: '#1a1a1a' },
    ashley: { height: 1.58, width: 0.36, build: 'slim', hairColor: '#8b0000' },
    chris: { height: 1.78, width: 0.48, build: 'athletic', hairColor: '#6b4423' },
    josh: { height: 1.8, width: 0.5, build: 'broad', hairColor: '#3a3a3a' },
    matt: { height: 1.82, width: 0.5, build: 'broad', hairColor: '#1a1a1a' },
  };

  const profile = silhouetteProfiles[characterId as keyof typeof silhouetteProfiles] || silhouetteProfiles.sam;
  const headY = profile.height * 0.93;
  const torsoHeight = profile.height * 0.4;
  const torsoWidth = profile.width * 0.5;

  return (
    <group ref={groupRef} position={[position.x, 0, position.z]}>
      {/* Neck */}
      <mesh position={[0, headY - 0.2, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.2, 8]} />
        {skinMat}
      </mesh>

      {/* Head */}
      <mesh castShadow position={[0, headY, 0]}>
        <sphereGeometry args={[0.22, 32, 32]} />
        {skinMat}
      </mesh>

      {/* Hair & Features (same as before) */}
      {characterId === 'sam' && (
        <group position={[0, headY, 0]}>
          <mesh position={[0, 0.08, -0.08]}>
            <sphereGeometry args={[0.24, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
            <meshStandardMaterial color={profile.hairColor} />
          </mesh>
          <mesh position={[0.18, -0.05, -0.1]} rotation={[-0.3, 0.3, 0.2]}>
            <capsuleGeometry args={[0.04, 0.35, 4, 8]} />
            <meshStandardMaterial color={profile.hairColor} />
          </mesh>
        </group>
      )}

      {characterId === 'mike' && (
        <group position={[0, headY, 0]}>
          <mesh>
            <sphereGeometry args={[0.24, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.35]} />
            <meshStandardMaterial color={profile.hairColor} />
          </mesh>
        </group>
      )}

      {characterId === 'jessica' && (
        <group position={[0, headY, 0]}>
          <mesh position={[0, 0.02, -0.05]}>
            <sphereGeometry args={[0.24, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
            <meshStandardMaterial color={profile.hairColor} />
          </mesh>
          <mesh position={[0.22, -0.1, -0.05]} rotation={[0, 0.5, 0.2]}>
            <capsuleGeometry args={[0.05, 0.5, 4, 8]} />
            <meshStandardMaterial color={profile.hairColor} />
          </mesh>
          <mesh position={[-0.22, -0.1, -0.05]} rotation={[0, -0.5, -0.2]}>
            <capsuleGeometry args={[0.05, 0.5, 4, 8]} />
            <meshStandardMaterial color={profile.hairColor} />
          </mesh>
        </group>
      )}

      {characterId === 'emily' && (
        <group position={[0, headY, 0]}>
          <mesh>
            <sphereGeometry args={[0.24, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial color={profile.hairColor} />
          </mesh>
          <mesh position={[0, -0.35, 0]} rotation={[0.5, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.05, 0.3, 8]} />
            <meshStandardMaterial color={profile.hairColor} />
          </mesh>
        </group>
      )}

      {characterId === 'ashley' && (
        <group position={[0, headY, 0]}>
          <mesh>
            <sphereGeometry args={[0.22, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.25]} />
            <meshStandardMaterial color={profile.hairColor} />
          </mesh>
          <mesh position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.22, 0.24, 0.25, 16, 1, true]} />
            <meshStandardMaterial color={profile.hairColor} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {characterId === 'chris' && (
        <group position={[0, headY, 0]}>
          <mesh>
            <sphereGeometry args={[0.23, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
            <meshStandardMaterial color={profile.hairColor} />
          </mesh>
          <mesh position={[0.18, 0.15, 0]} rotation={[0, 0.3, 0.4]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color={profile.hairColor} />
          </mesh>
        </group>
      )}

      {characterId === 'josh' && (
        <group position={[0, headY, 0]}>
          <mesh>
            <sphereGeometry args={[0.24, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
            <meshStandardMaterial color={profile.hairColor} />
          </mesh>
          <mesh position={[0, -0.05, 0.15]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.12, 0.15, 0.06]} />
            <meshStandardMaterial color="#c9a86c" roughness={0.9} />
          </mesh>
        </group>
      )}

      {characterId === 'matt' && (
        <group position={[0, headY, 0]}>
          <mesh>
            <sphereGeometry args={[0.24, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
            <meshStandardMaterial color={profile.hairColor} />
          </mesh>
          <mesh position={[0.2, 0.1, 0]} rotation={[0, 0.3, 0.3]}>
            <sphereGeometry args={[0.05, 6, 6]} />
            <meshStandardMaterial color={profile.hairColor} />
          </mesh>
        </group>
      )}


      {/* Eyes, Mouth & Brows */}
      <group position={[0, headY, 0]}>
        {(isScared || isShocked) && (
          <>
            <ScaredEyes intensity={isShocked ? 2 : 1} />
            {isShocked && <ShockedMouth />}
          </>
        )}
        <Eyebrows mood={isShocked ? 'shock' : isScared ? 'scared' : 'neutral'} intensity={isScared ? 1.5 : 1} />
      </group>

      <group position={[0, headY, 0]}>
        <CharacterFace characterId={characterId} />
      </group>

      {/* Torso */}
      <mesh castShadow position={[0, profile.height * 0.55, 0]}>
        <capsuleGeometry args={[torsoWidth * 0.5, torsoHeight, 8, 16]} />
        {clothingMat}
      </mesh>

      {/* Arms with segments */}
      <group position={[-torsoWidth * 0.7, profile.height * 0.68, 0]} ref={leftArmRef}>
        <mesh castShadow position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.06, 0.3, 4, 8]} />
          {clothingMat}
        </mesh>
        <group position={[0, -0.35, 0]}>
          <mesh castShadow position={[0, -0.15, 0]}>
            <capsuleGeometry args={[0.055, 0.3, 4, 8]} />
            {skinMat}
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.32, 0]}>
            <boxGeometry args={[0.08, 0.1, 0.03]} />
            {skinMat}
          </mesh>
        </group>
      </group>

      <group position={[torsoWidth * 0.7, profile.height * 0.68, 0]} ref={rightArmRef}>
        <mesh castShadow position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.06, 0.3, 4, 8]} />
          {clothingMat}
        </mesh>
        <group position={[0, -0.35, 0]}>
          <mesh castShadow position={[0, -0.15, 0]}>
            <capsuleGeometry args={[0.055, 0.3, 4, 8]} />
            {skinMat}
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.32, 0]}>
            <boxGeometry args={[0.08, 0.1, 0.03]} />
            {skinMat}
          </mesh>
        </group>
      </group>

      {/* Legs with segments */}
      <group position={[-torsoWidth * 0.3, profile.height * 0.35, 0]} ref={leftLegRef}>
        <mesh castShadow position={[0, -0.25, 0]}>
          <capsuleGeometry args={[0.09, 0.4, 4, 8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
        <group position={[0, -0.45, 0]}>
          <mesh castShadow position={[0, -0.2, 0]}>
            <capsuleGeometry args={[0.08, 0.4, 4, 8]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
          </mesh>
          {/* Foot */}
          <mesh position={[0, -0.4, 0.1]}>
            <boxGeometry args={[0.12, 0.06, 0.2]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
        </group>
      </group>

      <group position={[torsoWidth * 0.3, profile.height * 0.35, 0]} ref={rightLegRef}>
        <mesh castShadow position={[0, -0.25, 0]}>
          <capsuleGeometry args={[0.09, 0.4, 4, 8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
        <group position={[0, -0.45, 0]}>
          <mesh castShadow position={[0, -0.2, 0]}>
            <capsuleGeometry args={[0.08, 0.4, 4, 8]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
          </mesh>
          {/* Foot */}
          <mesh position={[0, -0.4, 0.1]}>
            <boxGeometry args={[0.12, 0.06, 0.2]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
        </group>
      </group>
    </group>
  );
}
