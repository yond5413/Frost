'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  position?: [number, number, number];
}

export default function Wendigo({ position = [0, 0, -15] }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const phaseRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    phaseRef.current += delta * 0.3;
    groupRef.current.position.x = position[0] + Math.sin(phaseRef.current) * 3;
    groupRef.current.position.z = position[2] + Math.cos(phaseRef.current * 0.5) * 2;
    groupRef.current.lookAt(0, 0, 0);
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Elongated body */}
      <mesh position={[0, 2, 0]} castShadow>
        <capsuleGeometry args={[0.2, 2.5, 8, 16]} />
        <meshStandardMaterial color="#1a0a0a" roughness={1} emissive="#330000" emissiveIntensity={0.2} />
      </mesh>
      {/* Skull-like head */}
      <mesh position={[0, 3.5, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#0d0606" roughness={0.8} emissive="#660000" emissiveIntensity={0.3} />
      </mesh>
      {/* Glowing eyes */}
      <mesh position={[-0.12, 3.55, 0.25]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0.12, 3.55, 0.25]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
      </mesh>
      {/* Long arms */}
      <mesh position={[-0.5, 2.2, 0]} rotation={[0, 0, 0.5]} castShadow>
        <capsuleGeometry args={[0.07, 1.5, 8, 8]} />
        <meshStandardMaterial color="#1a0a0a" roughness={1} />
      </mesh>
      <mesh position={[0.5, 2.2, 0]} rotation={[0, 0, -0.5]} castShadow>
        <capsuleGeometry args={[0.07, 1.5, 8, 8]} />
        <meshStandardMaterial color="#1a0a0a" roughness={1} />
      </mesh>
      {/* Eye glow */}
      <pointLight position={[0, 3.5, 0.3]} color="#ff0000" intensity={0.8} distance={4} />
    </group>
  );
}
