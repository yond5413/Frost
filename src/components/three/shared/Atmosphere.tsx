'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EnvironmentType } from '@/lib/environmentStore';
import { useGameStore } from '@/lib/store';

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
  varying vec3 vColor;
  void main() {
    vColor = vec3(1.0);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (100.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const SNOW_FRAG = `
  varying vec3 vColor;
  void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;
    gl_FragColor = vec4(vColor, 1.0 - (dist * 2.0));
  }
`;

function DefaultAtmosphere() {
  const snowRef = useRef<THREE.Points>(null);
  const fearLevel = useGameStore((state) => state.fearLevel);

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
      sizes[i] = 3 + seededRandom() * 6;
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

    const fallSpeed = 2 + (fearLevel / 100) * 6;

    for (let i = 0; i < count; i++) {
      pos[i * 3] += delta * 1.2;
      pos[i * 3 + 1] -= delta * fallSpeed;
      if (pos[i * 3 + 1] < 0) {
        pos[i * 3 + 1] = 30;
        pos[i * 3] = (Math.random() - 0.5) * 60;
      }
      if (pos[i * 3] > 30) pos[i * 3] -= 60;
    }
    snowRef.current.geometry.attributes.position.needsUpdate = true;
  });

  const fearRatio = fearLevel / 100;

  const ambientIntensity = Math.max(0.04, 0.22 - fearRatio * 0.18);
  const pointIntensity = 0.6 + fearRatio * 0.4;
  const fogDensity = 35 - fearRatio * 20;
  const fogColor = fearRatio > 0.5 ? '#050508' : '#0a0c12';

  return (
    <>
      <fog attach="fog" args={[fogColor, 8, fogDensity]} />
      <ambientLight intensity={ambientIntensity} color="#2a3550" />
      <directionalLight
        position={[10, 15, 5]}
        intensity={0.30 * (1 - fearRatio * 0.5)}
        color="#556688"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight
        position={[0, 2, 2]}
        intensity={pointIntensity}
        color={fearLevel > 60 ? "#ff3300" : "#cc6633"}
        distance={6}
        decay={2}
      />
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
  const fearLevel = useGameStore((state) => state.fearLevel);
  const fearRatio = fearLevel / 100;
  
  return (
    <>
      <fog attach="fog" args={['#050505', 0.5, 10]} />
      <ambientLight intensity={0.02} color="#0a0a15" />
      <pointLight position={[0, 3, 0]} intensity={0.6 * (1 + fearRatio * 0.5)} color="#ff4400" distance={8} decay={2} />
      <pointLight position={[-5, 2, -5]} intensity={0.2} color="#ff2200" distance={6} decay={2} />
      <pointLight position={[5, 2, 5]} intensity={0.2} color="#ff2200" distance={6} decay={2} />
    </>
  );
}

function LodgeAtmosphere() {
  const fireRef = useRef<THREE.PointLight>(null);
  const fearLevel = useGameStore((state) => state.fearLevel);
  const fearRatio = fearLevel / 100;

  useFrame(() => {
    if (fireRef.current) {
      fireRef.current.intensity = 1.0 + Math.sin(Date.now() * 0.01) * 0.3 + Math.random() * 0.1;
    }
  });

  const fogColor = fearRatio > 0.5 ? '#0a0808' : '#151010';
  const ambientIntensity = Math.max(0.05, 0.28 - fearRatio * 0.23);

  return (
    <>
      <fog attach="fog" args={[fogColor, 10, 30 - fearRatio * 10]} />
      <ambientLight intensity={ambientIntensity} color="#4a3020" />
      <pointLight ref={fireRef} position={[0, 2, -2]} intensity={1.2} color="#ff4400" distance={14} decay={2} />
      <pointLight position={[4, 2, 2]} intensity={0.25} color="#ff8822" distance={8} decay={2} />
      <pointLight position={[-4, 2, 2]} intensity={0.25} color="#ff8822" distance={8} decay={2} />
      <pointLight position={[0, 4, 1]} intensity={0.2} color="#cc7744" distance={8} decay={2} />
      {fearLevel > 50 && (
        <pointLight position={[0, 3, 3]} intensity={0.05} color="#330000" distance={4} decay={2} />
      )}
    </>
  );
}
