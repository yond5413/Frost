'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import InteractableObject from '../InteractableObject';
import { useGameStore } from '@/lib/store';

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function ChimneySmoke() {
  const smokeRef = useRef<THREE.Points>(null);
  const timeRef = useRef(0);
  
  const { positions, velocities } = useMemo(() => {
    const count = 30;
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const life = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (seededRandom(i) - 0.5) * 0.3;
      pos[i * 3 + 1] = seededRandom(i + 100) * 3;
      pos[i * 3 + 2] = (seededRandom(i + 200) - 0.5) * 0.3;
      vel[i * 3] = (seededRandom(i + 300) - 0.5) * 0.2;
      vel[i * 3 + 1] = 0.5 + seededRandom(i + 400) * 0.5;
      vel[i * 3 + 2] = (seededRandom(i + 500) - 0.5) * 0.2;
      life[i] = seededRandom(i + 600);
    }
    return { positions: pos, velocities: vel };
  }, []);

  const lifetimesRef = useRef<Float32Array>(Float32Array.from({ length: 30 }, (_, i) => seededRandom(i + 600)));

  useFrame((_, delta) => {
    if (!smokeRef.current) return;
    timeRef.current += delta;
    const pos = smokeRef.current.geometry.attributes.position.array as Float32Array;
    const currentTime = timeRef.current;
    
    for (let i = 0; i < 30; i++) {
      pos[i * 3] += velocities[i * 3] * delta;
      pos[i * 3 + 1] += velocities[i * 3 + 1] * delta;
      pos[i * 3 + 2] += velocities[i * 3 + 2] * delta;
      
      lifetimesRef.current[i] += delta * 0.3;

      if (lifetimesRef.current[i] > 1) {
        pos[i * 3] = (seededRandom(i + Math.floor(currentTime * 10)) - 0.5) * 0.3;
        pos[i * 3 + 1] = 0;
        pos[i * 3 + 2] = (seededRandom(i + Math.floor(currentTime * 10) + 200) - 0.5) * 0.3;
        lifetimesRef.current[i] = 0;
      }
    }
    smokeRef.current.geometry.attributes.position.needsUpdate = true;
  });
  
  return (
    <points ref={smokeRef} position={[1.5, 4.5, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#666677"
        size={0.4}
        transparent
        opacity={0.25}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export default function Cabin() {
  const cabinRef = useRef<THREE.Group>(null);

  return (
    <group ref={cabinRef} position={[0, 0, 0]}>
      {/* Main cabin body */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[6, 3, 5]} />
        <meshStandardMaterial color="#3d2817" roughness={0.9} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 3.5, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <cylinderGeometry args={[4.5, 4.5, 0.3, 4]} />
        <meshStandardMaterial color="#1a1208" roughness={0.8} />
      </mesh>

      {/* Chimney */}
      <mesh position={[1.5, 4.2, 0]} castShadow>
        <boxGeometry args={[0.6, 1.5, 0.6]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.9} />
      </mesh>
      
      {/* Chimney top */}
      <mesh position={[1.5, 5, 0]} castShadow>
        <boxGeometry args={[0.8, 0.15, 0.8]} />
        <meshStandardMaterial color="#1a0f05" roughness={0.9} />
      </mesh>
      
      {/* Chimney smoke */}
      <ChimneySmoke />

      {/* Porch roof */}
      <mesh position={[0, 3.8, 0]} castShadow>
        <boxGeometry args={[3.5, 0.15, 2]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.85} />
      </mesh>

      {/* Porch supports */}
      {[-1.3, 1.3].map((x, i) => (
        <mesh key={i} position={[x, 2.2, 1.2]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 1.8, 8]} />
          <meshStandardMaterial color="#2a1a0a" roughness={0.8} />
        </mesh>
      ))}

      {/* Front door */}
      <mesh position={[0, 1, 2.55]}>
        <boxGeometry args={[1.2, 2, 0.1]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.6} />
      </mesh>

      {/* Windows with light */}
      {[-2, 2].map((x, i) => (
        <group key={i} position={[x, 1.8, 2.55]}>
          <mesh>
            <boxGeometry args={[1, 1, 0.1]} />
            <meshStandardMaterial
              color="#1a3050"
              emissive="#ffaa00"
              emissiveIntensity={0.4}
              transparent
              opacity={0.85}
            />
          </mesh>
          {/* Window frame */}
          <mesh position={[0, 0, 0.05]}>
            <boxGeometry args={[0.15, 1, 0.05]} />
            <meshStandardMaterial color="#2a1a0a" />
          </mesh>
          <mesh position={[0, 0, 0.05]}>
            <boxGeometry args={[1, 0.15, 0.05]} />
            <meshStandardMaterial color="#2a1a0a" />
          </mesh>
        </group>
      ))}

      {/* Side windows */}
      {[-1, 1].map((z, i) => (
        <mesh key={`side-${i}`} position={[3.05, 1.8, z]}>
          <boxGeometry args={[0.1, 0.8, 0.8]} />
          <meshStandardMaterial
            color="#1a2535"
            emissive="#ff8822"
            emissiveIntensity={0.25}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}

      {/* Porch floor */}
      <mesh position={[0, 0.15, 1.5]} receiveShadow>
        <boxGeometry args={[3, 0.3, 1.5]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.9} />
      </mesh>

      {/* Foundation/steps */}
      <mesh position={[0, 0.1, 3.2]} receiveShadow>
        <boxGeometry args={[1.5, 0.2, 0.8]} />
        <meshStandardMaterial color="#1a1510" roughness={0.95} />
      </mesh>

      {/* Snow on roof edges */}
      <mesh position={[-2.8, 3.6, 0]}>
        <boxGeometry args={[0.5, 0.15, 4]} />
        <meshStandardMaterial color="#e8eef5" roughness={0.9} />
      </mesh>
      <mesh position={[2.8, 3.6, 0]}>
        <boxGeometry args={[0.5, 0.15, 4]} />
        <meshStandardMaterial color="#e8eef5" roughness={0.9} />
      </mesh>

      {/* Interactable: Window */}
      <InteractableObject
        label="Investigate Window"
        position={[0, 1.5, 3]}
        sceneAccess={['chapter2_start']}
        onInteract={() => {
          useGameStore.getState().incrementFear(15);
          useGameStore.getState().setCurrentScene('ch2_woods_chase');
          useGameStore.getState().setPhase('scene');
        }}
      >
        <mesh visible={false}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial />
        </mesh>
      </InteractableObject>

    </group>
  );
}
