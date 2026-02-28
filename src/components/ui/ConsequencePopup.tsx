'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/lib/store';

const consequenceMessages: Record<string, string> = {
  found_totem: 'You discovered a mysterious totem...',
  took_totem: 'The totem\'s vision haunts you.',
  josh_trust_high: 'Josh trusts you more now.',
  josh_trust_low: 'Josh seems defensive...',
  learned_history: 'You learned about the dark history of this mountain.',
};

export default function ConsequencePopup() {
  const { activeConsequence, clearActiveConsequence } = useGameStore();
  
  useEffect(() => {
    if (activeConsequence) {
      const timer = setTimeout(() => {
        clearActiveConsequence();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [activeConsequence, clearActiveConsequence]);
  
  if (!activeConsequence) return null;
  
  const message = consequenceMessages[activeConsequence] || `Consequence: ${activeConsequence}`;
  
  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div 
        className="bg-black/80 border border-red-600 px-6 py-4 rounded-lg animate-pulse"
        style={{
          boxShadow: '0 0 30px rgba(220, 38, 38, 0.4)',
        }}
      >
        <div className="text-red-500 text-sm font-bold tracking-widest mb-1">
          BUTTERFLY EFFECT
        </div>
        <div className="text-gray-200 font-serif text-lg">
          {message}
        </div>
      </div>
    </div>
  );
}
