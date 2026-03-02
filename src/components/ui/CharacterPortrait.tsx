'use client';

import { getCharacter } from '@/data/characters';

interface CharacterPortraitProps {
  speakerId: string;
  className?: string;
  mood?: 'neutral' | 'happy' | 'angry' | 'sad' | 'scared' | 'nervous' | 'determined' | 'serious' | 'warning' | 'somber' | 'hopeful' | 'shock';
}

export default function CharacterPortrait({ speakerId, className = '', mood = 'neutral' }: CharacterPortraitProps) {
  const character = getCharacter(speakerId);

  const getMoodFilter = () => {
    switch (mood) {
      case 'scared':
      case 'shock':    return 'brightness(1.2) saturate(0.6)';
      case 'angry':    return 'saturate(2) hue-rotate(-15deg) brightness(1.1)';
      case 'sad':      return 'grayscale(0.6) brightness(0.8)';
      case 'nervous':  return 'brightness(0.85) saturate(0.75)';
      case 'happy':    return 'brightness(1.15) saturate(1.3)';
      case 'determined': return 'contrast(1.1) brightness(1.05)';
      default:         return 'none';
    }
  };

  const isPulsing = mood === 'scared' || mood === 'shock';

  return (
    <div
      className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-black text-3xl flex-shrink-0 transition-all duration-500 ${isPulsing ? 'animate-pulse' : ''} ${className}`}
      style={{
        backgroundColor: character.color + '22',
        border: `2px solid ${character.color}`,
        boxShadow: `0 0 0 1px ${character.color}30, 0 0 0 3px ${character.borderColor}, 0 0 20px ${character.color}55`,
        filter: getMoodFilter(),
      }}
    >
      {character.name.charAt(0)}
    </div>
  );
}
