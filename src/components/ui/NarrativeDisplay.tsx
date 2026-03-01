'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore, Choice } from '@/lib/store';
import { getScene } from '@/data/story';
import { useMistralAI } from '@/lib/mistral';
import { useElevenLabs } from '@/hooks/useVoice';
import CharacterPortrait from './CharacterPortrait';
import ConsequencePopup from './ConsequencePopup';

const AI_SCENES = new Set([
  'chapter3_start', 'ch3_spirit_scene', 'ch3_lodge_search', 'chapter3_fight', 'chapter3_lodge',
  'chapter4_start', 'ch4_stranger_tells',
  'chapter5_start', 'ending_sacrifice', 'ending_survival',
]);

export default function NarrativeDisplay() {
  const {
    phase, currentScene, setPhase, makeChoice, setCurrentScene,
    addConsequence, setCurrentEnvironment,
    fearLevel, incrementFear,
    wendigoActive, activateWendigo, triggerJumpScare,
    voiceEnabled,
    playerChoices, characterStates,
  } = useGameStore();

  const scene = getScene(currentScene);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingTextRef = useRef('');

  const { generateStory } = useMistralAI();
  const { speak } = useElevenLabs();

  const startTypewriter = useCallback((text: string) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    pendingTextRef.current = text;

    if (!text) {
      setIsTyping(false);
      setShowChoices(true);
      return;
    }

    setDisplayText('');
    setIsTyping(true);
    setShowChoices(false);
    let index = 0;

    intervalRef.current = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsTyping(false);
        setTimeout(() => setShowChoices(true), 500);
      }
    }, 30);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    setDisplayText('');
    setShowChoices(false);
    setIsTyping(false);
    setIsGeneratingAI(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (AI_SCENES.has(currentScene)) {
      setIsGeneratingAI(true);
      generateStory({ currentScene, playerChoices, characterStates, fearLevel })
        .then((result) => {
          setIsGeneratingAI(false);
          startTypewriter(result?.narratorText || scene.narratorText || '');
        })
        .catch(() => {
          setIsGeneratingAI(false);
          startTypewriter(scene.narratorText || '');
        });
    } else {
      startTypewriter(scene.narratorText || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScene]);

  // Voice narration fires when typewriter finishes and choices appear
  useEffect(() => {
    if (showChoices && voiceEnabled && displayText) {
      speak(displayText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showChoices, voiceEnabled]);

  const handleSkip = useCallback(() => {
    if (isTyping && pendingTextRef.current) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setDisplayText(pendingTextRef.current);
      setIsTyping(false);
      setTimeout(() => setShowChoices(true), 200);
    }
  }, [isTyping]);

  const handleChoiceSelect = (choice: Choice) => {
    makeChoice(choice.id);
    if (choice.consequence) addConsequence(choice.consequence);

    // Fix: use TARGET scene's environment, not current scene's
    const targetScene = getScene(choice.nextScene);
    setCurrentEnvironment(targetScene?.environment || scene.environment || 'lodge');

    // Increment fear
    if (choice.fearDelta) {
      const newFear = Math.min(100, fearLevel + choice.fearDelta);
      incrementFear(choice.fearDelta);

      // Activate wendigo at fear threshold
      if (newFear >= 80 && !wendigoActive) {
        activateWendigo();
        triggerJumpScare();
      }
    }

    // Check for QTE
    if (choice.triggerQTE) {
      useGameStore.getState().triggerQTE(
        () => {
          // Success Callback
          setCurrentScene(choice.nextScene);
          setPhase('scene');
        },
        () => {
          // Fail Callback (Death handling could be added later, for now we just jump to a bad scene or spike fear)
          incrementFear(30);
          setCurrentScene(choice.nextScene); // Still progress them for now
          setPhase('scene');
        }
      );
      setPhase('exploration'); // Temporarily hide narrative to show QTE overlay cleanly
    } else {
      setCurrentScene(choice.nextScene);
      setPhase('scene');
    }
  };

  const speakerId = scene.speaker || 'narrator';

  if (phase !== 'scene' && phase !== 'choice') return null;
  if (!scene.narratorText && !isGeneratingAI) return null;

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

            {isGeneratingAI ? (
              <p className="text-gray-500 text-lg leading-relaxed font-serif animate-pulse">
                Generating story...
              </p>
            ) : (
              <p className="text-gray-200 text-lg leading-relaxed font-serif">
                {displayText}
                {isTyping && <span className="animate-pulse">|</span>}
              </p>
            )}

            {showChoices && scene.choices && scene.choices.length > 0 && (
              <div className="mt-4 space-y-3">
                {scene.choices.map((choice) => {
                  const isHighRisk = fearLevel > 50 && (choice.fearDelta ?? 0) >= 20;
                  return (
                    <button
                      key={choice.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChoiceSelect(choice);
                      }}
                      className={`block w-full max-w-xl p-4 text-left transition-all duration-300 rounded font-medium ${isHighRisk
                          ? 'bg-red-950/80 border border-red-500 hover:bg-red-800/80 hover:border-red-400 text-red-200'
                          : 'bg-black/60 border border-red-900/50 hover:bg-red-900/40 hover:border-red-600 text-gray-100'
                        }`}
                    >
                      {isHighRisk && (
                        <span className="text-red-400 text-xs font-mono mr-2 animate-pulse">[HIGH RISK]</span>
                      )}
                      {choice.text}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
