'use client';

import { getCharacter } from '@/data/characters';

interface CharacterPortraitProps {
  speakerId: string;
  className?: string;
}

export default function CharacterPortrait({ speakerId, className = '' }: CharacterPortraitProps) {
  const character = getCharacter(speakerId);
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg border-2"
        style={{ 
          backgroundColor: character.color,
          borderColor: character.color,
          boxShadow: `0 0 10px ${character.color}40`
        }}
      >
        {character.name.charAt(0)}
      </div>
      <span 
        className="text-lg font-semibold tracking-wide"
        style={{ color: character.color }}
      >
        {character.name}
      </span>
    </div>
  );
}
