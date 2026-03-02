'use client';

import { useGameStore } from '@/lib/store';
import { getScene } from '@/data/story';
import Character from './Character';

const PLAYABLE_SET = new Set(['sam', 'mike', 'jessica', 'ashley', 'chris', 'josh', 'emily', 'matt', 'hannah', 'beth']);

export default function CharacterGroup() {
  const currentScene = useGameStore((state) => state.currentScene);
  const scene = getScene(currentScene);

  // Only render characters who speak in this scene and have a 3D model
  const sceneCharacters = Array.from(
    new Set(scene.dialogue.map((d) => d.speaker).filter((s) => PLAYABLE_SET.has(s)))
  );
  const toRender = sceneCharacters.length > 0 ? sceneCharacters : [...PLAYABLE_SET];

  return (
    <group>
      {toRender.map((id) => (
        <Character key={id} characterId={id} />
      ))}
    </group>
  );
}
