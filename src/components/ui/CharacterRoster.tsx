'use client';

import { useGameStore } from '@/lib/store';
import { characters } from '@/data/characters';

export default function CharacterRoster() {
  const { characterStates } = useGameStore();
  
  return (
    <div className="flex flex-wrap gap-2">
      {Object.keys(characters)
        .filter((id) => id !== 'narrator')
        .map((charId) => {
          const char = characters[charId];
          const state = characterStates[charId] || 'alive';
          
          return (
            <div
              key={charId}
              className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all duration-300"
              style={{
                backgroundColor: state === 'alive' ? `${char.color}20` : '#1a0000',
                border: `1px solid ${state === 'alive' ? char.color : '#330000'}`,
                color: state === 'alive' ? char.color : '#660000',
                opacity: state === 'unknown' ? 0.5 : 1,
              }}
            >
              <span 
                className="w-2 h-2 rounded-full"
                style={{ 
                  backgroundColor: state === 'alive' ? char.color : '#660000'
                }}
              />
              {char.name}
            </div>
          );
        })}
    </div>
  );
}
