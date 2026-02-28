'use client';

import { useState, useEffect, useCallback } from 'react';
import { useGameStore, Choice } from '@/lib/store';
import { getScene } from '@/data/story';
import CharacterPortrait from './CharacterPortrait';
import ConsequencePopup from './ConsequencePopup';

export default function NarrativeDisplay() {
  const { phase, currentScene, setPhase, makeChoice, setCurrentScene, addConsequence, setCurrentEnvironment } = useGameStore();
  const scene = getScene(currentScene);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  
  useEffect(() => {
    setDisplayText('');
    setShowChoices(false);
    setIsTyping(true);
    
    if (scene.narratorText) {
      let index = 0;
      const interval = setInterval(() => {
        if (index < scene.narratorText!.length) {
          setDisplayText(scene.narratorText!.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
          setTimeout(() => setShowChoices(true), 500);
        }
      }, 30);
      
      return () => clearInterval(interval);
    } else {
      setIsTyping(false);
      setShowChoices(true);
    }
  }, [currentScene, scene.narratorText]);

  const handleSkip = useCallback(() => {
    if (isTyping && scene.narratorText) {
      setDisplayText(scene.narratorText);
      setIsTyping(false);
      setTimeout(() => setShowChoices(true), 200);
    }
  }, [isTyping, scene.narratorText]);
  
  const handleChoiceSelect = (choice: Choice) => {
    makeChoice(choice.id);
    if (choice.consequence) {
      addConsequence(choice.consequence);
    }
    setCurrentScene(choice.nextScene);
    setCurrentEnvironment(choice.nextScene === 'prologue_start' ? 'lodge' : scene.environment || 'cabin');
    setPhase('scene');
  };
  
  const speakerId = scene.speaker || 'narrator';
  
  if (phase !== 'scene' && phase !== 'choice') return null;
  if (!scene.narratorText) return null;
  
  return (
    <>
      <ConsequencePopup />
      <div
        className="absolute inset-0 flex flex-col justify-end z-30"
        onClick={isTyping ? handleSkip : undefined}
        style={{ cursor: isTyping ? 'pointer' : 'default' }}
      >
        <div className="bg-gradient-to-t from-black via-black/80 to-transparent p-8">
          <div className="max-w-4xl mx-auto">
            {speakerId !== 'narrator' && (
              <div className="mb-3">
                <CharacterPortrait speakerId={speakerId} />
              </div>
            )}
            
            {scene.title && (
              <h2 className="text-red-600 text-xl font-bold mb-2 tracking-wider uppercase">
                {scene.title}
              </h2>
            )}
          
            <p className="text-gray-200 text-lg leading-relaxed font-serif">
              {displayText}
              {isTyping && <span className="animate-pulse">|</span>}
            </p>
          
            {showChoices && scene.choices && scene.choices.length > 0 && (
              <div className="mt-4 space-y-3">
                {scene.choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChoiceSelect(choice);
                    }}
                    className="block w-full max-w-xl p-4 text-left bg-black/60 border border-red-900/50 hover:bg-red-900/40 hover:border-red-600 transition-all duration-300 rounded text-gray-100 font-medium"
                  >
                    {choice.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
