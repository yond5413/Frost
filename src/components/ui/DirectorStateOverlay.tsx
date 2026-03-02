'use client';

import { useGameStore } from '@/lib/store';

export default function DirectorStateOverlay() {
  const {
    phase,
    currentScene,
    aiServiceStatus,
    isDirectorOverlayOpen,
    toggleDirectorOverlay,
    runtimeTelemetry,
  } = useGameStore();

  if (phase === 'intro' || phase === 'ending') return null;

  const modeLabel = runtimeTelemetry.lastDecisionMode === 'ai' ? 'AI Director' : 'Deterministic';
  const statusColor = aiServiceStatus === 'healthy' ? 'text-emerald-400' : aiServiceStatus === 'degraded' ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="fixed left-4 bottom-4 z-50 pointer-events-auto">
      <button
        onClick={toggleDirectorOverlay}
        className="mb-2 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] border border-white/20 bg-black/60 text-gray-300 hover:text-white hover:border-white/40 transition-all"
      >
        Director State {isDirectorOverlayOpen ? 'On' : 'Off'}
      </button>

      {isDirectorOverlayOpen && (
        <div className="w-72 bg-black/85 border border-white/10 p-3 text-[11px] font-mono text-gray-300">
          <div className="flex items-center justify-between mb-2">
            <span className="uppercase tracking-[0.2em] text-[9px] text-gray-500">AI Director Debug</span>
            <span className={statusColor}>{aiServiceStatus}</span>
          </div>

          <div className="space-y-1 text-gray-400">
            <div>Scene: <span className="text-gray-200">{currentScene}</span></div>
            <div>Last mode: <span className="text-gray-200">{modeLabel}</span></div>
            <div>Last reason: <span className="text-gray-200">{runtimeTelemetry.lastDecisionReason || 'n/a'}</span></div>
            <div>AI decisions: <span className="text-gray-200">{runtimeTelemetry.aiDecisions}</span></div>
            <div>Deterministic transitions: <span className="text-gray-200">{runtimeTelemetry.deterministicTransitions}</span></div>
            <div>Fallbacks: <span className="text-gray-200">{runtimeTelemetry.aiFallbacks}</span></div>
            <div>Timeouts: <span className="text-gray-200">{runtimeTelemetry.aiTimeouts}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
