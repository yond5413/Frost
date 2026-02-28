export interface Character {
  id: string;
  name: string;
  color: string;
  borderColor: string;
  spawnPosition: [number, number, number];
}

export const characters: Record<string, Character> = {
  sam:     { id: 'sam',     name: 'Sam',     color: '#60a5fa', borderColor: '#3b82f6', spawnPosition: [-2, 0, -1] },
  mike:    { id: 'mike',    name: 'Mike',    color: '#f87171', borderColor: '#ef4444', spawnPosition: [2, 0, -1] },
  jessica: { id: 'jessica', name: 'Jessica', color: '#c084fc', borderColor: '#a855f7', spawnPosition: [-3, 0, 1] },
  ashley:  { id: 'ashley',  name: 'Ashley',  color: '#fbbf24', borderColor: '#f59e0b', spawnPosition: [1, 0, 2] },
  chris:   { id: 'chris',   name: 'Chris',   color: '#4ade80', borderColor: '#22c55e', spawnPosition: [-1, 0, 2] },
  josh:    { id: 'josh',    name: 'Josh',    color: '#94a3b8', borderColor: '#64748b', spawnPosition: [3, 0, 0] },
  emily:   { id: 'emily',   name: 'Emily',   color: '#f472b6', borderColor: '#ec4899', spawnPosition: [0, 0, -2] },
  matt:    { id: 'matt',    name: 'Matt',    color: '#fb923c', borderColor: '#f97316', spawnPosition: [-3, 0, -2] },
  narrator: { id: 'narrator', name: 'Narrator', color: '#9ca3af', borderColor: '#6b7280', spawnPosition: [0, 0, 0] },
};

export const getCharacter = (id: string): Character => {
  return characters[id] || characters.narrator;
};

// Array form for 3D CharacterGroup (excludes narrator)
export const CHARACTERS: Character[] = Object.values(characters).filter((c) => c.id !== 'narrator');
