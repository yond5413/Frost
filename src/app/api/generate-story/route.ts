import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { currentScene, playerChoices, characterStates, fearLevel, clues } = await request.json();

  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'MISTRAL_API_KEY not configured' }, { status: 500 });
  }

  const aliveChars = Object.entries(characterStates as Record<string, string>)
    .filter(([, s]) => s === 'alive')
    .map(([name]) => name)
    .join(', ');

  const systemPrompt = `You are the narrator of a horror game called "Frost" inspired by Until Dawn.
Generate short, atmospheric narrative text (2-3 sentences) for the current scene.
The game is set on Blackwood Mountain where supernatural creatures (Wendigos) hunt the characters.
Current scene: ${currentScene}
Previous choices: ${(playerChoices as string[]).join(', ') || 'None'}
Survivors still alive: ${aliveChars || 'unknown'}
Clues found so far: ${(clues as string[])?.join(', ') || 'None'}
Fear level: ${fearLevel}/100 — ${fearLevel > 70 ? 'EXTREME TERROR. Make the narration visceral, panicked, and terrifying.' : fearLevel > 40 ? 'HIGH DREAD. Make the narration suspenseful and creepy.' : 'uneasy tension. Make the narration unsettling.'}

Write in a tense, cinematic horror style. Keep it 2-3 sentences. Be specific to the scene context.

Respond ONLY in JSON format:
{
  "narratorText": "The atmospheric narrative text here...",
  "choices": []
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
        messages: [{ role: 'system', content: systemPrompt }],
        response_format: { type: 'json_object' },
        temperature: 0.8,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    return NextResponse.json(content);
  } catch (err) {
    console.error('Story generation failed:', err);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
