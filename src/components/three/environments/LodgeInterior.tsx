'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import InteractableObject from '../InteractableObject';
import { useGameStore } from '@/lib/store';

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function FireParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const timeRef = useRef(0);
  
  const { positions, velocities } = useMemo(() => {
    const count = 40;
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const life = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (seededRandom(i) - 0.5) * 0.3;
      pos[i * 3 + 1] = seededRandom(i + 100) * 1.2;
      pos[i * 3 + 2] = (seededRandom(i + 200) - 0.5) * 0.3;
      vel[i * 3] = (seededRandom(i + 300) - 0.5) * 0.15;
      vel[i * 3 + 1] = 1.5 + seededRandom(i + 400) * 1;
      vel[i * 3 + 2] = (seededRandom(i + 500) - 0.5) * 0.15;
      life[i] = seededRandom(i + 600);
    }
    return { positions: pos, velocities: vel };
  }, []);

  const lifetimesRef = useRef<Float32Array>(Float32Array.from({ length: 40 }, (_, i) => seededRandom(i + 600)));

  useFrame((_, delta) => {
    if (!particlesRef.current) return;
    timeRef.current += delta;
    const pos = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const currentTime = timeRef.current;

    for (let i = 0; i < 40; i++) {
      pos[i * 3] += velocities[i * 3] * delta;
      pos[i * 3 + 1] += velocities[i * 3 + 1] * delta;
      pos[i * 3 + 2] += velocities[i * 3 + 2] * delta;

      lifetimesRef.current[i] += delta * 1.2;

      if (lifetimesRef.current[i] > 1) {
        pos[i * 3] = (seededRandom(i + Math.floor(currentTime * 10)) - 0.5) * 0.3;
        pos[i * 3 + 1] = 0;
        pos[i * 3 + 2] = (seededRandom(i + Math.floor(currentTime * 10) + 200) - 0.5) * 0.3;
        lifetimesRef.current[i] = 0;
      }
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef} position={[0, 0.8, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ff6622"
        size={0.15}
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export default function LodgeInterior() {
  const fireRef = useRef<THREE.Mesh>(null);
  const fireLightRef = useRef<THREE.PointLight>(null);

  useFrame(() => {
    if (fireRef.current) {
      fireRef.current.scale.y = 1 + Math.sin(Date.now() * 0.02) * 0.2 + Math.random() * 0.1;
      fireRef.current.rotation.y = Math.random() * Math.PI;
    }
    if (fireLightRef.current) {
      fireLightRef.current.intensity = 2 + Math.sin(Date.now() * 0.015) * 0.5;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Floor */}
      <mesh position={[0, 0, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color="#4a3a2a" roughness={0.8} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 5, 0]} receiveShadow rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color="#2a2018" roughness={0.8} />
      </mesh>

      {/* Walls */}
      {[-5.85, 5.85].map((x, i) => (
        <mesh key={`wall-${i}`} position={[x, 2.5, 0]} receiveShadow>
          <boxGeometry args={[0.3, 5, 10]} />
          <meshStandardMaterial color="#5d4837" roughness={0.7} />
        </mesh>
      ))}

      {[-4.85, 4.85].map((z, i) => (
        <mesh key={`wall2-${i}`} position={[0, 2.5, z]} receiveShadow>
          <boxGeometry args={[12, 5, 0.3]} />
          <meshStandardMaterial color="#5d4837" roughness={0.7} />
        </mesh>
      ))}

      {/* Fireplace */}
      <group position={[0, 0, -3]}>
        {/* Mantle */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[2.5, 1, 1]} />
          <meshStandardMaterial color="#1a0a00" roughness={0.7} />
        </mesh>
        {/* Fire */}
        <mesh ref={fireRef} position={[0, 1.2, 0]}>
          <coneGeometry args={[0.4, 1, 8]} />
          <meshStandardMaterial
            color="#ff4400"
            emissive="#ff2200"
            emissiveIntensity={3}
          />
        </mesh>
        {/* Fire particles */}
        <FireParticles />
        {/* Grate */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.6, 0.8, 0.15, 8]} />
          <meshStandardMaterial color="#222222" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Mantle decorations */}
        <mesh position={[-0.6, 1.1, 0.2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        <mesh position={[0.5, 1.15, 0.2]}>
          <boxGeometry args={[0.2, 0.3, 0.05]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        <pointLight ref={fireLightRef} position={[0, 1.5, 0]} intensity={2} color="#ff6633" distance={12} decay={2} />
      </group>

      {/* Left window with light */}
      <mesh position={[-5.6, 3, -4.7]}>
        <boxGeometry args={[0.1, 1.8, 1.5]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.6} />
      </mesh>
      <mesh position={[-5.55, 3, -4.65]}>
        <boxGeometry args={[0.05, 1.5, 1.2]} />
        <meshStandardMaterial
          color="#1a2030"
          emissive="#ffdd99"
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Right window with light */}
      <mesh position={[5.6, 3, -4.7]}>
        <boxGeometry args={[0.1, 1.8, 1.5]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.6} />
      </mesh>
      <mesh position={[5.55, 3, -4.65]}>
        <boxGeometry args={[0.05, 1.5, 1.2]} />
        <meshStandardMaterial
          color="#1a2030"
          emissive="#ffdd99"
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Wall decorations - antlers */}
      <group position={[-4, 3.5, -4.7]}>
        <mesh position={[0, 0, 0]} rotation={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.03, 0.04, 0.6, 6]} />
          <meshStandardMaterial color="#3a2a1a" />
        </mesh>
        <mesh position={[-0.15, 0.25, 0]} rotation={[0, 0, 0.5]}>
          <cylinderGeometry args={[0.02, 0.03, 0.3, 5]} />
          <meshStandardMaterial color="#3a2a1a" />
        </mesh>
        <mesh position={[0.1, 0.2, 0]} rotation={[0, 0, -0.4]}>
          <cylinderGeometry args={[0.02, 0.03, 0.25, 5]} />
          <meshStandardMaterial color="#3a2a1a" />
        </mesh>
      </group>

      {/* Wall decorations - picture frame */}
      <mesh position={[4, 3.2, -4.7]}>
        <boxGeometry args={[1, 0.8, 0.08]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.7} />
      </mesh>
      <mesh position={[4, 3.2, -4.65]}>
        <boxGeometry args={[0.85, 0.65, 0.02]} />
        <meshStandardMaterial color="#1a1510" />
      </mesh>

      {/* Sofas */}
      {[-2, 2].map((z, i) => (
        <group key={`couch-${i}`} position={[0, 0.4, z]}>
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[3, 0.5, 1.2]} />
            <meshStandardMaterial color="#4a2020" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.6, -0.45]} castShadow>
            <boxGeometry args={[3, 1, 0.3]} />
            <meshStandardMaterial color="#4a2020" roughness={0.9} />
          </mesh>
          {/* Pillows */}
          <mesh position={[-1, 0.7, 0.1]}>
            <boxGeometry args={[0.4, 0.4, 0.15]} />
            <meshStandardMaterial color="#6a3030" roughness={0.95} />
          </mesh>
          <mesh position={[1, 0.7, 0.1]}>
            <boxGeometry args={[0.4, 0.4, 0.15]} />
            <meshStandardMaterial color="#6a3030" roughness={0.95} />
          </mesh>
        </group>
      ))}

      {/* Coffee table */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[1.5, 0.08, 0.8]} />
          <meshStandardMaterial color="#2a1a0a" roughness={0.7} />
        </mesh>
        {[[-0.6, -0.3], [0.6, -0.3], [-0.6, 0.3], [0.6, 0.3]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.15, z]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.3, 8]} />
            <meshStandardMaterial color="#1a0a00" />
          </mesh>
        ))}
      </group>

      {/* Side table with totem */}
      <group position={[-3, 0, -2]}>
        <mesh position={[0, 0.3, 0]} receiveShadow>
          <cylinderGeometry args={[0.4, 0.5, 0.6, 12]} />
          <meshStandardMaterial color="#2a1a0a" />
        </mesh>
        <mesh position={[0, 0.65, 0]} receiveShadow>
          <cylinderGeometry args={[0.35, 0.4, 0.1, 12]} />
          <meshStandardMaterial color="#2a1a0a" />
        </mesh>
      </group>

      {/* Interactable: Totem */}
      <InteractableObject
        label="Examine Totem"
        position={[-3, 1.3, -2]}
        sceneAccess={['ch1_lodge_exploration']}
        onInteract={() => {
          useGameStore.getState().addClue('Guidance Totem: Flare Gun');
          useGameStore.getState().setCurrentScene('ch1_clue_found');
          useGameStore.getState().setPhase('scene');
        }}
      >
        <mesh>
          <cylinderGeometry args={[0.1, 0.1, 0.3, 5]} />
          <meshStandardMaterial color="#7a5c43" roughness={1} />
        </mesh>
      </InteractableObject>

      {/* Armchair */}
      <group position={[4, 0.5, -1]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[1, 0.4, 1]} />
          <meshStandardMaterial color="#3a2a1a" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.7, -0.35]} castShadow>
          <boxGeometry args={[1, 1.2, 0.3]} />
          <meshStandardMaterial color="#3a2a1a" roughness={0.85} />
        </mesh>
        <mesh position={[-0.45, 0.5, 0]} castShadow>
          <boxGeometry args={[0.2, 0.8, 0.8]} />
          <meshStandardMaterial color="#3a2a1a" roughness={0.85} />
        </mesh>
        <mesh position={[0.45, 0.5, 0]} castShadow>
          <boxGeometry args={[0.2, 0.8, 0.8]} />
          <meshStandardMaterial color="#3a2a1a" roughness={0.85} />
        </mesh>
      </group>

    </group>
  );
}
