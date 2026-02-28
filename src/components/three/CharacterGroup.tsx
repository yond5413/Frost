'use client';

import Character from './Character';

const PLAYABLE_CHARACTERS = ['sam', 'mike', 'jessica', 'ashley', 'chris', 'josh', 'emily', 'matt'];

export default function CharacterGroup() {
  return (
    <group>
      {PLAYABLE_CHARACTERS.map((characterId) => (
        <Character key={characterId} characterId={characterId} />
      ))}
    </group>
  );
}
