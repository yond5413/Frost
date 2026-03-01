'use client';

import { useGameStore } from '@/lib/store';

export default function DeathRecap() {
  const { phase, consequences, fearLevel, storyMemory, resetGame } = useGameStore();

  const deaths = consequences.filter((c) => c.startsWith('death_')).map((c) => c.replace('death_', ''));

  if (phase !== 'ending' || deaths.length === 0) return null;

  const primaryDeath = deaths[0];
  const relatedChoices = storyMemory.slice(-5);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center px-8">
      {/* Header */}
      <div className="w-full max-w-lg text-center mb-10">
        <p className="text-red-500/60 text-[10px] uppercase tracking-[0.5em] mb-3">The mountain claimed another</p>
        <h2 className="text-white font-serif text-4xl capitalize mb-2">{primaryDeath}</h2>
        <p className="text-gray-600 text-sm">has died.</p>
      </div>

      <div className="w-px h-12 bg-gray-800 mb-8" />

      {/* Fear level */}
      <div className="w-full max-w-lg mb-6">
        <div className="flex justify-between text-[10px] uppercase tracking-widest text-gray-600 mb-2">
          <span>Fear reached</span>
          <span className={fearLevel >= 80 ? 'text-red-400' : 'text-gray-400'}>{fearLevel}/100</span>
        </div>
        <div className="w-full h-px bg-gray-900">
          <div
            className="h-px bg-gradient-to-r from-gray-600 to-red-600 transition-all duration-1000"
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

      {/* Try again */}
      <button
        onClick={resetGame}
        className="w-56 px-8 py-4 border border-white/15 text-white text-xs tracking-[0.35em] uppercase hover:bg-white/5 hover:border-white/30 transition-all duration-300"
      >
        Try Again
      </button>

      <p className="text-gray-800 text-[10px] tracking-widest uppercase mt-4">
        Every choice echoes
      </p>
    </div>
  );
}
