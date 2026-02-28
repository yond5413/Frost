'use client';

import { useRef } from 'react';
import * as THREE from 'three';

export default function Cabin() {
  const cabinRef = useRef<THREE.Group>(null);
  
  return (
    <group ref={cabinRef} position={[0, 0, 0]}>
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[6, 3, 5]} />
        <meshStandardMaterial color="#3d2817" roughness={0.9} />
      </mesh>
      
      <mesh position={[0, 3.5, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <cylinderGeometry args={[4.5, 4.5, 0.3, 4]} />
        <meshStandardMaterial color="#1a1208" roughness={0.8} />
      </mesh>
      
      <mesh position={[1.5, 4, 0]} castShadow>
        <boxGeometry args={[0.6, 2, 0.6]} />
        <meshStandardMaterial color="#4a3520" roughness={0.7} />
      </mesh>
      
      <mesh position={[0, 1, 2.55]}>
        <boxGeometry args={[1.2, 2, 0.1]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.6} />
      </mesh>
      
      {[-2, 2].map((x, i) => (
        <group key={i} position={[x, 1.8, 2.55]}>
          <mesh>
            <boxGeometry args={[1, 1, 0.1]} />
            <meshStandardMaterial 
              color="#1a3050" 
              emissive="#ffaa00" 
              emissiveIntensity={0.3}
              transparent 
              opacity={0.8}
            />
          </mesh>
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
      
      <mesh position={[0, 0.15, 3]} receiveShadow>
        <boxGeometry args={[3, 0.3, 1.5]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.9} />
      </mesh>
      
      {[-1.3, 1.3].map((x, i) => (
        <mesh key={i} position={[x, 1, 3.5]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
          <meshStandardMaterial color="#2a1a0a" />
        </mesh>
      ))}
    </group>
  );
}
