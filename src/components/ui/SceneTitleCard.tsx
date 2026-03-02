'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/store';
import { getScene } from '@/data/story';

type CardState = 'hidden' | 'fadein' | 'hold' | 'fadeout';

function parseChapterLabel(sceneId: string): string {
  const match = sceneId.match(/^(prologue|ch(\d+)|chapter(\d+))/i);
  if (!match) return '';
  if (match[1].toLowerCase() === 'prologue') return 'Prologue';
  const num = match[2] || match[3];
  return `Chapter ${num}`;
}

export default function SceneTitleCard() {
  const { currentScene, phase } = useGameStore();
  const scene = getScene(currentScene);
  const [cardState, setCardState] = useState<CardState>('hidden');
  const [displayedTitle, setDisplayedTitle] = useState('');
  const [displayedLabel, setDisplayedLabel] = useState('');

  useEffect(() => {
    if (!scene?.title || phase !== 'scene') return;

    const t0 = setTimeout(() => {
      setDisplayedTitle(scene.title);
      setDisplayedLabel(parseChapterLabel(currentScene));
      setCardState('fadein');
    }, 0);

    const t1 = setTimeout(() => setCardState('hold'), 700);
    const t2 = setTimeout(() => setCardState('fadeout'), 2700);
    const t3 = setTimeout(() => setCardState('hidden'), 4000);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [currentScene, scene?.title, phase]);

  if (cardState === 'hidden') return null;

  const opacity = cardState === 'fadein' || cardState === 'hold' ? 'opacity-100' : 'opacity-0';

  return (
    <div
      className={`fixed inset-0 z-[45] bg-black flex flex-col items-center justify-center pointer-events-none transition-opacity duration-700 ${opacity}`}
    >
      {displayedLabel && (
        <p className="text-[10px] tracking-[0.6em] uppercase text-gray-600 mb-4">
          {displayedLabel}
        </p>
      )}
      <h2
        className="text-5xl font-black text-white tracking-[0.08em] uppercase"
        style={{ textShadow: '0 2px 20px rgba(255,255,255,0.1)' }}
      >
        {displayedTitle}
      </h2>
      <div className="w-20 h-px bg-gray-800 mt-5" />
    </div>
  );
}
