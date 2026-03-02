import { NextResponse } from 'next/server';
import { logRuntimeInfo, logRuntimeWarn, logRuntimeError } from '@/lib/runtimeLogger';

// Fallback scenes for when AI is unavailable
const FALLBACK_SCENES = [
  {
    narratorText: "The mountain swallows sound and light alike. Every shadow feels watched, every creak of ice a warning that something ancient stirs in the dark.",
    dialogueLines: [],
    choices: [],
    fearDelta: 5,
  },
  {
    narratorText: "Cold seeps through the walls like a living thing. The wind outside carries something that isn't quite wind — a low, resonant hunger that sets teeth on edge.",
    dialogueLines: [],
    choices: [],
    fearDelta: 8,
  },
  {
    narratorText: "Blackwood Mountain has claimed lives before. The survivors all said the same thing: the cold doesn't just freeze you. It gets inside your head first.",
    dialogueLines: [],
    choices: [],
    fearDelta: 10,
  },
  {
    narratorText: "Something moved at the edge of the treeline. Too fast. Too large. The others haven't noticed yet — but you have.",
    dialogueLines: [],
    choices: [],
    fearDelta: 15,
  },
  {
    narratorText: "The lodge holds its breath. Somewhere in the darkness, footsteps that don't belong to any of the survivors trace a slow, deliberate path.",
    dialogueLines: [],
    choices: [],
    fearDelta: 12,
  },
];

function getFallback(fearLevel: number) {
  const highFear = fearLevel > 60;
  const pool = highFear ? FALLBACK_SCENES.slice(2) : FALLBACK_SCENES.slice(0, 3);
  return pool[Math.floor(Math.random() * pool.length)];
}

function getDirectorFallback(
  availableRoutes: Array<{ id: string; text: string; nextScene: string; fearDelta?: number }>,
  fearLevel: number
) {
  // At high fear pick a darker (later) route; otherwise pick the first
  const chosen = fearLevel > 60
    ? availableRoutes[availableRoutes.length - 1]
    : availableRoutes[0];
  const fallbackScene = getFallback(fearLevel);
  return {
    chosenRoute: chosen.nextScene,
    narratorText: fallbackScene.narratorText,
    consequence: "The mountain remembers what was decided here.",
    fearDelta: fallbackScene.fearDelta,
    characterDeath: null,
    relationshipChanges: [],
    butterflyEffect: null,
  };
}


interface DirectorModeResponse {
  chosenRoute: string;
  narratorText: string;
  consequence: string;
  fearDelta: number;
  characterDeath: string | null;
  relationshipChanges: Array<{ character1: string; character2: string; delta: number }>;
  butterflyEffect: { id: string; choice: string } | null;
  behavioralDeltas?: { recklessness?: number; loyalty?: number; deception?: number; survivalFocus?: number };
}

