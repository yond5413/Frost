'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EnvironmentType } from '@/lib/environmentStore';

interface AtmosphereProps {
  environment: EnvironmentType;
}

export default function Atmosphere({ environment }: AtmosphereProps) {
  if (environment === 'mines') {
    return <MinesAtmosphere />;
  }
  if (environment === 'lodge') {
    return <LodgeAtmosphere />;
  }
  return <DefaultAtmosphere />;
}

function DefaultAtmosphere() {
  const snowRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    let seed = 54321;
    const seededRandom = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (seededRandom() - 0.5) * 60;
      positions[i * 3 + 1] = seededRandom() * 30;
      positions[i * 3 + 2] = (seededRandom() - 0.5) * 60;
    }
    return positions;
  }, []);

  useFrame((_, delta) => {
    if (snowRef.current) {
      const positions = snowRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3 + 1] -= delta * 2;
        if (positions[i * 3 + 1] < 0) {
          positions[i * 3 + 1] = 30;
        }
      }
      snowRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <>
      <fog attach="fog" args={['#1a2030', 10, 50]} />
      <ambientLight intensity={0.15} color="#4a6080" />
      <directionalLight 
        position={[10, 15, 5]} 
        intensity={0.3} 
        color="#8899bb"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[0, 2, 2]} intensity={0.5} color="#ff9944" distance={8} decay={2} />
      <points ref={snowRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particles, 3]}
          />
        </bufferGeometry>
        <pointsMaterial color="#ffffff" size={0.15} transparent opacity={0.8} />
      </points>
    </>
  );
}

function MinesAtmosphere() {
  return (
    <>
      <fog attach="fog" args={['#0a0a0a', 1, 15]} />
      <ambientLight intensity={0.05} color="#1a1a2e" />
      <pointLight position={[0, 3, 0]} intensity={0.8} color="#ff6600" distance={10} decay={2} />
      <pointLight position={[-5, 2, -5]} intensity={0.3} color="#ff4400" distance={8} decay={2} />
      <pointLight position={[5, 2, 5]} intensity={0.3} color="#ff4400" distance={8} decay={2} />
    </>
  );
}

function LodgeAtmosphere() {
  const fireRef = useRef<THREE.PointLight>(null);
  
  useFrame((_, delta) => {
    if (fireRef.current) {
      fireRef.current.intensity = 1.2 + Math.sin(Date.now() * 0.01) * 0.3 + Math.random() * 0.1;
    }
  });

  return (
    <>
      <fog attach="fog" args={['#1a1520', 15, 40]} />
      <ambientLight intensity={0.1} color="#3a2a20" />
      <pointLight ref={fireRef} position={[0, 2, -2]} intensity={1.2} color="#ff6633" distance={12} decay={2} />
      <pointLight position={[4, 2, 2]} intensity={0.15} color="#ffaa66" distance={6} decay={2} />
      <pointLight position={[-4, 2, 2]} intensity={0.15} color="#ffaa66" distance={6} decay={2} />
    </>
  );
}
