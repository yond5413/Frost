'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useGameStore } from '@/lib/store';
import NarrativeDisplay from '@/components/ui/NarrativeDisplay';
import ChoiceSystem from '@/components/ui/ChoiceSystem';
import GameHUD from '@/components/ui/GameHUD';
import JumpScare from '@/components/ui/JumpScare';
import DontMoveQTE from '@/components/ui/DontMoveQTE';
import ButterflyNotification from '@/components/ui/ButterflyNotification';
import ButterflyEffectTracker from '@/components/ui/ButterflyEffectTracker';
import StatusUpdateToast from '@/components/ui/StatusUpdateToast';
import FearEffects from '@/components/ui/FearEffects';
import SceneTitleCard from '@/components/ui/SceneTitleCard';
import { LightningFlashEffect } from '@/components/three/LightningFlash';
import CharacterDeathEffects from '@/components/ui/CharacterDeathEffects';
 import DeathRecap from '@/components/ui/DeathRecap';
 import SurvivalScreen from '@/components/ui/SurvivalScreen';
import PauseMenu from '@/components/ui/PauseMenu';
import DirectorStateOverlay from '@/components/ui/DirectorStateOverlay';
import { useMusicSync } from '@/lib/musicManager';
import { NarratorPersonality } from '@/lib/store';

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

const PERSONALITY_OPTIONS: Array<{
  id: NarratorPersonality;
  glyph: string;
  label: string;
  desc: string;
}> = [
  { id: 'balanced', glyph: '⚖', label: 'Balanced', desc: 'Every consequence earns its weight.' },
  { id: 'brutal',   glyph: '☠', label: 'Brutal',   desc: 'Survival is earned, not given.' },
  { id: 'merciful', glyph: '🛡', label: 'Merciful', desc: 'Death is always a last resort.' },
  { id: 'chaotic',  glyph: '⚡', label: 'Chaotic',  desc: 'Ignores patterns. Surprises always.' },
];

export default function GamePage() {
  const { phase, setPhase, currentScene, setCurrentScene, setCurrentEnvironment, fearLevel, jumpScareActive, narratorPersonality, setNarratorPersonality, isPaused, togglePause, resetGame, setDemoSeedMode } =
    useGameStore();

  useMusicSync(fearLevel, jumpScareActive);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevPhaseRef = useRef(phase);

   // Escape key toggles pause (only during active gameplay)
   useEffect(() => {
     const handler = (e: KeyboardEvent) => {
       if (e.key === 'Escape' && phase !== 'intro' && phase !== 'ending') togglePause();
     };
     window.addEventListener('keydown', handler);
     return () => window.removeEventListener('keydown', handler);
   }, [phase, togglePause]);

  // Fade-to-black on scene change
  useEffect(() => {
    const prevPhase = prevPhaseRef.current;
    if ((phase === 'scene' || phase === 'choice') && prevPhase !== phase) {
      const timer1 = setTimeout(() => setIsTransitioning(true), 0);
      const timer2 = setTimeout(() => setIsTransitioning(false), 500);
      prevPhaseRef.current = phase;
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
    prevPhaseRef.current = phase;
  }, [phase, currentScene]);

  const handleStart = () => {
    const personality = narratorPersonality;
    resetGame();
    setNarratorPersonality(personality);
    setDemoSeedMode(false);
    setPhase('scene');
    setCurrentEnvironment('lodge');
    setCurrentScene('prologue_start');
  };

  const handleSkipToCh2 = () => {
    setDemoSeedMode(false);
    setPhase('scene');
    setCurrentEnvironment('cabin');
    setCurrentScene('chapter2_start');
  };

  const handleDemoSeedRun = () => {
    const personality = narratorPersonality;
    resetGame();
    setNarratorPersonality(personality);
    setDemoSeedMode(false);
    setDemoSeedMode(true);
    setPhase('scene');
    setCurrentEnvironment('lodge');
    setCurrentScene('prologue_start');
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
      <DirectorStateOverlay />

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



          {/* Narrator personality selector */}
          <div className="relative z-10 flex gap-2 mb-6">
            {PERSONALITY_OPTIONS.map((opt) => {
              const isSelected = narratorPersonality === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setNarratorPersonality(opt.id)}
                  className="flex flex-col items-center px-3 py-2.5 w-28 transition-all duration-200"
                  style={{
                    border: isSelected ? '1px solid rgba(255,255,255,0.35)' : '1px solid rgba(75,85,99,0.25)',
                    background: isSelected ? 'rgba(255,255,255,0.04)' : 'transparent',
                  }}
                >
                  <span className="text-lg mb-1">{opt.glyph}</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gray-300 mb-1">{opt.label}</span>
                  <span className="text-[9px] text-gray-600 italic text-center leading-tight">{opt.desc}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleDemoSeedRun}
            className="relative z-10 w-56 px-8 py-3 text-[10px] tracking-[0.25em] uppercase text-cyan-300 border border-cyan-800/50 hover:border-cyan-500/70 hover:bg-cyan-900/10 transition-all duration-300 mb-3"
          >
            Demo Seed Run
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
      <ButterflyEffectTracker />
      <StatusUpdateToast />
      <FearEffects />
      <LightningFlashEffect />
       <CharacterDeathEffects />
       <DeathRecap />
       <SurvivalScreen />
      {isPaused && <PauseMenu />}
    </main>
  );
}
