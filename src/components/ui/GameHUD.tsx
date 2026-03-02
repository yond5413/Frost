'use client';

import { useGameStore } from '@/lib/store';
import CharacterRoster from './CharacterRoster';

export default function GameHUD() {
  const { clues, fearLevel, phase, togglePause, runtimeTelemetry, aiServiceStatus, voiceEnabled, setVoiceEnabled } = useGameStore();

  const fearBarColor =
    fearLevel > 70
      ? '#dc2626'
      : fearLevel >= 40
      ? '#991b1b'
      : '#450a0a';

  const fearBarGlow =
    fearLevel > 70 ? '0 0 6px rgba(220,38,38,0.5)' : 'none';

  const decisionModeLabel = runtimeTelemetry.lastDecisionMode === 'ai' ? 'AI DIRECTOR' : 'DETERMINISTIC';
  const decisionModeClass = runtimeTelemetry.lastDecisionMode === 'ai' ? 'text-cyan-300 border-cyan-700/40' : 'text-gray-300 border-gray-700/40';
  const aiStatusDotClass = aiServiceStatus === 'healthy' ? 'bg-emerald-500' : aiServiceStatus === 'degraded' ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="absolute top-4 left-4 right-4 flex flex-col gap-2 pointer-events-none z-10">
      {/* CharacterRoster hidden during cinematic scene/choice phases */}
      {phase !== 'scene' && phase !== 'choice' && <CharacterRoster />}

      <div className="flex justify-between items-start">
        <div className="text-xs text-gray-500 font-mono">
          {clues.length > 0 && <div className="text-yellow-500">CLUES: {clues.length}</div>}
        </div>

        <div className="flex items-center gap-3">
          {/* Pause button and hint */}
          {(phase === 'scene' || phase === 'choice' || phase === 'exploration') && (
            <div className="flex items-center gap-2">
              <div className={`pointer-events-none text-[10px] font-mono px-2 py-1 border ${decisionModeClass} bg-black/40 flex items-center gap-1.5`}>
                <span className={`w-1.5 h-1.5 rounded-full ${aiStatusDotClass}`} />
                <span>{decisionModeLabel}</span>
              </div>
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className="pointer-events-auto text-[10px] font-mono px-2 py-1 border border-cyan-800/40 text-cyan-300/80 hover:text-cyan-200 hover:border-cyan-500/60 transition-all"
              >
                VOICE {voiceEnabled ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={togglePause}
                className="pointer-events-auto text-xs font-mono px-2 py-1 border border-white/10 text-gray-600 hover:text-gray-400 hover:border-white/20 transition-all"
              >
                &#9646;&#9646;
              </button>
              <span className="pointer-events-none text-[10px] font-mono text-gray-600">Press ESC to pause</span>
            </div>
          )}

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
        </div>
      </div>
    </div>
  );
}
