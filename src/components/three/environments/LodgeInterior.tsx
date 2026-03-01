'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import InteractableObject from '../InteractableObject';
import { useGameStore } from '@/lib/store';

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
      <mesh position={[0, 2.5, 0]} receiveShadow>
        <boxGeometry args={[12, 0.3, 10]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.9} />
      </mesh>

      <mesh position={[0, 5, 0]} receiveShadow>
        <boxGeometry args={[12, 0.3, 10]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.9} />
      </mesh>

      {[-5.85, 5.85].map((x, i) => (
        <mesh key={`wall-${i}`} position={[x, 2.5, 0]} receiveShadow>
          <boxGeometry args={[0.3, 5, 10]} />
          <meshStandardMaterial color="#3d2817" roughness={0.8} />
        </mesh>
      ))}

      {[-4.85, 4.85].map((z, i) => (
        <mesh key={`wall2-${i}`} position={[0, 2.5, z]} receiveShadow>
          <boxGeometry args={[12, 5, 0.3]} />
          <meshStandardMaterial color="#3d2817" roughness={0.8} />
        </mesh>
      ))}

      <group position={[0, 0, -3]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[2, 1, 0.8]} />
          <meshStandardMaterial color="#1a0a00" roughness={0.7} />
        </mesh>
        <mesh ref={fireRef} position={[0, 1.2, 0]}>
          <coneGeometry args={[0.4, 1, 8]} />
          <meshStandardMaterial
            color="#ff4400"
            emissive="#ff2200"
            emissiveIntensity={2}
          />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.6, 0.8, 0.2, 8]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        <pointLight ref={fireLightRef} position={[0, 1.5, 0]} intensity={2} color="#ff6633" distance={10} decay={2} />
      </group>

      <mesh position={[-4, 1.5, -4.7]}>
        <boxGeometry args={[1.5, 2, 0.1]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.6} />
      </mesh>
      <mesh position={[-4, 2.5, -4.65]}>
        <boxGeometry args={[1.2, 0.8, 0.05]} />
        <meshStandardMaterial
          color="#1a2030"
          emissive="#ffeecc"
          emissiveIntensity={0.4}
          transparent
          opacity={0.7}
        />
      </mesh>

      <mesh position={[4, 1.5, -4.7]}>
        <boxGeometry args={[1.5, 2, 0.1]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.6} />
      </mesh>
      <mesh position={[4, 2.5, -4.65]}>
        <boxGeometry args={[1.2, 0.8, 0.05]} />
        <meshStandardMaterial
          color="#1a2030"
          emissive="#ffeecc"
          emissiveIntensity={0.4}
          transparent
          opacity={0.7}
        />
      </mesh>

      {[-3, 0, 3].map((z, i) => (
        <group key={`couch-${i}`} position={[3, 0.4, z]}>
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[2.5, 0.5, 1]} />
            <meshStandardMaterial color="#4a2020" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.5, -0.35]} castShadow>
            <boxGeometry args={[2.5, 0.8, 0.3]} />
            <meshStandardMaterial color="#4a2020" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {[-2, 2].map((x, i) => (
        <group key={`chair-${i}`} position={[x, 0.5, 3]}>
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[0.8, 0.3, 0.8]} />
            <meshStandardMaterial color="#3a2a1a" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.7, -0.3]} castShadow>
            <boxGeometry args={[0.8, 1, 0.2]} />
            <meshStandardMaterial color="#3a2a1a" roughness={0.8} />
          </mesh>
        </group>
      ))}

      <mesh position={[-3, 0.3, -2]} receiveShadow>
        <cylinderGeometry args={[0.4, 0.5, 0.6, 12]} />
        <meshStandardMaterial color="#2a1a0a" />
      </mesh>
      <mesh position={[-3, 0.9, -2]}>
        <cylinderGeometry args={[0.3, 0.4, 0.6, 12]} />
        <meshStandardMaterial color="#2a1a0a" />
      </mesh>
      <mesh position={[-3, 1.5, -2]}>
        <cylinderGeometry args={[0.2, 0.3, 0.6, 12]} />
        <meshStandardMaterial color="#2a1a0a" />
      </mesh>

      {/* Interactable: Totem */}
      <InteractableObject
        id="lodge_totem"
        label="Examine Totem"
        position={[-3, 2.0, -2]} // On top of the table
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

    </group>
  );
}
