'use client';

import { Choice, useGameStore } from '@/lib/store';
import { getScene } from '@/data/story';

interface ChoiceButtonProps {
  choice: Choice;
  onSelect: (choice: Choice) => void;
}

function ChoiceButton({ choice, onSelect }: ChoiceButtonProps) {
  return (
    <button
      onClick={() => onSelect(choice)}
      className="w-full p-4 text-left bg-black/60 border border-red-900/50 hover:bg-red-900/40 hover:border-red-600 transition-all duration-300 rounded text-gray-100 font-medium"
    >
      {choice.text}
    </button>
  );
}

export default function ChoiceSystem() {
  const { phase, currentScene, makeChoice, setCurrentScene, setPhase } = useGameStore();
  const scene = getScene(currentScene);

  // Only render during 'choice' phase - narrative display handles inline choices during 'scene' phase
  if (phase !== 'choice') return null;
  if (!scene.choices || scene.choices.length === 0) return null;

  const handleSelect = (choice: Choice) => {
    makeChoice(choice.id);
    if (choice.consequence) {
      console.log('Consequence:', choice.consequence);
    }
    setCurrentScene(choice.nextScene);
    setPhase('scene');
  };

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 space-y-3">
      {scene.choices.map((choice) => (
        <ChoiceButton key={choice.id} choice={choice} onSelect={handleSelect} />
      ))}
    </div>
  );
}
