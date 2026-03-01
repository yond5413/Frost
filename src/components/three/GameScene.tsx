'use client';

import { useRef, useEffect, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { CameraShake, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@/lib/store';
import EnvironmentManager from './EnvironmentManager';
import CharacterGroup from './CharacterGroup';
import Wendigo from './Wendigo';
import { getScene } from '@/data/story';

interface CameraControllerProps {
  target: [number, number, number];
  disabled: boolean;
}

function CameraController({ target, disabled }: CameraControllerProps) {
  const { camera } = useThree();
  const targetRef = useRef(new THREE.Vector3(...target));

  useEffect(() => {
    targetRef.current.set(target[0], target[1], target[2]);
  }, [target]);

  useFrame((_, delta) => {
    if (disabled) return;
    camera.position.lerp(targetRef.current, Math.min(1, delta * 2));
  });

  return null;
}

interface SceneProps {
  cameraPosition?: [number, number, number];
}

export default function GameScene({ cameraPosition = [0, 3, 10] }: SceneProps) {
  const { currentScene, wendigoActive } = useGameStore();
  const sceneData = getScene(currentScene);
  const sceneCameraPosition = sceneData.cameraPosition || cameraPosition;

  return (
    <Canvas
      shadows
      camera={{ position: sceneCameraPosition, fov: 60 }}
      className="w-full h-full"
    >
      <Suspense fallback={null}>
        <CameraController target={sceneCameraPosition} disabled={wendigoActive} />
        <EnvironmentManager />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <CharacterGroup />
        {wendigoActive && <Wendigo />}
        {wendigoActive && (
          <CameraShake
            intensity={0.3}
            decay={false}
            maxYaw={0.02}
            maxPitch={0.02}
            maxRoll={0.01}
            yawFrequency={0.8}
            pitchFrequency={0.8}
            rollFrequency={0.4}
          />
        )}
      </Suspense>
    </Canvas>
  );
}
