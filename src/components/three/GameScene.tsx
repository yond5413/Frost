'use client';

'use client';
import { Canvas } from '@react-three/fiber';
import { useGameStore } from '@/lib/store';
import EnvironmentManager from './EnvironmentManager';
import CharacterGroup from './CharacterGroup';
import Wendigo from './Wendigo';
import { getScene } from '@/data/story';

interface SceneProps {
  cameraPosition?: [number, number, number];
}

export default function GameScene({ cameraPosition = [0, 3, 10] }: SceneProps) {
  const { currentScene, currentEnvironment, wendigoActive } = useGameStore();
  const sceneData = getScene(currentScene);

  const sceneCameraPosition = sceneData.cameraPosition || cameraPosition;

  return (
    <Canvas
      shadows
      camera={{ position: sceneCameraPosition, fov: 60 }}
      className="w-full h-full"
    >
      <EnvironmentManager />
      <CharacterGroup />
      {wendigoActive && <Wendigo />}
    </Canvas>
  );
}
