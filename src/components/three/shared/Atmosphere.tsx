'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EnvironmentType } from '@/lib/environmentStore';

interface AtmosphereProps {
  environment: EnvironmentType;
}

export default function Atmosphere({ environment }: AtmosphereProps) {
  if (environment === 'mines') return <MinesAtmosphere />;
  if (environment === 'lodge') return <LodgeAtmosphere />;
  return <DefaultAtmosphere />;
}

const SNOW_VERT = `
  attribute float size;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const SNOW_FRAG = `
  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    if (dot(coord, coord) > 0.25) discard;
    gl_FragColor = vec4(1.0, 1.0, 1.0, 0.75);
  }
`;

function DefaultAtmosphere() {
  const snowRef = useRef<THREE.Points>(null);

  const { positions, sizes } = useMemo(() => {
    const count = 3500;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    let seed = 54321;
    const seededRandom = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (seededRandom() - 0.5) * 60;
      positions[i * 3 + 1] = seededRandom() * 30;
      positions[i * 3 + 2] = (seededRandom() - 0.5) * 60;
      sizes[i] = 3 + seededRandom() * 6; // 3–9 px
    }
    return { positions, sizes };
  }, []);

  const snowMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: SNOW_VERT,
        fragmentShader: SNOW_FRAG,
        transparent: true,
        depthWrite: false,
      }),
    []
  );

  useFrame((_, delta) => {
    if (!snowRef.current) return;
    const pos = snowRef.current.geometry.attributes.position.array as Float32Array;
    const count = pos.length / 3;
    for (let i = 0; i < count; i++) {
      pos[i * 3] += delta * 0.8; // wind drift
      pos[i * 3 + 1] -= delta * 2;
      if (pos[i * 3 + 1] < 0) {
        pos[i * 3 + 1] = 30;
        pos[i * 3] = (Math.random() - 0.5) * 60;
      }
      if (pos[i * 3] > 30) pos[i * 3] -= 60;
    }
    snowRef.current.geometry.attributes.position.needsUpdate = true;
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
      <points ref={snowRef} material={snowMaterial}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
        </bufferGeometry>
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

  useFrame(() => {
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
