'use client';

import { useMemo } from 'react';

export default function ExpandedWoods() {
  const treeData = useMemo(() => {
    const trees: { position: [number, number, number]; color: string }[] = [];
    let seed = 12345;
    const seededRandom = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    for (let i = 0; i < 80; i++) {
      const angle = (i / 80) * Math.PI * 2;
      const radius = 10 + seededRandom() * 35;
      const x = Math.cos(angle) * radius + (seededRandom() - 0.5) * 15;
      const z = Math.sin(angle) * radius + (seededRandom() - 0.5) * 15;
      const hue = 100 + seededRandom() * 30;
      const lightness = 12 + seededRandom() * 8;
      trees.push({ position: [x, 0, z], color: `hsl(${hue}, 50%, ${lightness}%)` });
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
    for (let i = 0; i < 25; i++) {
      const angle = (i / 25) * Math.PI * 2;
      const radius = 8 + seededRandom() * 20;
      const x = Math.cos(angle) * radius + (seededRandom() - 0.5) * 8;
      const z = Math.sin(angle) * radius + (seededRandom() - 0.5) * 8;
      const scale = 0.3 + seededRandom() * 0.7;
      const rotX = seededRandom() * 0.3;
      const rotY = seededRandom() * Math.PI;
      const rotZ = seededRandom() * 0.3;
      rocks.push({ position: [x, scale * 0.5, z], rotation: [rotX, rotY, rotZ], scale });
    }
    return rocks;
  }, []);

  return (
    <>
      {treeData.map((tree, i) => (
        <group key={i} position={tree.position}>
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.4, 3, 8]} />
            <meshStandardMaterial color="#1a0a00" />
          </mesh>
          {[2, 3.5, 5].map((y, j) => (
            <mesh key={j} position={[0, y, 0]} castShadow>
              <coneGeometry args={[1.8 - j * 0.35, 2.2, 8]} />
              <meshStandardMaterial color={tree.color} />
            </mesh>
          ))}
        </group>
      ))}
      
      {rockData.map((rock, i) => (
        <mesh key={`rock-${i}`} position={rock.position} rotation={rock.rotation} castShadow>
          <dodecahedronGeometry args={[rock.scale, 0]} />
          <meshStandardMaterial color="#3a3a4a" roughness={0.95} />
        </mesh>
      ))}
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[150, 150]} />
        <meshStandardMaterial color="#c8d4dc" roughness={1} />
      </mesh>
    </>
  );
}
