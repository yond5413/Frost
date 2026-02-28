import { useCallback, useState } from 'react';

interface StoryGenerationOptions {
  currentScene: string;
  playerChoices: string[];
  characterStates: Record<string, 'alive' | 'dead' | 'unknown'>;
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
    const apiKey = process.env.MISTRAL_API_KEY;
    
    if (!apiKey) {
      setError('Mistral API key not configured');
      return null;
    }
    
    setIsGenerating(true);
    setError(null);
    
    const systemPrompt = `You are the narrator of a horror game called "Frost" inspired by Until Dawn. 
Generate short narrative text (2-3 sentences) and 2-3 choices for the player.
The game is set on Blackwood Mountain where supernatural creatures (Wendigos) hunt the characters.
Current scene: ${options.currentScene}
Previous choices: ${options.playerChoices.join(', ') || 'None'}

Respond in JSON format:
{
  "narratorText": "The narrative text here...",
  "choices": [
    { "id": "choice_1", "text": "Choice text here", "nextScene": "scene_id" }
  ]
}`;

    try {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'mistral-large-latest',
          messages: [
            { role: 'system', content: systemPrompt },
            ...(options.customPrompt ? [{ role: 'user', content: options.customPrompt }] : []),
          ],
          response_format: { type: 'json_object' },
          temperature: 0.8,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status}`);
      }
      
      const data = await response.json();
      const content = data.choices[0].message.content;
      
      return JSON.parse(content) as GeneratedStory;
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
