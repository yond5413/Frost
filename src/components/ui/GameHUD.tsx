'use client';

import { useGameStore } from '@/lib/store';
import CharacterRoster from './CharacterRoster';

export default function GameHUD() {
  const { clues, fearLevel, phase, voiceEnabled, toggleVoice } = useGameStore();

  const fearBarColor =
    fearLevel > 70
      ? '#dc2626'
      : fearLevel >= 40
      ? '#991b1b'
      : '#450a0a';

  const fearBarGlow =
    fearLevel > 70 ? '0 0 6px rgba(220,38,38,0.5)' : 'none';

  return (
    <div className="absolute top-4 left-4 right-4 flex flex-col gap-2 pointer-events-none z-10">
      {/* CharacterRoster hidden during cinematic scene/choice phases */}
      {phase !== 'scene' && phase !== 'choice' && <CharacterRoster />}

      <div className="flex justify-between items-start">
        <div className="text-xs text-gray-500 font-mono">
          {clues.length > 0 && <div className="text-yellow-500">CLUES: {clues.length}</div>}
        </div>

        <div className="flex items-center gap-3">
          {fearLevel > 0 && (
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono transition-colors duration-500 ${fearLevel > 70 ? 'text-red-500 animate-pulse' : 'text-red-400'}`}>
                FEAR
              </span>
              <div className="w-36 h-1.5 bg-black/60 border border-red-900/30 overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${fearLevel}%`,
                    backgroundColor: fearBarColor,
                    boxShadow: fearBarGlow,
                  }}
                />
              </div>
            </div>
          )}

          {/* Voice toggle */}
          {(phase === 'scene' || phase === 'choice') && (
            <button
              onClick={toggleVoice}
              className="pointer-events-auto text-xs font-mono px-2 py-1 border transition-all"
              style={{
                borderColor: voiceEnabled ? 'rgba(239,68,68,0.8)' : 'rgba(75,85,99,0.6)',
                color: voiceEnabled ? 'rgba(252,165,165,1)' : 'rgba(107,114,128,1)',
                backgroundColor: voiceEnabled ? 'rgba(127,29,29,0.4)' : 'rgba(0,0,0,0.4)',
              }}
            >
              VOICE: {voiceEnabled ? 'ON' : 'OFF'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
