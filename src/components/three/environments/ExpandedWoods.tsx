'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function GroundFog({ density = 1 }: { density?: number }) {
  const fogRef = useRef<THREE.Points>(null);
  
  const { positions } = useMemo(() => {
    const count = 200 * density;
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    let seed = 99999;
    const seededRandom = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (seededRandom() - 0.5) * 60;
      pos[i * 3 + 1] = seededRandom() * 0.3;
      pos[i * 3 + 2] = (seededRandom() - 0.5) * 60;
      sz[i] = 3 + seededRandom() * 4;
    }
    return { positions: pos, sizes: sz };
  }, [density]);
  
  useFrame((_, delta) => {
    if (!fogRef.current) return;
    const pos = fogRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < pos.length / 3; i++) {
      pos[i * 3 + 1] += delta * 0.3;
      if (pos[i * 3 + 1] > 1.5) {
        pos[i * 3 + 1] = 0;
        pos[i * 3] = (Math.random() - 0.5) * 60;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
      }
    }
    fogRef.current.geometry.attributes.position.needsUpdate = true;
  });
  
  return (
    <points ref={fogRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#8899aa"
        size={0.8}
        transparent
        opacity={0.35}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export default function ExpandedWoods() {
  const treeData = useMemo(() => {
    const trees: { position: [number, number, number]; color: string; height: number; trunkRadius1: number; trunkRadius2: number; branchRotations: number[] }[] = [];
    let seed = 12345;
    const seededRandom = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    for (let i = 0; i < 100; i++) {
      const angle = (i / 100) * Math.PI * 2;
      const radius = 8 + seededRandom() * 40;
      const x = Math.cos(angle) * radius + (seededRandom() - 0.5) * 18;
      const z = Math.sin(angle) * radius + (seededRandom() - 0.5) * 18;
      const hue = 100 + seededRandom() * 30;
      const lightness = 10 + seededRandom() * 8;
      const height = 2.5 + seededRandom() * 2;
      const trunkRadius1 = 0.2 + seededRandom() * 0.15;
      const trunkRadius2 = 0.35 + seededRandom() * 0.2;
      const branchRotations = [seededRandom() * 0.3, seededRandom() * 0.3, seededRandom() * 0.3];
      trees.push({ position: [x, 0, z], color: `hsl(${hue}, 50%, ${lightness}%)`, height, trunkRadius1, trunkRadius2, branchRotations });
    }
    return trees;
  }, []);

  const rockData = useMemo(() => {
    const rocks: { position: [number, number, number]; rotation: [number, number, number]; scale: number }[] = [];
    let seed = 54321;
    const seededRandom = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const radius = 6 + seededRandom() * 25;
      const x = Math.cos(angle) * radius + (seededRandom() - 0.5) * 10;
      const z = Math.sin(angle) * radius + (seededRandom() - 0.5) * 10;
      const scale = 0.3 + seededRandom() * 0.8;
      const rotX = seededRandom() * 0.4;
      const rotY = seededRandom() * Math.PI;
      const rotZ = seededRandom() * 0.4;
      rocks.push({ position: [x, scale * 0.4, z], rotation: [rotX, rotY, rotZ], scale });
    }
    return rocks;
  }, []);

  return (
    <>
      {treeData.map((tree, i) => (
        <group key={i} position={tree.position}>
          {/* Tree trunk */}
          <mesh position={[0, tree.height / 2, 0]} castShadow>
            <cylinderGeometry args={[tree.trunkRadius1, tree.trunkRadius2, tree.height, 8]} />
            <meshStandardMaterial color="#0d0705" roughness={0.95} />
          </mesh>
          {/* Branches */}
          {[0.6, 0.75, 0.9].map((heightRatio, j) => (
            <mesh 
              key={j} 
              position={[0, tree.height * heightRatio, 0]} 
              rotation={[0, j * 2.1, Math.PI / 4 + tree.branchRotations[j]]}
              castShadow
            >
              <cylinderGeometry args={[0.04, 0.08, 1.2, 5]} />
              <meshStandardMaterial color="#0a0505" roughness={0.95} />
            </mesh>
          ))}
          {/* Tree top - layered cones */}
          {[
            { y: tree.height * 0.5, radius: 1.8, height: 2.2 },
            { y: tree.height * 0.7, radius: 1.4, height: 1.8 },
            { y: tree.height * 0.9, radius: 1.0, height: 1.4 },
          ].map((layer, j) => (
            <mesh key={j} position={[0, layer.y, 0]} castShadow>
              <coneGeometry args={[layer.radius, layer.height, 8]} />
              <meshStandardMaterial color={tree.color} roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}
      
      {rockData.map((rock, i) => (
        <mesh key={`rock-${i}`} position={rock.position} rotation={rock.rotation} castShadow receiveShadow>
          <dodecahedronGeometry args={[rock.scale, 0]} />
          <meshStandardMaterial color="#2a2a35" roughness={0.95} />
        </mesh>
      ))}
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[150, 150]} />
        <meshStandardMaterial color="#b8c4cc" roughness={1} />
      </mesh>
      
      {/* Ground fog */}
      <GroundFog density={1.5} />
    </>
  );
}
