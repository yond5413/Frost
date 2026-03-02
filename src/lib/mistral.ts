import { useCallback, useState } from 'react';

interface StoryGenerationOptions {
  currentScene: string;
  playerChoices: string[];
  characterStates: Record<string, 'alive' | 'dead' | 'unknown'>;
  fearLevel?: number;
  clues?: string[];
  customPrompt?: string;
  // Enhanced context
  relationships?: Record<string, Record<string, number>>;
  characterTraits?: Record<string, Record<string, number>>;
  butterflyEffects?: Record<string, string>;
  activeCharacter?: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  // Director mode
  availableRoutes?: Array<{ id: string; text: string; nextScene: string; fearDelta?: number }>;
  storyMemory?: Array<{ choiceId: string; sceneId: string; consequence: string; behavioralDeltas?: Partial<{ recklessness: number; loyalty: number; deception: number; survivalFocus: number }> }>;
  // Narrator personality + behavioral arc
  narratorPersonality?: 'balanced' | 'brutal' | 'merciful' | 'chaotic';
  behavioralProfile?: { recklessness: number; loyalty: number; deception: number; survivalFocus: number };
}

interface GeneratedStory {
  narratorText: string;
  // Director mode fields
  chosenRoute?: string;
  consequence?: string;
  // Standard narrator mode fields
  dialogueLines?: Array<{
    speaker: string;
    text: string;
    mood?: string;
    cameraShot?: string;
  }>;
  choices?: Array<{
    id: string;
    text: string;
    nextScene: string;
    fearDelta?: number;
    consequence?: string;
    triggerQTE?: boolean;
  }>;
  characterDeath?: string;
  butterflyEffect?: {
    id: string;
    choice: string;
  };
  relationshipChanges?: Array<{
    character1: string;
    character2: string;
    delta: number;
  }>;
  fearDelta?: number;
  sceneTransition?: string;
  behavioralDeltas?: {
    recklessness?: number;
    loyalty?: number;
    deception?: number;
    survivalFocus?: number;
  };
}

export function useMistralAI() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateStory = useCallback(async (options: StoryGenerationOptions): Promise<GeneratedStory | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentScene: options.currentScene,
          playerChoices: options.playerChoices,
          characterStates: options.characterStates,
          fearLevel: options.fearLevel ?? 0,
          clues: options.clues ?? [],
          customPrompt: options.customPrompt,
          relationships: options.relationships ?? {},
          characterTraits: options.characterTraits ?? {},
          butterflyEffects: options.butterflyEffects ?? {},
          activeCharacter: options.activeCharacter ?? 'sam',
          conversationHistory: options.conversationHistory ?? [],
          availableRoutes: options.availableRoutes ?? [],
          storyMemory: options.storyMemory ?? [],
          narratorPersonality: options.narratorPersonality ?? 'balanced',
          behavioralProfile: options.behavioralProfile ?? { recklessness: 50, loyalty: 50, deception: 50, survivalFocus: 50 },
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json() as GeneratedStory;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate story';
      setError(message);
      console.error('Mistral generation error:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generateStory, isGenerating, error };
}
