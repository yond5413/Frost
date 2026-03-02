'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore, Choice } from '@/lib/store';
import { getScene } from '@/data/story';
import { useMistralAI } from '@/lib/mistral';
import { logRuntimeInfo, logRuntimeWarn, logRuntimeError } from '@/lib/runtimeLogger';

import CharacterPortrait from './CharacterPortrait';
import ConsequencePopup from './ConsequencePopup';
import { getCharacter } from '@/data/characters';

const LOADING_LINES = [
  'The mountain holds its breath...',
  'Something shifts in the dark...',
  'The cold deepens around you...',
  'A presence stirs nearby...',
  'The silence is deafening...',
];

export default function NarrativeDisplay() {
  const {
    phase, currentScene, setPhase, makeChoice, setCurrentScene,
    addConsequence, setCurrentEnvironment,
    fearLevel, incrementFear, setFearLevel,
    wendigoActive, activateWendigo, triggerJumpScare,
    playerChoices, characterStates, characterTraits, relationships, butterflyEffects,
    activeCharacter, applyAIChanges,
    setCurrentSpeaker, setCurrentCameraShot,
    setCharacterAnimation,
    conversationHistory, addToConversationHistory, addStoryMemory, setAiServiceStatus, aiServiceStatus,
    recordRuntimeDecision, recordAiFallback,
    storyMemory,
    narratorPersonality, behavioralProfile, updateBehavioralProfile,
  } = useGameStore();

  const scene = getScene(currentScene);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiChoices, setAiChoices] = useState<Choice[]>([]);
  const [aiDialogueLines, setAiDialogueLines] = useState<typeof scene.dialogue>([]);
  const [lineVisible, setLineVisible] = useState(true);
  const [loadingLine] = useState(() => LOADING_LINES[Math.floor(Math.random() * LOADING_LINES.length)]);
  const aiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingTextRef = useRef('');
  const totalLinesRef = useRef(0);
  // Director mode: the route the LLM chose for auto-navigation
  const aiChosenRouteRef = useRef<string | null>(null);
  // Always-current refs to avoid stale closures in startTypewriter/handleSkip
  const sceneRef = useRef(scene);
  const aiChoicesRef = useRef(aiChoices);

  sceneRef.current = scene;
  aiChoicesRef.current = aiChoices;

  const { generateStory } = useMistralAI();

  // Keep totalLinesRef in sync
  useEffect(() => {
    totalLinesRef.current = aiDialogueLines.length > 0 ? aiDialogueLines.length : scene.dialogue.length;
  }, [aiDialogueLines, scene.dialogue]);

  // Fade-in on each new line
  useEffect(() => {
    setLineVisible(false);
    const t = setTimeout(() => setLineVisible(true), 50);
    return () => clearTimeout(t);
  }, [currentLineIndex]);

  const navigateToChosenRoute = useCallback(() => {
    const route = aiChosenRouteRef.current;
    if (!route) return;
    aiChosenRouteRef.current = null;
    const targetScene = getScene(route);
    setCurrentEnvironment(targetScene?.environment || scene.environment || 'lodge');
    setTimeout(() => {
      setCurrentScene(route);
      setPhase('scene');
    }, 1200);
  }, [scene.environment, setCurrentEnvironment, setCurrentScene, setPhase]);

  const startTypewriter = useCallback((text: string, lineIndex: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    pendingTextRef.current = text;

    const checkEnd = (idx: number) => {
      const totalLines = totalLinesRef.current;
      if (idx + 1 >= totalLines) {
        if (sceneRef.current?.isEnding) {
          setPhase('ending');
          return;
        }
        if (aiChosenRouteRef.current) {
          navigateToChosenRoute();
        } else if (aiChoicesRef.current.length > 0 || (sceneRef.current.choices && sceneRef.current.choices.length > 0)) {
          setShowChoices(true);
        } else if (sceneRef.current.interactables && sceneRef.current.interactables.length > 0) {
          setPhase('exploration');
        } else {
          // Dead-end fallback: advance to first available next scene
          const fallback = sceneRef.current.choices?.[0]?.nextScene;
          if (fallback) { setCurrentScene(fallback); setPhase('scene'); }
        }
      } else {
        if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
        advanceTimerRef.current = setTimeout(() => {
          advanceTimerRef.current = null;
          setCurrentLineIndex(idx + 1);
        }, 500);
      }
    };

    if (!text) {
      setIsTyping(false);
      checkEnd(lineIndex);
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
        checkEnd(lineIndex);
      }
    }, 45); // Increased from 30ms to 45ms to better match speech pacing
   }, [setPhase, setCurrentScene, navigateToChosenRoute]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
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
  }, [currentLineIndex, scene.dialogue, setCurrentSpeaker, setCurrentCameraShot]);

  // Advance typewriter when currentLineIndex increments (for lines > 0)
  useEffect(() => {
    if (currentLineIndex === 0) return;
    const activeDlg = aiDialogueLines.length > 0 ? aiDialogueLines : scene.dialogue;
    const dialogueLine = activeDlg[currentLineIndex];
    if (!dialogueLine) return;
    if ('fearDelta' in dialogueLine && dialogueLine.fearDelta) incrementFear(dialogueLine.fearDelta);
    if (dialogueLine.speaker !== 'narrator') {
      setCharacterAnimation(dialogueLine.speaker, ('animation' in dialogueLine && dialogueLine.animation) || 'talking');
    }
    startTypewriter(dialogueLine.text || '', currentLineIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLineIndex]);

  // Handle AI-driven scenes with full context
  useEffect(() => {
    if (advanceTimerRef.current) { clearTimeout(advanceTimerRef.current); advanceTimerRef.current = null; }
    setCurrentLineIndex(0);
    setDisplayText('');
    setShowChoices(false);
    setIsTyping(false);
    setAiChoices([]);
    setAiDialogueLines([]);
    setIsGeneratingAI(false);
    aiChosenRouteRef.current = null;
    if (intervalRef.current) clearInterval(intervalRef.current);
    // Synchronously reset totalLinesRef to the new scene's dialogue count before startTypewriter fires
    totalLinesRef.current = scene.dialogue.length;

    if (scene.fearReset) setFearLevel(0);
    if (scene.environment) setCurrentEnvironment(scene.environment);

    logRuntimeInfo('scene_enter', {
      sceneId: currentScene,
      phase,
      source: 'NarrativeDisplay',
      mode: scene.aiDriven ? 'ai' : 'deterministic',
      details: {
        hasChoices: Boolean(scene.choices?.length),
        hasInteractables: Boolean(scene.interactables?.length),
      },
    });

    recordRuntimeDecision(scene.aiDriven ? 'ai' : 'deterministic', scene.aiDriven ? 'scene_enter_ai' : 'scene_enter_deterministic');

    const dialogueLine = scene.dialogue[0];
    if (!dialogueLine) {
      if (scene.choices && scene.choices.length > 0) {
        logRuntimeInfo('scene_no_dialogue_show_choices', {
          sceneId: currentScene,
          phase,
          source: 'NarrativeDisplay',
          mode: 'deterministic',
        });
        setShowChoices(true);
      }
      return;
    }

    if (scene.aiDriven) {
      logRuntimeInfo('ai_decision_start', {
        sceneId: currentScene,
        phase,
        source: 'NarrativeDisplay',
        mode: 'ai',
        details: {
          availableRouteCount: (scene.choices || []).length,
          storyMemoryEntries: storyMemory.length,
          aiServiceStatus,
        },
      });

      setIsGeneratingAI(true);
      addToConversationHistory('user', `Scene: ${currentScene}`);

      // Build availableRoutes from scene.choices for director mode
      const availableRoutes = (scene.choices || []).map(c => ({
        id: c.id,
        text: c.text,
        nextScene: c.nextScene,
        fearDelta: c.fearDelta,
      }));

      // 10-second timeout — fall back to static dialogue if AI is too slow
      aiTimeoutRef.current = setTimeout(() => {
        recordAiFallback('timeout_static_dialogue', true);
        logRuntimeWarn('ai_decision_timeout_fallback', {
          sceneId: currentScene,
          phase,
          source: 'NarrativeDisplay',
          mode: 'ai',
          details: {
            timeoutMs: 10000,
            fallbackRoute: availableRoutes[0]?.nextScene ?? null,
          },
        });

        setIsGeneratingAI(false);
        setAiServiceStatus('degraded');
        if (availableRoutes.length > 0) {
          aiChosenRouteRef.current = availableRoutes[0].nextScene;
        }
        startTypewriter(dialogueLine.text || '', 0);
      }, 10000);

      generateStory({
        currentScene,
        availableRoutes,
        storyMemory,
        playerChoices,
        characterStates,
        fearLevel,
        relationships,
        characterTraits,
        butterflyEffects,
        activeCharacter,
        conversationHistory,
        narratorPersonality,
        behavioralProfile,
      })
        .then((result) => {
          if (aiTimeoutRef.current) { clearTimeout(aiTimeoutRef.current); aiTimeoutRef.current = null; }
          setIsGeneratingAI(false);
          if (result) {
            recordRuntimeDecision('ai', result.chosenRoute ? 'ai_route_selected' : 'ai_narration_generated');
            logRuntimeInfo('ai_decision_success', {
              sceneId: currentScene,
              phase,
              source: 'NarrativeDisplay',
              mode: 'ai',
              details: {
                chosenRoute: result.chosenRoute ?? null,
                hasChoices: Boolean(result.choices?.length),
                fearDelta: result.fearDelta ?? 0,
              },
            });

            setAiServiceStatus('healthy');
            addToConversationHistory('assistant', result.narratorText || '');

            applyAIChanges({
              characterDeath: result.characterDeath,
              butterflyEffect: result.butterflyEffect,
              relationshipChanges: result.relationshipChanges,
            });

            if (result.behavioralDeltas) {
              updateBehavioralProfile(result.behavioralDeltas);
            }

            if (result.fearDelta) incrementFear(result.fearDelta);
            if (result.characterDeath) triggerJumpScare();

            // Director mode: LLM chose a route — auto-navigate after narrative
            if (result.chosenRoute) {
              aiChosenRouteRef.current = result.chosenRoute;

              // Store consequence in story memory for the butterfly tracker
              if (result.consequence) {
                addStoryMemory({
                  choiceId: `ai_${currentScene}`,
                  sceneId: currentScene,
                  consequence: result.consequence,
                  behavioralDeltas: result.behavioralDeltas,
                });
              }

              // Display narrator text — checkEnd will auto-navigate after it finishes
              startTypewriter(result.narratorText || dialogueLine.text || '', 0);
            } else {
              // Legacy: AI returned choices for player to pick
              if (result.dialogueLines && result.dialogueLines.length > 0) {
                const mapped = result.dialogueLines.map(dl => ({
                  speaker: dl.speaker,
                  text: dl.text,
                  mood: (dl.mood as typeof dialogueLine.mood) || undefined,
                  camera: (dl.cameraShot as typeof dialogueLine.camera) || undefined,
                }));
                setAiDialogueLines(mapped);
                startTypewriter(mapped[0].text, 0);
              } else if (result.narratorText) {
                startTypewriter(result.narratorText, 0);
              } else {
                startTypewriter(dialogueLine.text || '', 0);
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
            }
          } else {
            recordAiFallback('empty_ai_result');
            logRuntimeWarn('ai_decision_empty_result_fallback', {
              sceneId: currentScene,
              phase,
              source: 'NarrativeDisplay',
              mode: 'ai',
              details: {
                fallbackRoute: availableRoutes[0]?.nextScene ?? null,
              },
            });

            setAiServiceStatus('degraded');
            // Fallback: use first available route
            if (availableRoutes.length > 0) {
              aiChosenRouteRef.current = availableRoutes[0].nextScene;
            }
            startTypewriter(dialogueLine.text || '', 0);
          }
        })
        .catch(() => {
          recordAiFallback('request_failed');
          logRuntimeError('ai_decision_request_failed', {
            sceneId: currentScene,
            phase,
            source: 'NarrativeDisplay',
            mode: 'ai',
            details: {
              fallbackRoute: (scene.choices || [])[0]?.nextScene ?? null,
            },
          });

          if (aiTimeoutRef.current) { clearTimeout(aiTimeoutRef.current); aiTimeoutRef.current = null; }
          setIsGeneratingAI(false);
          setAiServiceStatus('offline');
          // Fallback: use first available route
          const routes = (scene.choices || []);
          if (routes.length > 0) {
            aiChosenRouteRef.current = routes[0].nextScene;
          }
          startTypewriter(dialogueLine.text || '', 0);
        });
    } else {
      recordRuntimeDecision('deterministic', 'deterministic_scene_line_start');
      logRuntimeInfo('deterministic_scene_line_start', {
        sceneId: currentScene,
        phase,
        source: 'NarrativeDisplay',
        mode: 'deterministic',
        details: {
          lineIndex: 0,
          speaker: dialogueLine.speaker,
        },
      });

      if (dialogueLine.fearDelta) incrementFear(dialogueLine.fearDelta);
      if (dialogueLine.speaker !== 'narrator') {
        setCharacterAnimation(dialogueLine.speaker, dialogueLine.animation || 'talking');
      }
      startTypewriter(dialogueLine.text || '', 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScene, scene.aiDriven]);





  const handleSkip = useCallback(() => {
    if (isTyping && pendingTextRef.current) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setDisplayText(pendingTextRef.current);
      setIsTyping(false);
      const totalLines = totalLinesRef.current;
      if (currentLineIndex + 1 >= totalLines) {
        if (sceneRef.current?.isEnding) {
          setPhase('ending');
          return;
        }
        if (aiChosenRouteRef.current) {
          navigateToChosenRoute();
        } else if (aiChoicesRef.current.length > 0 || (sceneRef.current.choices && sceneRef.current.choices.length > 0)) {
          setShowChoices(true);
        } else if (sceneRef.current.interactables && sceneRef.current.interactables.length > 0) {
          setPhase('exploration');
        } else {
          const fallback = sceneRef.current.choices?.[0]?.nextScene;
          if (fallback) { setCurrentScene(fallback); setPhase('scene'); }
        }
      } else {
        if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
        advanceTimerRef.current = setTimeout(() => {
          advanceTimerRef.current = null;
          setCurrentLineIndex(currentLineIndex + 1);
        }, 200);
      }
    }
  }, [isTyping, currentLineIndex, navigateToChosenRoute, setPhase, setCurrentScene]);

  const handleAdvance = useCallback(() => {
    if (advanceTimerRef.current) { clearTimeout(advanceTimerRef.current); advanceTimerRef.current = null; }
    setCurrentLineIndex(prev => prev + 1);
  }, []);

  const handleChoiceSelect = (choice: Choice) => {
    recordRuntimeDecision(scene.aiDriven ? 'ai' : 'deterministic', `choice_selected:${choice.id}`);
    logRuntimeInfo('player_choice_selected', {
      sceneId: currentScene,
      phase,
      source: 'NarrativeDisplay',
      mode: scene.aiDriven ? 'ai' : 'deterministic',
      details: {
        choiceId: choice.id,
        nextScene: choice.nextScene,
        fearDelta: choice.fearDelta ?? 0,
      },
    });

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

  // Prefer AI dialogue lines over static scene dialogue
  const activeDialogue = aiDialogueLines.length > 0 ? aiDialogueLines : scene.dialogue;
  const currentDialogueLine = activeDialogue[currentLineIndex] || null;
  const choicesToShow = aiChoices.length > 0 ? aiChoices : (scene.choices || []);
  const isNarrator = currentDialogueLine?.speaker === 'narrator';
  // Director mode is active when the scene is aiDriven and we've received (or are waiting for) a chosen route
  const isDirectorMode = scene.aiDriven === true;

  const aiStatusColor = aiServiceStatus === 'healthy' ? '#22c55e' : aiServiceStatus === 'degraded' ? '#eab308' : '#ef4444';

  if (phase !== 'scene' && phase !== 'choice') return null;
  if (!currentDialogueLine && !isGeneratingAI) return null;

  return (
    <>
      <ConsequencePopup />

      {/* AI service status dot (debug indicator) */}
      <div className="fixed top-4 right-4 z-50 pointer-events-none flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: aiStatusColor }} />
      </div>

      {/* Director mode indicator — subtle pulsing dot signaling AI is deciding */}
      {isDirectorMode && (
        <div className="fixed bottom-[29vh] right-4 z-50 pointer-events-none flex items-center gap-1.5">
          <span className="text-[9px] uppercase tracking-[0.25em] text-gray-600">
            {isGeneratingAI ? 'deciding' : aiChosenRouteRef.current ? 'navigating' : ''}
          </span>
          <div
            className={`w-1.5 h-1.5 rounded-full bg-cyan-600/60 ${isGeneratingAI ? 'animate-pulse' : ''}`}
          />
        </div>
      )}

      {/* Cinematic letterbox container */}
      <div className="fixed inset-0 z-30 pointer-events-none">
        {/* Top letterbox bar */}
        <div className="fixed top-0 left-0 right-0 h-[12vh] bg-black" />

        {/* Bottom letterbox bar — dialogue lives here */}
        <div
          className="fixed bottom-0 left-0 right-0 h-[28vh] bg-black pointer-events-auto flex flex-col"
          onClick={isTyping ? handleSkip : (!showChoices && currentLineIndex + 1 < (aiDialogueLines.length > 0 ? aiDialogueLines.length : scene.dialogue.length) ? handleAdvance : undefined)}
          style={{ cursor: (isTyping || (!showChoices && currentLineIndex + 1 < (aiDialogueLines.length > 0 ? aiDialogueLines.length : scene.dialogue.length))) ? 'pointer' : 'default' }}
        >
           {/* Zone 1: text content */}
           <div className={`flex flex-1 min-h-0 transition-opacity duration-300 ${lineVisible ? 'opacity-100' : 'opacity-0'}`}>
             {isGeneratingAI ? (
               <div className="flex items-center justify-center w-full px-8 gap-3">
                 <div className="flex gap-1">
                   <span className="w-1.5 h-1.5 rounded-full bg-cyan-700/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                   <span className="w-1.5 h-1.5 rounded-full bg-cyan-700/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                   <span className="w-1.5 h-1.5 rounded-full bg-cyan-700/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                 </div>
                 <p className="text-gray-500 text-sm italic font-serif animate-pulse">{loadingLine}</p>
               </div>
             ) : isNarrator ? (
               /* Narrator: centered italic text */
               <div className="flex items-center justify-center w-full px-8">
                 <p className="text-gray-400/90 text-lg italic font-serif text-center max-w-3xl leading-relaxed">
                   {displayText}
                   {isTyping && <span className="animate-pulse">|</span>}
                 </p>
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
                       className="text-[10px] uppercase tracking-[0.3em] font-bold mb-1 flex items-center gap-1.5"
                       style={{ color: getCharacter(currentDialogueLine.speaker).color }}
                     >
                       {getCharacter(currentDialogueLine.speaker).name}
                     </span>
                   )}
                   <p
                     className="text-white/95 text-xl font-serif leading-relaxed"
                     style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
                   >
                     {displayText}
                     {isTyping && <span className="animate-pulse">|</span>}
                   </p>
                 </div>
               </div>
             )}
           </div>

          {/* Zone 2: choices — only shown in non-director mode */}
          {showChoices && !isDirectorMode && choicesToShow.length > 0 && (
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
                    className={`block w-full max-w-xl px-4 py-2.5 text-left transition-all duration-200 font-mono text-xs uppercase tracking-wider ${isHighRisk
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
