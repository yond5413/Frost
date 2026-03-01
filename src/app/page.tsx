'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useGameStore } from '@/lib/store';
import NarrativeDisplay from '@/components/ui/NarrativeDisplay';
import ChoiceSystem from '@/components/ui/ChoiceSystem';
import GameHUD from '@/components/ui/GameHUD';
import JumpScare from '@/components/ui/JumpScare';
import DontMoveQTE from '@/components/ui/DontMoveQTE';
import ButterflyNotification from '@/components/ui/ButterflyNotification';
import StatusUpdateToast from '@/components/ui/StatusUpdateToast';
import FearEffects from '@/components/ui/FearEffects';
import SceneTitleCard from '@/components/ui/SceneTitleCard';
import { LightningFlashEffect } from '@/components/three/LightningFlash';
import CharacterDeathEffects from '@/components/ui/CharacterDeathEffects';

const GameScene = dynamic(() => import('@/components/three/GameScene'), { ssr: false });

// Seeded random for stable snow particles
const SNOW_PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 7) % 100}%`,
  width: `${1 + (i % 3)}px`,
  height: `${1 + (i % 3)}px`,
  animationDuration: `${6 + (i * 1.3) % 8}s`,
  animationDelay: `${(i * 0.7) % 5}s`,
}));

export default function GamePage() {
  const { phase, setPhase, currentScene, setCurrentScene, setCurrentEnvironment, fearLevel, voiceEnabled, toggleVoice } =
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

  return (
    <main className="w-screen h-screen bg-black overflow-hidden relative">
      {/* 3D scene with fear-based desaturation */}
      <div
        className="absolute inset-0"
        style={{ filter: `saturate(${saturation})` }}
      >
        <GameScene cameraPosition={[0, 3, 10]} />
      </div>

      {/* Scene fade-to-black transition */}
      <div
        className={`absolute inset-0 bg-black z-20 pointer-events-none transition-opacity duration-500 ${isTransitioning ? 'opacity-100' : 'opacity-0'}`}
      />

      <GameHUD />

      {phase === 'intro' && (
        <div className="absolute inset-0 z-40 overflow-hidden flex flex-col items-center justify-center">
          {/* Dark atmospheric radial background */}
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at 50% 35%, #0d0005 0%, #000 70%)' }}
          />

          {/* Snow particles */}
          {SNOW_PARTICLES.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full bg-white/30 animate-snow"
              style={{
                width: p.width,
                height: p.height,
                left: p.left,
                top: '-10px',
                animationDuration: p.animationDuration,
                animationDelay: p.animationDelay,
              }}
            />
          ))}

          {/* FROST title */}
          <h1
            className="relative z-10 font-black tracking-[0.2em] uppercase text-white select-none leading-none"
            style={{
              fontSize: 'clamp(5rem, 15vw, 11rem)',
              fontFamily: 'Georgia, serif',
              textShadow: '0 0 60px rgba(255,255,255,0.08)',
            }}
          >
            FROST
          </h1>

          <p className="relative z-10 text-gray-600 text-xs tracking-[0.6em] uppercase mt-4 mb-10">
            A survival horror story
          </p>

          <div className="w-px h-8 bg-gray-800 mb-8" />

          {/* Begin button */}
          <button
            onClick={handleStart}
            className="relative z-10 w-56 px-8 py-4 border border-white/20 text-white text-xs tracking-[0.35em] uppercase hover:bg-white/5 hover:border-white/40 transition-all duration-300 mb-3"
          >
            Begin Story
          </button>

          {/* Voice toggle */}
          <button
            onClick={toggleVoice}
            className="relative z-10 w-56 px-8 py-3 text-xs tracking-[0.3em] uppercase transition-all duration-300 mb-3"
            style={{
              border: voiceEnabled ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(75,85,99,0.3)',
              color: voiceEnabled ? 'rgba(252,165,165,0.8)' : 'rgba(107,114,128,0.6)',
            }}
          >
            Voice: {voiceEnabled ? 'On' : 'Off'}
          </button>

          {/* Dev skip */}
          <button
            onClick={handleSkipToCh2}
            className="relative z-10 w-56 px-8 py-2 text-[10px] tracking-[0.2em] uppercase text-gray-700 border border-dashed border-gray-800 hover:border-gray-600 hover:text-gray-600 transition-all duration-300"
          >
            Skip to Chapter 2 (dev)
          </button>
        </div>
      )}

      <NarrativeDisplay />
      <SceneTitleCard />
      <ChoiceSystem />
      <DontMoveQTE />
      <JumpScare />
      <ButterflyNotification />
      <StatusUpdateToast />
      <FearEffects />
      <LightningFlashEffect />
      <CharacterDeathEffects />
    </main>
  );
}
