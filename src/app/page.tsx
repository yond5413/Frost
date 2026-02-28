'use client';

import dynamic from 'next/dynamic';
import { useGameStore } from '@/lib/store';
import NarrativeDisplay from '@/components/ui/NarrativeDisplay';
import ChoiceSystem from '@/components/ui/ChoiceSystem';
import GameHUD from '@/components/ui/GameHUD';
import JumpScare from '@/components/ui/JumpScare';

const GameScene = dynamic(
  () => import('@/components/three/GameScene'),
  { ssr: false }
);

export default function GamePage() {
  const { phase, setPhase, currentScene, setCurrentScene, currentEnvironment, setCurrentEnvironment } = useGameStore();

  const handleStart = () => {
    setPhase('scene');
    setCurrentEnvironment('lodge');
    setCurrentScene('prologue_start');
  };

  return (
    <main className="w-screen h-screen bg-black overflow-hidden relative">
      <div className="absolute inset-0">
        <GameScene
          cameraPosition={[0, 3, 10]}
        />
      </div>

      <GameHUD />

      {phase === 'intro' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-40">
          <div className="text-center space-y-8">
            <h1 className="text-6xl font-bold text-red-600 tracking-widest uppercase" style={{ textShadow: '0 0 20px rgba(220,38,38,0.5)' }}>
              Frost
            </h1>
            <p className="text-gray-400 text-lg">Until Dawn AI Horror Experience</p>
            <button
              onClick={handleStart}
              className="px-8 py-3 bg-red-900/80 hover:bg-red-700/80 border border-red-600 text-white text-xl rounded transition-all">
              Begin
            </button>
          </div>
        </div>
      )}

      <NarrativeDisplay />
      <ChoiceSystem />
      <JumpScare />
    </main>
  );
}
