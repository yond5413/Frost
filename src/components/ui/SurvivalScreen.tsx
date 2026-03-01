'use client';

import { useGameStore } from '@/lib/store';
import { getCharacter } from '@/data/characters';

export default function SurvivalScreen() {
  const { phase, characterStates, fearLevel, storyMemory, resetGame } = useGameStore();

  const deaths = useGameStore.getState().consequences.filter((c) => c.startsWith('death_'));

  if (phase !== 'ending' || deaths.length > 0) return null;

  const survivors = Object.entries(characterStates)
    .filter(([, state]) => state === 'alive')
    .map(([charId]) => getCharacter(charId).name);

  const relatedChoices = storyMemory.slice(-5);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center px-8">
      {/* Header */}
      <div className="w-full max-w-lg text-center mb-10">
        <p className="text-emerald-500/60 text-[10px] uppercase tracking-[0.5em] mb-3">Against all odds</p>
        <h2 className="text-white font-serif text-4xl capitalize mb-2">Everyone Survived</h2>
        <p className="text-gray-600 text-sm">You lived through the night</p>
      </div>

      <div className="w-px h-12 bg-gray-800 mb-8" />

      {/* Survivors */}
      {survivors.length > 0 && (
        <div className="w-full max-w-lg mb-6">
          <p className="text-[10px] uppercase tracking-[0.4em] text-gray-700 mb-3">Survivors</p>
          <div className="flex flex-wrap gap-2">
            {survivors.map((name) => (
              <span
                key={name}
                className="px-3 py-1 border border-emerald-900/40 text-emerald-300 text-xs uppercase tracking-wider"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Fear level */}
      <div className="w-full max-w-lg mb-6">
        <div className="flex justify-between text-[10px] uppercase tracking-widest text-gray-600 mb-2">
          <span>Final fear level</span>
          <span className={fearLevel >= 80 ? 'text-red-400' : 'text-emerald-400'}>{fearLevel}/100</span>
        </div>
        <div className="w-full h-px bg-gray-900">
          <div
            className="h-px bg-gradient-to-r from-emerald-700 to-emerald-500 transition-all duration-1000"
            style={{ width: `${fearLevel}%` }}
          />
        </div>
      </div>

      {/* Key choices */}
      {relatedChoices.length > 0 && (
        <div className="w-full max-w-lg mb-8">
          <p className="text-[10px] uppercase tracking-[0.4em] text-gray-700 mb-3">Choices that led here</p>
          <div className="space-y-2">
            {relatedChoices.map((entry, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-gray-500">
                <span className="text-gray-700 mt-0.5 shrink-0">—</span>
                <span className="font-mono text-xs">{entry.consequence}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="w-px h-8 bg-gray-800 mb-8" />

      {/* Play again */}
      <button
        onClick={resetGame}
        className="w-56 px-8 py-4 border border-white/15 text-white text-xs tracking-[0.35em] uppercase hover:bg-white/5 hover:border-white/30 transition-all duration-300"
      >
        Play Again
      </button>

      <p className="text-gray-800 text-[10px] tracking-widest uppercase mt-4">
        Every choice echoes
      </p>
    </div>
  );
}
