'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore, Choice } from '@/lib/store';
import { getScene } from '@/data/story';
import { useMistralAI } from '@/lib/mistral';
import { useElevenLabs } from '@/hooks/useVoice';
import CharacterPortrait from './CharacterPortrait';
import ConsequencePopup from './ConsequencePopup';
import { getCharacter } from '@/data/characters';

const AI_SCENES = new Set([
  'chapter3_start', 'ch3_spirit_scene', 'ch3_lodge_search', 'chapter3_fight', 'chapter3_lodge',
  'chapter4_start', 'ch4_stranger_tells',
  'chapter5_start', 'ending_sacrifice', 'ending_survival',
]);

// Placeholder voice IDs per character — replace with real ElevenLabs voice IDs
const CHARACTER_VOICE_IDS: Record<string, string> = {
  sam:     '', // TODO: add Sam's ElevenLabs voice ID
  mike:    '', // TODO: add Mike's ElevenLabs voice ID
  jessica: '', // TODO: add Jessica's ElevenLabs voice ID
  ashley:  '', // TODO: add Ashley's ElevenLabs voice ID
  chris:   '', // TODO: add Chris's ElevenLabs voice ID
  josh:    '', // TODO: add Josh's ElevenLabs voice ID
  emily:   '', // TODO: add Emily's ElevenLabs voice ID
  matt:    '', // TODO: add Matt's ElevenLabs voice ID
  hannah:  '', // TODO: add Hannah's ElevenLabs voice ID
  beth:    '', // TODO: add Beth's ElevenLabs voice ID
};

