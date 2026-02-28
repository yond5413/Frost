'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useGameStore } from '@/lib/store';
import NarrativeDisplay from '@/components/ui/NarrativeDisplay';
import ChoiceSystem from '@/components/ui/ChoiceSystem';
import GameHUD from '@/components/ui/GameHUD';
import JumpScare from '@/components/ui/JumpScare';

const GameScene = dynamic(() => import('@/components/three/GameScene'), { ssr: false });

export default function GamePage() {
  const { phase, setPhase, currentScene, setCurrentScene, setCurrentEnvironment, fearLevel } =
    useGameStore();

  const [isTransitioning, setIsTransitioning] = useState(false);

  // Fade-to-black on scene change
  useEffect(() => {
    if (phase === 'scene' || phase === 'choice') {
      setIsTransitioning(true);
      const t = setTimeout(() => setIsTransitioning(false), 500);
      return () => clearTimeout(t);
    }
  }, [currentScene, phase]);

  const handleStart = () => {
    setPhase('scene');
    setCurrentEnvironment('lodge');
    setCurrentScene('prologue_start');
  };

  const handleSkipToCh2 = () => {
    setPhase('scene');
    setCurrentEnvironment('cabin');
    setCurrentScene('chapter2_start');
  };

  // Fear-based visual effects via CSS
  const saturation = Math.max(0.2, 1 - fearLevel * 0.008);
  const vignetteOpacity = 0.3 + fearLevel * 0.005;

  return (
    <main className="w-screen h-screen bg-black overflow-hidden relative">
      {/* 3D scene with fear-based desaturation */}
      <div
        className="absolute inset-0"
        style={{ filter: `saturate(${saturation})` }}
      >
        <GameScene cameraPosition={[0, 3, 10]} />
      </div>

      {/* Fear vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${vignetteOpacity}) 100%)`,
        }}
      />

      {/* Scene fade-to-black transition */}
      <div
        className={`absolute inset-0 bg-black z-20 pointer-events-none transition-opacity duration-500 ${
          isTransitioning ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <GameHUD />

      {phase === 'intro' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-40">
          <div className="text-center space-y-8">
            <h1
              className="text-6xl font-bold text-red-600 tracking-widest uppercase animate-pulse"
              style={{
                textShadow: '0 0 20px rgba(220,38,38,0.8), 0 0 60px rgba(220,38,38,0.4)',
              }}
            >
              Frost
            </h1>
            <p className="text-gray-400 text-lg">Until Dawn AI Horror Experience</p>
            <div className="space-y-3">
              <button
                onClick={handleStart}
                className="block w-full px-8 py-3 bg-red-900/80 hover:bg-red-700/80 border border-red-600 text-white text-xl rounded transition-all"
              >
                Begin
              </button>
              <button
                onClick={handleSkipToCh2}
                className="block w-full px-8 py-2 text-gray-500 text-sm border border-dashed border-gray-700 hover:border-gray-500 hover:text-gray-400 rounded transition-all"
              >
                ⚙ SKIP TO CH.2 (dev)
              </button>
            </div>
          </div>
        </div>
      )}

      <NarrativeDisplay />
      <ChoiceSystem />
      <JumpScare />
    </main>
  );
}
