'use client';

import dynamic from 'next/dynamic';
import { useGameStore } from '@/lib/store';
import type { EnvironmentType } from '@/lib/environmentStore';

const Atmosphere = dynamic(() => import('@/components/three/shared/Atmosphere'), { ssr: false });
const Cabin = dynamic(() => import('@/components/three/environments/Cabin'), { ssr: false });
const LodgeInterior = dynamic(() => import('@/components/three/environments/LodgeInterior'), { ssr: false });
const ExpandedWoods = dynamic(() => import('@/components/three/environments/ExpandedWoods'), { ssr: false });
const MinesEnvironment = dynamic(() => import('@/components/three/environments/MinesEnvironment'), { ssr: false });

export default function EnvironmentManager() {
  const currentEnvironment = useGameStore((state) => state.currentEnvironment) as EnvironmentType;

  const renderEnvironment = () => {
    switch (currentEnvironment) {
      case 'cabin':
        return (
          <group>
            <Cabin />
            <ExpandedWoods />
          </group>
        );
      case 'lodge':
        return (
          <group>
            <LodgeInterior />
            <group position={[0, -0.1, 0]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial color="#c8d4dc" roughness={1} />
              </mesh>
            </group>
          </group>
        );
      case 'woods':
        return (
          <group>
            <ExpandedWoods />
            <group position={[0, 0, -22]}>
              <Cabin />
            </group>
          </group>
        );
      case 'mines':
        return (
          <group>
            <MinesEnvironment />
          </group>
        );
      default:
        return (
          <group>
            <Cabin />
            <ExpandedWoods />
          </group>
        );
    }
  };

  return (
    <>
      <Atmosphere environment={currentEnvironment} />
      {renderEnvironment()}
      {currentEnvironment === 'cabin' && <SnowGround />}
    </>
  );
}

function SnowGround() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#e8eef5" roughness={1} />
    </mesh>
  );
}
