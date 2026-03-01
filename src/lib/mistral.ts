import { useCallback, useState } from 'react';

interface StoryGenerationOptions {
  currentScene: string;
  playerChoices: string[];
  characterStates: Record<string, 'alive' | 'dead' | 'unknown'>;
  fearLevel?: number;
  clues?: string[];
  customPrompt?: string;
  // NEW: Enhanced context
  relationships?: Record<string, Record<string, number>>;
  characterTraits?: Record<string, Record<string, number>>;
  butterflyEffects?: Record<string, string>;
  activeCharacter?: string;
}

interface GeneratedStory {
  narratorText: string;
  choices: Array<{
    id: string;
    text: string;
    nextScene: string;
    fearDelta?: number;
    consequence?: string;
    triggerQTE?: boolean;
  }>;
  // NEW: AI decision fields
  characterDeath?: string;  // e.g., 'jessica'
  butterflyEffect?: {
    id: string;
    choice: string;
  };
  relationshipChanges?: Array<{
    character1: string;
    character2: string;
    delta: number;
  }>;
  sceneTransition?: string;
  dialogueLines?: Array<{
    speaker: string;
    text: string;
    mood?: string;
  }>;
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
          // NEW context
          relationships: options.relationships ?? {},
          characterTraits: options.characterTraits ?? {},
          butterflyEffects: options.butterflyEffects ?? {},
          activeCharacter: options.activeCharacter ?? 'sam',
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
