'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/store';

interface DeathEvent {
  characterId: string;
  timestamp: number;
}

export default function CharacterDeathEffects() {
  const [deathEvents, setDeathEvents] = useState<DeathEvent[]>([]);
  const [currentDeath, setCurrentDeath] = useState<DeathEvent | null>(null);
  const consequences = useGameStore((state) => state.consequences);
  
  useEffect(() => {
    const deathCons = consequences.filter(c => c.startsWith('death_'));
    const newDeaths = deathCons.map(c => ({
      characterId: c.replace('death_', ''),
      timestamp: Date.now(),
    })).filter(d => !deathEvents.some(e => e.characterId === d.characterId));
    
    if (newDeaths.length > 0) {
      const latest = newDeaths[newDeaths.length - 1];
      const timer = setTimeout(() => {
        setCurrentDeath(latest);
        setDeathEvents(newDeaths);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [consequences, deathEvents]);

  if (!currentDeath) return null;

  const characterNames: Record<string, string> = {
    sam: 'Samantha',
    mike: 'Mike',
    jessica: 'Jessica',
    emily: 'Emily',
    ashley: 'Ashley',
    chris: 'Chris',
    josh: 'Josh',
    matt: 'Matt',
    hannah: 'Hannah',
    beth: 'Beth',
  };

  const name = characterNames[currentDeath.characterId] || currentDeath.characterId;

  return (
    <DeathAnimation characterName={name} onComplete={() => setCurrentDeath(null)} />
  );
}

function DeathAnimation({ characterName, onComplete }: { characterName: string; onComplete: () => void }) {
  const [phase, setPhase] = useState<'flash' | 'name' | 'fade' | 'done'>('flash');

   useEffect(() => {
     setTimeout(() => setPhase('name'), 150);
     setTimeout(() => setPhase('fade'), 2000);
     setTimeout(() => { setPhase('done'); onComplete(); }, 4000);
   }, [onComplete]);

  if (phase === 'done') return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {phase === 'flash' && (
        <div className="absolute inset-0 bg-red-700 animate-pulse" style={{ animationDuration: '150ms' }} />
      )}

      {phase === 'name' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center animate-pulse">
            <p className="text-red-600 text-sm tracking-[0.5em] uppercase mb-2">Character Lost</p>
            <h2 className="text-8xl font-black text-red-600 tracking-widest animate-pulse" style={{ textShadow: '0 0 40px rgba(220,38,38,0.8)' }}>
              {characterName.toUpperCase()}
            </h2>
            <p className="text-red-800 text-lg mt-4 tracking-[0.3em]">HAS PERISHED</p>
          </div>
        </div>
      )}

      {phase === 'fade' && (
        <div className="absolute inset-0 bg-black/90 transition-opacity duration-1000" />
      )}
    </div>
  );
}

export function useDeathTrigger(characterId: string, onDeath: () => void) {
  const consequences = useGameStore((state) => state.consequences);
  
  useEffect(() => {
    if (consequences.includes(`death_${characterId}`)) {
      onDeath();
    }
  }, [consequences, characterId, onDeath]);
}