interface NarratorModeResponse {
  narratorText: string;
  dialogueLines?: Array<{ speaker: string; text: string; mood?: string; cameraShot?: string }>;
  choices?: Array<{ id: string; text: string; nextScene: string; fearDelta?: number; consequence?: string; triggerQTE?: boolean }>;
  relationshipChanges?: Array<{ character1: string; character2: string; delta: number }>;
  butterflyEffect?: { id: string; choice: string } | null;
  characterDeath?: string | null;
  fearDelta?: number;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isDirectorModeResponse(value: unknown): value is DirectorModeResponse {
  if (!isObject(value)) return false;
  return typeof value.chosenRoute === 'string' && typeof value.narratorText === 'string' && typeof value.consequence === 'string';
}

function isNarratorModeResponse(value: unknown): value is NarratorModeResponse {
  if (!isObject(value)) return false;
  return typeof value.narratorText === 'string';
}

const PERSONALITY_CONFIG = {
  balanced: { temperature: 0.85, deathThreshold: 60, deathChance: 0.25, label: 'The Auteur', persona: 'You decide outcomes with care. Every consequence earns its weight.' },
  brutal: { temperature: 0.95, deathThreshold: 40, deathChance: 0.60, label: 'The Reaper', persona: 'You are merciless. Survival is earned, not given. Choose the hardest path when darkness is justified.' },
  merciful: { temperature: 0.70, deathThreshold: 80, deathChance: 0.10, label: 'The Guardian', persona: 'You believe in human resilience. Favor routes where the group stays intact. Death is a last resort.' },
  chaotic: { temperature: 1.00, deathThreshold: 50, deathChance: 0.40, label: 'The Wildfire', persona: 'You are unknowable. Ignore accumulated patterns. Surprise the player. Every run is new.' },
} as const;

export async function POST(request: Request) {
  const body = await request.json();
  const {
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
  } = body;

  const personality = (narratorPersonality as keyof typeof PERSONALITY_CONFIG) ?? 'balanced';
  const personalityConfig = PERSONALITY_CONFIG[personality] ?? PERSONALITY_CONFIG.balanced;
  const profile = (behavioralProfile as { recklessness: number; loyalty: number; deception: number; survivalFocus: number }) ?? { recklessness: 50, loyalty: 50, deception: 50, survivalFocus: 50 };

  const apiKey = process.env.MISTRAL_API_KEY;

  // Director mode: availableRoutes provided and non-empty
  const isDirectorMode = Array.isArray(availableRoutes) && availableRoutes.length > 0;

  logRuntimeInfo('story_api_request_received', {
    sceneId: currentScene,
    source: 'generate-story-route',
    mode: isDirectorMode ? 'ai' : 'deterministic',
    details: {
      hasApiKey: Boolean(apiKey),
      fearLevel: fearLevel ?? 0,
      availableRouteCount: Array.isArray(availableRoutes) ? availableRoutes.length : 0,
      storyMemoryEntries: Array.isArray(storyMemory) ? storyMemory.length : 0,
    },
  });

  if (!apiKey) {
    if (isDirectorMode) {
      logRuntimeWarn('story_api_missing_key_director_fallback', {
        sceneId: currentScene,
        source: 'generate-story-route',
        mode: 'ai',
      });
      return NextResponse.json(getDirectorFallback(availableRoutes, fearLevel ?? 0));
    }
    logRuntimeWarn('story_api_missing_key_narrator_fallback', {
      sceneId: currentScene,
      source: 'generate-story-route',
      mode: 'deterministic',
    });
    return NextResponse.json(getFallback(fearLevel ?? 0));
  }

  const aliveChars = Object.entries(characterStates as Record<string, string>)
    .filter(([, s]) => s === 'alive')
    .map(([name]) => name)
    .join(', ');

  const deadChars = Object.entries(characterStates as Record<string, string>)
    .filter(([, s]) => s === 'dead')
    .map(([name]) => name)
    .join(', ');

  const relationshipSummary = Object.entries(relationships as Record<string, Record<string, number>> ?? {})
    .map(([key, val]) => {
      const value = (val as { value?: number }).value ?? val;
      return `${key}: ${value}/100`;
    })
    .join(', ');

  const traitSummary = Object.entries(characterTraits as Record<string, Record<string, number>> ?? {})
    .map(([char, traits]) => `${char}: [${Object.entries(traits).map(([t, v]) => `${t}=${v}`).join(', ')}]`)
    .join('; ');

  const butterflySummary = Object.entries(butterflyEffects as Record<string, string> ?? {})
    .map(([id, choice]) => `${id} → ${choice}`)
    .join(', ');

  const fearDescription = fearLevel > 70
    ? 'EXTREME TERROR — visceral, panicked, almost broken'
    : fearLevel > 40
      ? 'HIGH DREAD — deeply unsettling, suspenseful'
      : fearLevel > 20
        ? 'GROWING UNEASE — tense, atmospheric'
        : 'TENSE CALM — foreboding but controlled';

  const history = (conversationHistory as Array<{ role: string; content: string }> ?? []).slice(-10);

  let systemPrompt: string;
  let userMessage: string;
  let maxTokens = 1500;

  if (isDirectorMode) {
    // Format memory for context
    const memoryLines = (storyMemory as Array<{ choiceId: string; sceneId: string; consequence: string }> ?? [])
      .slice(-6)
      .map(e => `  [${e.sceneId}] ${e.consequence}`)
      .join('\n');

    // Format routes
    const routeLines = (availableRoutes as Array<{ id: string; text: string; nextScene: string; fearDelta?: number }>)
      .map((r, i) => `  ${i + 1}. id="${r.nextScene}" — "${r.text}" (fearDelta: ${r.fearDelta ?? 0})`)
      .join('\n');

    const behavioralArcSection = personality === 'chaotic'
      ? `\nPLAYER ARC: Ignore the behavioral arc. Surprise the player.`
      : `\nPLAYER ARC (behavioral fingerprint accumulated over this run):
- Recklessness: ${profile.recklessness}/100 ${profile.recklessness > 65 ? '(high — this player charges in)' : profile.recklessness < 35 ? '(low — avoids direct confrontation)' : '(moderate)'}
- Loyalty: ${profile.loyalty}/100 ${profile.loyalty > 65 ? '(high — group bonds have been protected)' : profile.loyalty < 35 ? '(low — relationships have been sacrificed)' : '(moderate)'}
- Deception: ${profile.deception}/100 ${profile.deception > 65 ? '(high — this player uses others)' : profile.deception < 35 ? '(low — has been transparent)' : '(moderate)'}
- Survival focus: ${profile.survivalFocus}/100 ${profile.survivalFocus > 65 ? '(high — primarily self-serving)' : profile.survivalFocus < 35 ? '(low — willing to sacrifice self)' : '(moderate)'}

Factor this arc into your route choice: high recklessness earns high-risk paths; high loyalty earns cooperative escapes; high deception earns betrayal consequences.`;

    systemPrompt = `You are the game master for "Frost", a cinematic horror game on Blackwood Mountain. You are operating as ${personalityConfig.label}.
${personalityConfig.persona}

CURRENT GAME STATE:
- Scene: ${currentScene}
- Active character: ${activeCharacter || 'sam'}
- Fear level: ${fearLevel}/100 (${fearDescription})
- Survivors: ${aliveChars || 'unknown'}
- Dead: ${deadChars || 'none'}
- Recent choices: ${(playerChoices as string[]).slice(-5).join(', ') || 'none'}
- Relationships: ${relationshipSummary || 'unknown'}
- Character traits: ${traitSummary || 'unknown'}
- Butterfly effects in play: ${butterflySummary || 'none yet'}

STORY MEMORY (past AI decisions):
${memoryLines || '  (none yet)'}
${behavioralArcSection}

AVAILABLE ROUTES:
${routeLines}

DECISION RULES — favor the route that best reflects accumulated consequences:
- Fear > ${personalityConfig.deathThreshold} → darker routes; fear < 30 → slightly safer ones
- Damaged relationships (below 40) → betrayal or separation paths
- Butterfly effects already triggered → compound their consequences
- Low honesty trait (< 35) → deceptive or self-serving outcomes
- High bravery (> 65) → characters act, even if it costs them
- Only include characterDeath if fear > ${personalityConfig.deathThreshold} AND scene strongly warrants it (${Math.round(personalityConfig.deathChance * 100)}% chance).

Your job: Choose ONE route. Explain what happens and why in 2-3 narrator sentences. Write one abstract consequence sentence for the butterfly tracker. Set behavioralDeltas based on the route chosen: aggressive/risky choices push recklessness up; protecting others pushes loyalty up; self-serving choices push survivalFocus up; deceptive choices push deception up. Use values in range -15 to +15, 0 if unchanged.

Respond ONLY in this exact JSON:
{
  "chosenRoute": "the nextScene id you chose",
  "narratorText": "2-3 sentences: what happens and why, grounded in the player's history",
  "consequence": "1 abstract, non-spoilery sentence for the butterfly tracker",
  "fearDelta": 5,
  "characterDeath": null,
  "relationshipChanges": [],
  "butterflyEffect": null,
  "behavioralDeltas": {
    "recklessness": 0,
    "loyalty": 0,
    "deception": 0,
    "survivalFocus": 0
  }
}`;

    userMessage = `Decide the outcome for scene: ${currentScene}. Choose from the available routes based on everything that has happened.`;
    maxTokens = 1500;
  } else {
    // Standard narrator mode
    systemPrompt = `You are the narrator of "Frost", a cinematic horror game inspired by Until Dawn. You are operating as ${personalityConfig.label}.
${personalityConfig.persona}
Setting: Blackwood Mountain. A group of friends. A Wendigo that hunts them. Choices determine who survives.

CURRENT GAME STATE:
- Scene: ${currentScene}
- Active character: ${activeCharacter || 'sam'}
- Fear level: ${fearLevel}/100 (${fearDescription})
- Survivors: ${aliveChars || 'unknown'}
- Dead: ${deadChars || 'none'}
- Previous choices: ${(playerChoices as string[]).slice(-5).join(', ') || 'none'}
- Relationships: ${relationshipSummary || 'unknown'}
- Character traits: ${traitSummary || 'unknown'}
- Butterfly effects in play: ${butterflySummary || 'none yet'}

TONE: ${fearLevel > 70 ? 'Visceral, terrifying, every sentence should induce dread.' : fearLevel > 40 ? 'Deeply suspenseful, creeping horror.' : 'Atmospheric, foreboding, something wrong just beneath the surface.'}

Your task: Generate rich, atmospheric narrative content for this scene.

RULES:
1. Keep narratorText to 2-3 evocative sentences. Be specific to ${currentScene}.
2. Dialogue lines should feel like real people terrified on a mountain — not game NPCs.
3. Choices should create meaningful moral dilemmas with real consequences.
4. Only include characterDeath if fear > ${personalityConfig.deathThreshold} AND the scene context strongly suggests it (${Math.round(personalityConfig.deathChance * 100)}% chance).
5. Relationship changes should feel earned by the scene context.
6. Keep cameraShot values to one of: speaker, wide, medium, closeup, over_shoulder, pov, tracking, panic, freeze, flicker.

Respond ONLY in this exact JSON format:
{
  "narratorText": "2-3 atmospheric sentences...",
  "dialogueLines": [
    { "speaker": "sam", "text": "...", "mood": "scared", "cameraShot": "closeup" }
  ],
  "choices": [
    { "id": "choice_id", "text": "Short player choice text", "nextScene": "scene_id", "fearDelta": 10, "consequence": "brief consequence description" }
  ],
  "relationshipChanges": [
    { "character1": "sam", "character2": "mike", "delta": -10 }
  ],
  "butterflyEffect": null,
  "characterDeath": null,
  "fearDelta": 5
}`;

    userMessage = `Generate narrative content for scene: ${currentScene}`;
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: userMessage },
  ];

  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages,
        response_format: { type: 'json_object' },
        temperature: personalityConfig.temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      logRuntimeWarn('story_api_upstream_non_ok', {
        sceneId: currentScene,
        source: 'generate-story-route',
        mode: isDirectorMode ? 'ai' : 'deterministic',
        details: { status: response.status },
      });
      console.error(`Mistral API error: ${response.status}`);
      if (isDirectorMode) return NextResponse.json(getDirectorFallback(availableRoutes, fearLevel ?? 0));
      return NextResponse.json(getFallback(fearLevel ?? 0));
    }

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content;

    if (typeof rawContent !== 'string') {
      logRuntimeWarn('story_api_invalid_content_payload', {
        sceneId: currentScene,
        source: 'generate-story-route',
        mode: isDirectorMode ? 'ai' : 'deterministic',
      });
      console.error('Mistral API returned invalid content payload');
      if (isDirectorMode) return NextResponse.json(getDirectorFallback(availableRoutes, fearLevel ?? 0));
      return NextResponse.json(getFallback(fearLevel ?? 0));
    }

    let content: unknown;
    try {
      content = JSON.parse(rawContent);
    } catch (parseErr) {
      logRuntimeWarn('story_api_json_parse_failure', {
        sceneId: currentScene,
        source: 'generate-story-route',
        mode: isDirectorMode ? 'ai' : 'deterministic',
      });
      console.error('Failed to parse Mistral JSON response:', parseErr);
      if (isDirectorMode) return NextResponse.json(getDirectorFallback(availableRoutes, fearLevel ?? 0));
      return NextResponse.json(getFallback(fearLevel ?? 0));
    }

    if (isDirectorMode) {
      if (!isDirectorModeResponse(content)) {
        logRuntimeWarn('story_api_invalid_director_shape', {
          sceneId: currentScene,
          source: 'generate-story-route',
          mode: 'ai',
        });
        console.error('Invalid director response shape from Mistral');
        return NextResponse.json(getDirectorFallback(availableRoutes, fearLevel ?? 0));
      }
      logRuntimeInfo('story_api_director_response_ok', {
        sceneId: currentScene,
        source: 'generate-story-route',
        mode: 'ai',
        details: { chosenRoute: content.chosenRoute },
      });
      return NextResponse.json(content);
    }

    if (!isNarratorModeResponse(content)) {
      logRuntimeWarn('story_api_invalid_narrator_shape', {
        sceneId: currentScene,
        source: 'generate-story-route',
        mode: 'deterministic',
      });
      console.error('Invalid narrator response shape from Mistral');
      return NextResponse.json(getFallback(fearLevel ?? 0));
    }

    logRuntimeInfo('story_api_narrator_response_ok', {
      sceneId: currentScene,
      source: 'generate-story-route',
      mode: 'deterministic',
    });
    return NextResponse.json(content);
  } catch (err) {
    logRuntimeError('story_api_request_failed', {
      sceneId: currentScene,
      source: 'generate-story-route',
      mode: isDirectorMode ? 'ai' : 'deterministic',
    });
    console.error('Story generation failed:', err);
    if (isDirectorMode) return NextResponse.json(getDirectorFallback(availableRoutes, fearLevel ?? 0));
    return NextResponse.json(getFallback(fearLevel ?? 0));
  }
}
