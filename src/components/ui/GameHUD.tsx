'use client';

import { useGameStore } from '@/lib/store';
import CharacterRoster from './CharacterRoster';

export default function GameHUD() {
  const { playerChoices, clues, fearLevel, phase } = useGameStore();
  
  return (
    <div className="absolute top-4 left-4 right-4 flex flex-col gap-2 pointer-events-none">
      <CharacterRoster />
      
      <div className="flex justify-between items-start">
        <div className="text-xs text-gray-500 font-mono">
          <div>CHOICES: {playerChoices.length}</div>
          {clues.length > 0 && <div className="text-yellow-500">CLUES: {clues.length}</div>}
        </div>
        
        {fearLevel > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-500 font-mono">FEAR</span>
            <div className="w-24 h-2 bg-black/60 border border-red-900/50 rounded overflow-hidden">
              <div 
                className="h-full bg-red-600 transition-all duration-500"
                style={{ width: `${fearLevel}%` }}
              />
            </div>
          </div>
        )}
        
        {phase === 'choice' && (
          <div className="text-red-500 text-xs font-mono animate-pulse">
            SELECT A CHOICE
          </div>
        )}
      </div>
    </div>
  );
}
