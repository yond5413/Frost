'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store';

const AI_OBSERVATIONS = [
  'The mountain has been watching.',
  'Every thread pulls the next.',
  'The Wendigo memory is long.',
  'Your choices leave marks in the snow.',
  'Nothing is forgotten here.',
  'Each decision echoes forward.',
  'The cold remembers.',
];

function getObservation(index: number): string {
  return AI_OBSERVATIONS[index % AI_OBSERVATIONS.length];
}

export default function ButterflyEffectTracker() {
  const storyMemory = useGameStore((state) => state.storyMemory);
  const [isExpanded, setIsExpanded] = useState(false);

  if (storyMemory.length === 0) return null;

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-stretch">
      {/* Expanded panel */}
      {isExpanded && (
        <div className="w-64 max-h-[60vh] flex flex-col bg-black/90 border-l border-white/10 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
            <span className="text-[9px] uppercase tracking-[0.35em] text-gray-500">
              AI Director Log
            </span>
            <span className="text-[9px] text-gray-600">
              {storyMemory.length} decision{storyMemory.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Entries */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-2 space-y-3 scrollbar-none">
            {storyMemory.slice().reverse().map((entry, i) => (
              <div key={`${entry.choiceId}-${entry.sceneId}-${i}`} className="border-l border-white/10 pl-2">
                <p className="text-gray-400 text-xs leading-relaxed">
                  {entry.consequence || 'A consequence was recorded, but details were lost in the storm.'}
                </p>
                <p className="text-gray-600 italic text-[10px] mt-1">
                  {getObservation(storyMemory.length - 1 - i)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collapsed strip / toggle */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="flex flex-col items-center justify-center gap-2 w-7 bg-black/90 border-l border-white/10 py-4 hover:bg-black/80 transition-colors"
        aria-label={isExpanded ? 'Collapse AI director log' : 'Expand AI director log'}
      >
        {/* Butterfly icon */}
        <svg
          viewBox="0 0 100 100"
          className="w-3.5 h-3.5 fill-current text-gray-600"
        >
          <path d="M50 50 C20 20 10 50 10 70 C10 90 30 90 50 70 C70 90 90 90 90 70 C90 50 80 20 50 50 Z" />
        </svg>

        {/* Count badge */}
        <span className="text-[8px] tabular-nums text-gray-600">
          {storyMemory.length}
        </span>

        {/* Expand/collapse chevron */}
        <span className="text-gray-700 text-[8px] mt-1">
          {isExpanded ? '›' : '‹'}
        </span>
      </button>
    </div>
  );
}