export default function NarrativeDisplay() {
  const {
    phase, currentScene, setPhase, makeChoice, setCurrentScene,
    addConsequence, setCurrentEnvironment,
    fearLevel, incrementFear,
    wendigoActive, activateWendigo, triggerJumpScare,
    voiceEnabled,
    playerChoices, characterStates, characterTraits, relationships, butterflyEffects,
    activeCharacter, applyAIChanges,
    setCurrentSpeaker, setCurrentCameraShot,
    setCharacterAnimation,
  } = useGameStore();

  const scene = getScene(currentScene);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiChoices, setAiChoices] = useState<Choice[]>([]);
  const [lineVisible, setLineVisible] = useState(true);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingTextRef = useRef('');

  const { generateStory } = useMistralAI();
  const { speak, stop } = useElevenLabs();

  // Fade-in on each new line
  useEffect(() => {
    setLineVisible(false);
    const t = setTimeout(() => setLineVisible(true), 50);
    return () => clearTimeout(t);
  }, [currentLineIndex]);

  const startTypewriter = useCallback((text: string, lineIndex: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    pendingTextRef.current = text;

    if (!text) {
      setIsTyping(false);
      const totalLines = scene.dialogue.length;
      if (lineIndex + 1 >= totalLines) {
        if (scene.choices && scene.choices.length > 0) {
          setShowChoices(true);
        } else if (scene.interactables && scene.interactables.length > 0) {
          setPhase('exploration');
        } else if (aiChoices.length > 0) {
          setShowChoices(true);
        }
      } else if (lineIndex + 1 < totalLines) {
        setTimeout(() => {
          setCurrentLineIndex(lineIndex + 1);
        }, 500);
      }
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
        const totalLines = scene.dialogue.length;
        if (lineIndex + 1 >= totalLines) {
          if (scene.choices && scene.choices.length > 0) {
            setShowChoices(true);
          } else if (scene.interactables && scene.interactables.length > 0) {
            setPhase('exploration');
          } else if (aiChoices.length > 0) {
            setShowChoices(true);
          }
        } else if (lineIndex + 1 < totalLines) {
          setTimeout(() => {
            setCurrentLineIndex(lineIndex + 1);
          }, 500);
        }
      }
    }, 30);
  }, [scene, setPhase, aiChoices.length]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Update speaker and camera when dialogue line changes
  useEffect(() => {
    const currentLine = scene.dialogue[currentLineIndex];
    if (currentLine) {
      setCurrentSpeaker(currentLine.speaker);
      if (currentLine.camera) {
        setCurrentCameraShot(currentLine.camera);
      }
    }
  }, [currentLineIndex, setCurrentSpeaker, setCurrentCameraShot]);

  // Advance typewriter when currentLineIndex increments (for lines > 0)
  useEffect(() => {
    if (currentLineIndex === 0) return;
    const dialogueLine = scene.dialogue[currentLineIndex];
    if (!dialogueLine) return;
    if (dialogueLine.fearDelta) incrementFear(dialogueLine.fearDelta);
    if (dialogueLine.speaker !== 'narrator') {
      setCharacterAnimation(dialogueLine.speaker, dialogueLine.animation || 'talking');
    }
    startTypewriter(dialogueLine.text || '', currentLineIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLineIndex]);

  // Handle AI-driven scenes with full context
  useEffect(() => {
    stop();
    setCurrentLineIndex(0);
    setDisplayText('');
    setShowChoices(false);
    setIsTyping(false);
    setAiChoices([]);
    setIsGeneratingAI(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (scene.environment) setCurrentEnvironment(scene.environment);

    const dialogueLine = scene.dialogue[0];
    if (!dialogueLine) {
      if (scene.choices && scene.choices.length > 0) {
        setShowChoices(true);
      }
      return;
    }

    if (scene.aiDriven) {
      setIsGeneratingAI(true);
      generateStory({
        currentScene,
        playerChoices,
        characterStates,
        fearLevel,
        relationships,
        characterTraits,
        butterflyEffects,
        activeCharacter,
      })
        .then((result) => {
          setIsGeneratingAI(false);
          if (result) {
            applyAIChanges({
              characterDeath: result.characterDeath,
              butterflyEffect: result.butterflyEffect,
              relationshipChanges: result.relationshipChanges,
            });

            if (result.narratorText) {
              startTypewriter(result.narratorText, 0);
            } else if (dialogueLine.text) {
              startTypewriter(dialogueLine.text, 0);
            }

            if (result.choices && result.choices.length > 0) {
              setAiChoices(result.choices.map(c => ({
                id: c.id,
                text: c.text,
                nextScene: c.nextScene,
                fearDelta: c.fearDelta,
                consequence: c.consequence,
                triggerQTE: c.triggerQTE,
              })));
            } else if (scene.choices) {
              setAiChoices(scene.choices);
            }

            if (result.characterDeath) {
              triggerJumpScare();
            }
          } else {
            startTypewriter(dialogueLine.text || '', 0);
          }
        })
        .catch(() => {
          setIsGeneratingAI(false);
          startTypewriter(dialogueLine.text || '', 0);
        });
    } else if (dialogueLine.speaker === 'narrator' && AI_SCENES.has(currentScene)) {
      setIsGeneratingAI(true);
      generateStory({ currentScene, playerChoices, characterStates, fearLevel })
        .then((result) => {
          setIsGeneratingAI(false);
          startTypewriter(result?.narratorText || dialogueLine.text || '', 0);
        })
        .catch(() => {
          setIsGeneratingAI(false);
          startTypewriter(dialogueLine.text || '', 0);
        });
    } else {
      if (dialogueLine.fearDelta) incrementFear(dialogueLine.fearDelta);
      if (dialogueLine.speaker !== 'narrator') {
        setCharacterAnimation(dialogueLine.speaker, dialogueLine.animation || 'talking');
      }
      startTypewriter(dialogueLine.text || '', 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScene, scene.aiDriven]);

  // Voice narration fires when a line finishes typing
  useEffect(() => {
    if (!isTyping && displayText && voiceEnabled && !showChoices) {
      const dialogueLine = scene.dialogue[currentLineIndex];
      if (dialogueLine && dialogueLine.speaker !== 'narrator') {
        const characterVoiceId = CHARACTER_VOICE_IDS[dialogueLine.speaker] || undefined;
        speak(displayText, characterVoiceId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTyping, displayText, voiceEnabled, showChoices, currentLineIndex]);

  const handleSkip = useCallback(() => {
    if (isTyping && pendingTextRef.current) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setDisplayText(pendingTextRef.current);
      setIsTyping(false);
      const totalLines = scene.dialogue.length;
      if (currentLineIndex + 1 >= totalLines && scene.choices && scene.choices.length > 0) {
        setShowChoices(true);
      } else if (currentLineIndex + 1 < totalLines) {
        setTimeout(() => setCurrentLineIndex(currentLineIndex + 1), 200);
      }
    }
  }, [isTyping, scene, currentLineIndex]);

  const handleChoiceSelect = (choice: Choice) => {
    makeChoice(choice.id);
    if (choice.consequence) addConsequence(choice.consequence);

    const targetScene = getScene(choice.nextScene);
    setCurrentEnvironment(targetScene?.environment || scene.environment || 'lodge');

    if (choice.fearDelta) {
      const newFear = Math.min(100, fearLevel + choice.fearDelta);
      incrementFear(choice.fearDelta);
      if (newFear >= 80 && !wendigoActive) {
        activateWendigo();
        triggerJumpScare();
      }
    }

    if (choice.triggerQTE) {
      useGameStore.getState().triggerQTE(
        () => {
          setCurrentScene(choice.nextScene);
          setPhase('scene');
        },
        () => {
          incrementFear(30);
          setCurrentScene(choice.nextScene);
          setPhase('scene');
        }
      );
      setPhase('exploration');
    } else {
      setCurrentScene(choice.nextScene);
      setPhase('scene');
    }
  };

  const currentDialogueLine = scene.dialogue[currentLineIndex] || null;
  const choicesToShow = aiChoices.length > 0 ? aiChoices : (scene.choices || []);
  const isNarrator = currentDialogueLine?.speaker === 'narrator';

  if (phase !== 'scene' && phase !== 'choice') return null;
  if (!currentDialogueLine && !isGeneratingAI) return null;

  return (
    <>
      <ConsequencePopup />

      {/* Cinematic letterbox container */}
      <div className="fixed inset-0 z-30 pointer-events-none">
        {/* Top letterbox bar */}
        <div className="fixed top-0 left-0 right-0 h-[12vh] bg-black" />

        {/* Bottom letterbox bar — dialogue lives here */}
        <div
          className="fixed bottom-0 left-0 right-0 h-[28vh] bg-black pointer-events-auto flex flex-col"
          onClick={isTyping ? handleSkip : (!showChoices && currentLineIndex + 1 < scene.dialogue.length ? () => setCurrentLineIndex(currentLineIndex + 1) : undefined)}
          style={{ cursor: (isTyping || (!showChoices && currentLineIndex + 1 < scene.dialogue.length)) ? 'pointer' : 'default' }}
        >
          {/* Zone 1: text content */}
          <div className={`flex flex-1 min-h-0 transition-opacity duration-300 ${lineVisible ? 'opacity-100' : 'opacity-0'}`}>
            {isNarrator ? (
              /* Narrator: centered italic text */
              <div className="flex items-center justify-center w-full px-8">
                {isGeneratingAI ? (
                  <p className="text-gray-500 text-lg italic font-serif animate-pulse text-center">
                    The story unfolds...
                  </p>
                ) : (
                  <p className="text-gray-400/90 text-lg italic font-serif text-center max-w-3xl leading-relaxed">
                    {displayText}
                    {isTyping && <span className="animate-pulse">|</span>}
                  </p>
                )}
              </div>
            ) : (
              /* Character dialogue: portrait + text column */
              <div className="flex flex-row items-start gap-4 px-6 py-4 w-full">
                {currentDialogueLine && (
                  <CharacterPortrait speakerId={currentDialogueLine.speaker} mood={currentDialogueLine.mood} />
                )}
                <div className="flex flex-col justify-center flex-1">
                  {currentDialogueLine && (
                    <span
                      className="text-[10px] uppercase tracking-[0.3em] font-bold mb-1"
                      style={{ color: getCharacter(currentDialogueLine.speaker).color }}
                    >
                      {getCharacter(currentDialogueLine.speaker).name}
                    </span>
                  )}
                  {isGeneratingAI ? (
                    <p className="text-gray-500 text-xl italic font-serif animate-pulse">
                      The story unfolds...
                    </p>
                  ) : (
                    <p
                      className="text-white/95 text-xl font-serif leading-relaxed"
                      style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
                    >
                      {displayText}
                      {isTyping && <span className="animate-pulse">|</span>}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Zone 2: choices — renders for BOTH narrator and character lines */}
          {showChoices && choicesToShow.length > 0 && (
            <div className="px-6 pb-4 space-y-2" onClick={(e) => e.stopPropagation()}>
              {choicesToShow.map((choice) => {
                const isHighRisk = fearLevel > 50 && (choice.fearDelta ?? 0) >= 20;
                return (
                  <button
                    key={choice.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChoiceSelect(choice);
                    }}
                    className={`block w-full max-w-xl px-4 py-2.5 text-left transition-all duration-200 font-mono text-xs uppercase tracking-wider ${
                      isHighRisk
                        ? 'border border-red-600/60 text-red-300 hover:bg-red-900/20 hover:border-red-500/80'
                        : 'border border-white/15 text-gray-200 hover:bg-white/[0.06] hover:border-white/35'
                    }`}
                  >
                    {isHighRisk && (
                      <span className="text-red-400 text-[10px] mr-2 animate-pulse">[HIGH RISK]</span>
                    )}
                    {choice.text}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
