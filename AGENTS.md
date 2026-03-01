# Frost - Agent Coding Guidelines

## Project Overview
Frost is an AI-driven horror survival game inspired by Until Dawn, built with Next.js + Three.js for a 36-hour hackathon. Features branching narratives, voice I/O (ElevenLabs), and dynamic story generation via Mistral AI.

## Tech Stack
| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14 + Three.js (React-Three-Fiber) |
| Voice Input | ElevenLabs Voice API |
| Voice Output | ElevenLabs TTS for NPC voices |
| AI Story | Mistral Large 2 (via API) |
| State | Zustand (client-side) |
| Styling | Tailwind CSS v4 |

## Build Commands

```bash
# Development
npm run dev              # Start Next.js dev server (port 3000)

# Production
npm run build            # Build for production
npm run start            # Start production server

# Linting
npm run lint             # Run ESLint on entire project
npm run lint src/        # Lint specific directory
npm run lint --fix       # Auto-fix linting issues
```

## Code Style Guidelines

### General Rules
- Use TypeScript for all files - no plain JavaScript
- Use functional components with hooks - no class components
- All client components must include 'use client' directive
- Use ES modules (import/export) - no CommonJS

### Imports
```typescript
// Order: 1. React/Next 2. External libs 3. @/ internal 4. Types
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

import { useGameStore, Choice } from '@/lib/store';
import { getScene } from '@/data/story';
import NarrativeDisplay from '@/components/ui/NarrativeDisplay';
```
- Use path alias @/ for internal imports (configured in tsconfig.json)
- Avoid relative paths beyond ../ - prefer @/

### Naming Conventions
| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | GameScene.tsx, NarrativeDisplay |
| Hooks | camelCase, prefix use | useVoice.ts, useElevenLabs |
| Utils/Lib | camelCase | mistral.ts, store.ts |
| Types/Interfaces | PascalCase | Choice, GameState, SceneProps |
| Constants | UPPER_SNAKE_CASE | MAX_FEAR_LEVEL, API_BASE_URL |
| Component Files | PascalCase | GameScene.tsx |
| Hook/Util Files | camelCase | useVoice.ts, store.ts |

### TypeScript
```typescript
// Interface for component props
interface SceneProps {
  environment?: 'cabin' | 'woods' | 'mines' | 'lodge';
  cameraPosition?: [number, number, number];
}

// Type for union values
export type GamePhase = 'intro' | 'exploration' | 'dialogue' | 'choice' | 'scene' | 'ending';

// Reusable type
export interface Choice {
  id: string;
  text: string;
  nextScene: string;
  consequence?: string;
}
```
- Always type function parameters and return values
- Use interfaces for object shapes, types for unions
- Export types from store for reuse across components

### React/Next.js Patterns
```typescript
'use client';

import { useState, useCallback, useEffect } from 'react';

interface Props {
  initialValue?: string;
}

export default function ComponentName({ initialValue = '' }: Props) {
  const [state, setState] = useState(initialValue);

  const handleAction = useCallback((param: string) => {
    setState(param);
  }, []);

  useEffect(() => {
    return () => {};
  }, []);

  if (condition) return null;

  return <div>{state}</div>;
}
```
- Destructure props with defaults
- Use useCallback for event handlers passed to children
- Use useEffect cleanup for subscriptions/timers
- Return null to hide components (not conditional JSX)
- Use dynamic imports with { ssr: false } for Three.js components

### State Management (Zustand)
```typescript
import { create } from 'zustand';

interface GameState {
  phase: GamePhase;
  currentScene: string;
  playerChoices: string[];
  
  setPhase: (phase: GamePhase) => void;
  setCurrentScene: (sceneId: string) => void;
  makeChoice: (choiceId: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
  phase: 'intro',
  currentScene: 'prologue_start',
  playerChoices: [],
  
  setPhase: (phase) => set({ phase }),
  setCurrentScene: (sceneId) => set({ currentScene: sceneId }),
  makeChoice: (choiceId) => set((state) => ({
    playerChoices: [...state.playerChoices, choiceId],
  })),
}));
```

