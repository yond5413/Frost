'use client';

import { useState, useEffect } from 'react';
import { useGameStore, NarratorPersonality, BehavioralProfile } from '@/lib/store';

const PERSONALITY_LABELS: Record<NarratorPersonality, string> = {
  balanced: 'Balanced',
  brutal: 'Brutal',
  merciful: 'Merciful',
  chaotic: 'Chaotic',
};

const AXIS_LABELS: Array<{ key: keyof BehavioralProfile; label: string; highNote: string; lowNote: string }> = [
  { key: 'recklessness', label: 'Recklessness', highNote: 'High = player charged in', lowNote: 'Low = avoidant' },
  { key: 'loyalty',      label: 'Loyalty',       highNote: 'High = group bonds kept',  lowNote: 'Low = abandoned others' },
  { key: 'deception',    label: 'Deception',      highNote: 'High = used others',       lowNote: 'Low = transparent' },
  { key: 'survivalFocus',label: 'Survival Focus', highNote: 'High = self-serving',      lowNote: 'Low = self-sacrificing' },
];

function BehavioralBar({ label, value, highNote, lowNote }: { label: string; value: number; highNote: string; lowNote: string }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-mono uppercase tracking-widest text-gray-400">{label}</span>
        <span className="text-xs font-mono text-gray-500">{value}/100</span>
      </div>
      <div className="w-full h-1.5 bg-white/10 border border-white/5">
        <div
          className="h-full bg-cyan-600 transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="text-[10px] text-gray-600 mt-0.5">
        {value > 65 ? highNote : value < 35 ? lowNote : 'Moderate'}
      </p>
    </div>
  );
}

function formatDelta(key: string, val: number) {
  if (val === 0) return null;
  return (
    <span key={key} className={`text-[10px] font-mono mr-2 ${val > 0 ? 'text-cyan-400' : 'text-red-400'}`}>
      {val > 0 ? '+' : ''}{val} {key}
    </span>
  );
}

export default function PauseMenu() {
  const {
    togglePause,
    narratorPersonality,
    fearLevel,
    characterStates,
    behavioralProfile,
    storyMemory,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'state' | 'log'>('state');

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') togglePause();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePause]);

  const aliveChars = Object.entries(characterStates).filter(([, s]) => s === 'alive').map(([n]) => n);
  const deadChars = Object.entries(characterStates).filter(([, s]) => s === 'dead').map(([n]) => n);

  const fearBarColor = fearLevel > 60 ? '#dc2626' : fearLevel > 30 ? '#ca8a04' : '#16a34a';

  // Filter memory entries that have behavioral data
  const logEntries = storyMemory.filter(e => e.consequence);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90" onClick={togglePause} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-lg mx-4 border border-white/10 bg-black" style={{ fontFamily: 'monospace' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <span className="text-xs uppercase tracking-[0.3em] text-gray-400">Director Log</span>
          <button
            onClick={togglePause}
            className="text-gray-600 hover:text-gray-300 text-lg leading-none transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {(['state', 'log'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-[10px] uppercase tracking-[0.25em] transition-colors ${
                activeTab === tab
                  ? 'text-white border-b border-white'
                  : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              {tab === 'state' ? 'Run State' : 'Director Log'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
          {activeTab === 'state' && (
            <div>
              {/* Personality badge */}
              <div className="mb-5">
                <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1.5">Narrator</p>
                <span className="text-xs font-mono px-2 py-1 border border-cyan-600/40 text-cyan-400">
                  {PERSONALITY_LABELS[narratorPersonality]}
                </span>
              </div>

              {/* Fear bar */}
              <div className="mb-5">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-[10px] uppercase tracking-widest text-gray-600">Fear Level</p>
                  <span className="text-xs font-mono text-gray-500">{fearLevel}/100</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 border border-white/5">
                  <div
                    className="h-full transition-all duration-500"
                    style={{ width: `${fearLevel}%`, backgroundColor: fearBarColor }}
                  />
                </div>
              </div>

              {/* Survivors */}
              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2">Survivors</p>
                <div className="flex flex-wrap gap-1.5">
                  {aliveChars.map(name => (
                    <span key={name} className="text-[10px] font-mono px-1.5 py-0.5 border border-green-800/50 text-green-500 capitalize">{name}</span>
                  ))}
                  {deadChars.map(name => (
                    <span key={name} className="text-[10px] font-mono px-1.5 py-0.5 border border-red-900/40 text-red-700 line-through capitalize">{name}</span>
                  ))}
                  {aliveChars.length === 0 && deadChars.length === 0 && (
                    <span className="text-[10px] text-gray-700">No data yet</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'log' && (
            <div>
              {/* Behavioral profile bars */}
              <div className="mb-5">
                <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-3">Behavioral Profile</p>
                {AXIS_LABELS.map(({ key, label, highNote, lowNote }) => (
                  <BehavioralBar
                    key={key}
                    label={label}
                    value={behavioralProfile[key]}
                    highNote={highNote}
                    lowNote={lowNote}
                  />
                ))}
              </div>

              {/* Decision history */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2">Decision History</p>
                {logEntries.length === 0 ? (
                  <p className="text-[10px] text-gray-700 italic">No AI decisions recorded yet.</p>
                ) : (
                  <div className="space-y-0">
                    {logEntries.map((entry, i) => {
                      const deltas = entry.behavioralDeltas;
                      const deltaNodes = deltas
                        ? Object.entries(deltas)
                            .map(([k, v]) => formatDelta(k, v as number))
                            .filter(Boolean)
                        : [];

                      return (
                        <div key={i} className="py-2.5 border-b border-white/5 last:border-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] uppercase tracking-widest text-gray-700">{entry.sceneId}</span>
                          </div>
                          <p className="text-[11px] text-gray-400 leading-relaxed mb-1">{entry.consequence}</p>
                          {deltaNodes.length > 0 && (
                            <div className="flex flex-wrap">{deltaNodes}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10">
          <p className="text-[9px] text-gray-700 uppercase tracking-widest text-center">Press Esc to resume</p>
        </div>
      </div>
    </div>
  );
}
