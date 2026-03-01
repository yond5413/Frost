import { useCallback, useState } from 'react';

interface StoryGenerationOptions {
  currentScene: string;
  playerChoices: string[];
  characterStates: Record<string, 'alive' | 'dead' | 'unknown'>;
  fearLevel?: number;
  clues?: string[];
  customPrompt?: string;
}

interface GeneratedStory {
  narratorText: string;
  choices: Array<{
    id: string;
    text: string;
    nextScene: string;
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