### Three.js / React-Three-Fiber
```typescript
function Cabin() {
  const cabinRef = useRef<THREE.Group>(null);
  
  useFrame((_, delta) => {
    if (cabinRef.current) {
      cabinRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={cabinRef} position={[0, 0, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[6, 3, 5]} />
        <meshStandardMaterial color="#3d2817" />
      </mesh>
    </group>
  );
}
```
- Type refs with THREE.Group, THREE.Mesh, etc.
- Use useFrame for animations (60fps loop)
- Add castShadow/receiveShadow to meshes in lit scenes

### Error Handling
```typescript
try {
  const result = await fetchData();
  if (!result.ok) {
    throw new Error(`HTTP error: ${result.status}`);
  }
  return result.data;
} catch (err) {
  const message = err instanceof Error ? err.message : 'Unknown error';
  console.error('Fetch failed:', message);
  return null;
}
```
- Use try/catch for async operations
- Log errors with console.error
- Return null or defaults on failure - don't throw in UI code

### Tailwind CSS
- Use Tailwind v4 utility classes
- Use CSS variables in globals.css for theme colors
- Avoid inline styles except for dynamic values

## Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Main game page
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles + CSS variables
├── components/
│   ├── three/              # 3D scene components (React-Three-Fiber)
│   │   └── GameScene.tsx
│   └── ui/                 # UI components
│       ├── NarrativeDisplay.tsx
│       ├── ChoiceSystem.tsx
│       └── GameHUD.tsx
├── data/                   # Static data
│   └── story.ts            # Story scenes data
├── hooks/                  # Custom React hooks
│   └── useVoice.ts         # Voice I/O hooks
└── lib/                    # Utilities
    ├── store.ts            # Zustand store
    └── mistral.ts          # Mistral AI integration
```

## Environment Variables
Create .env.local:
```bash
MISTRAL_API_KEY=your_mistral_api_key
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_key
NEXT_PUBLIC_ELEVENLABS_VOICE_ID=your_voice_id
```

## Key Game Patterns

### Scene Navigation Flow
1. User clicks "Begin" -> setPhase('scene')
2. NarrativeDisplay shows scene text (typewriter effect)
3. After text completes, choices appear
4. On choice: makeChoice(id), setCurrentScene(nextScene), setPhase('scene')
5. Cycle repeats

### AI Story Integration
- Use useMistralAI hook from @/lib/mistral.ts
- Pass current scene ID, player choices, character states to AI
- Parse JSON response for narrator text + choices
- Fall back to static story data if API fails

### Voice I/O
- useVoiceInput() - Web Speech API for STT (browser native)
- useElevenLabs() - ElevenLabs TTS for NPC voices
- Integrate into NarrativeDisplay for voice-driven gameplay

## Game Mechanics (From Sprint Plan)
- Butterfly Effect: Track all player choices, feed to Mistral for dynamic consequences
- **Active Character System**: The player takes control of specific characters during certain scenes (e.g., Playing as Sam in the lodge, then switching to Mike in the woods).
- **8 Characters**: sam, mike, jessica, ashley, chris, josh, emily, matt, with an active character state.
- **Fear Level**: 0-100 scale, affects story intensity and QTE difficulty.
- Clues/Totems: Discoverable items that provide premonitions
- Multiple Endings: Based on character survival + choices

## Current Status
- 3D cabin scene with snow particles, fog, lighting - DONE
- Game store with phases, choices, character states - DONE
- Mistral AI hook (needs integration) - DONE
- Voice hooks (Web Speech + ElevenLabs) - DONE
- Static story data (prologue + Chapter 1) - DONE
- UI components (Narrative, Choice, HUD) - DONE
- Integration work needed: Connect AI to story flow, wire voice to gameplay
