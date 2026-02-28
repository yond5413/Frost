'use client';

import dynamic from 'next/dynamic';
import { useGameStore } from '@/lib/store';
import type { EnvironmentType } from '@/lib/environmentStore';
import { Stars } from '@react-three/drei';

const Atmosphere = dynamic(() => import('@/components/three/shared/Atmosphere'), { ssr: false });
const Cabin = dynamic(() => import('@/components/three/environments/Cabin'), { ssr: false });
const LodgeInterior = dynamic(() => import('@/components/three/environments/LodgeInterior'), { ssr: false });
const ExpandedWoods = dynamic(() => import('@/components/three/environments/ExpandedWoods'), { ssr: false });
const MinesEnvironment = dynamic(() => import('@/components/three/environments/MinesEnvironment'), { ssr: false });

interface EnvironmentManagerProps {
  showCharacters?: boolean;
}

export default function EnvironmentManager({ showCharacters = true }: EnvironmentManagerProps) {
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
            <Cabin />
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
      {currentEnvironment !== 'mines' && (
        <Stars radius={100} depth={50} count={2000} factor={4} fade speed={0.5} />
      )}
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
