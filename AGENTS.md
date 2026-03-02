# Frost - Agent Coding Guidelines

## Project Overview
Frost is an AI-driven horror survival game inspired by Until Dawn (https://until-dawn.fandom.com/wiki/Until_Dawn_Wiki). Built with Next.js + Three.js. Target: production-quality horror experience matching Until Dawn's cinematic feel.

## Tech Stack
- **Frontend**: Next.js 16 + React-Three-Fiber + Three.js
- **State**: Zustand
- **AI**: Mistral Large 2 for dynamic story generation
- **Voice**: ElevenLabs TTS
- **Styling**: Tailwind CSS v4

## Build Commands
```bash
npm run dev              # Start dev server (port 3000)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run lint --fix       # Auto-fix lint issues
```

## Code Style

### General
- TypeScript only - no plain JavaScript
- Functional components with hooks - no class components
- All client components must have 'use client' directive
- Use ES modules (import/export)

### Imports (order: React → External → @/ → Types)
```typescript
import { useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@/lib/store';
import { getScene } from '@/data/story';
```

### Naming
| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | GameScene.tsx |
| Hooks | camelCase + use prefix | useVoice.ts |
| Utils | camelCase | mistral.ts |
| Types | PascalCase | Choice, GamePhase |
| Constants | UPPER_SNAKE | MAX_FEAR_LEVEL |

### TypeScript
- Always type params and returns
- Use interfaces for objects, types for unions
- Export types from store for reuse

### React Patterns
```typescript
'use client';
export default function Component({ prop = 'default' }: Props) {
  const [state, setState] = useState(initial);
  const ref = useRef<THREE.Group>(null);
  
  useEffect(() => { return () => cleanup(); }, []);
  if (condition) return null;
  return <div>{state}</div>;
}
```

### Three.js
```typescript
const meshRef = useRef<THREE.Mesh>(null);
useFrame((_, delta) => { meshRef.current?.rotateY(delta) });
return <mesh ref={meshRef} castShadow><boxGeometry /><meshStandardMaterial /></mesh>;
```
- Type refs with THREE.Group, THREE.Mesh
- Use useFrame for animations
- Add castShadow/receiveShadow

### Error Handling
```typescript
try {
  const result = await fetchData();
  if (!result.ok) throw new Error(`HTTP ${result.status}`);
  return result.data;
} catch (err) {
  console.error('Failed:', err instanceof Error ? err.message : 'Unknown');
  return null;
}
```

## Project Structure
```
src/
├── app/                    # Next.js App Router
├── components/
│   ├── three/              # 3D: GameScene, Wendigo, CinematicCamera, Character
│   └── ui/                 # UI: NarrativeDisplay, JumpScare, ChoiceSystem
├── data/                   # story.ts, characters.ts
├── hooks/                  # useVoice.ts
└── lib/                    # store.ts, mistral.ts
```

## Key Game Systems

### Dialogue with Cinematic Camera
```typescript
dialogue: [
  { speaker: 'narrator', text: '...', camera: 'wide' },
  { speaker: 'mike', text: 'Did you hear that?', camera: 'closeup', mood: 'scared' }
]
```
- **Camera shots**: 'wide', 'medium', 'closeup', 'over_shoulder', 'pov'
- Camera auto-tracks speaker with smooth transitions
- Fear-based shake at >50 fear

### Scene Structure
```typescript
sceneId: {
  id: 'scene_id',
  title: 'Chapter 1: The Return',
  dialogue: [...],
  choicesAt: 1,
  choices: [{ id: 'choice_1', text: 'Option A', nextScene: 'next', fearDelta: 10 }],
  cameraPosition: [0, 2, 5],
  cameraControls: true,
  interactables: [{ id: 'item', position: [2, 0.5, -1], label: 'Examine', targetScene: 'scene' }],
  activeCharacter: 'sam',
  aiDriven: true,
  environment: 'lodge'
}
```

### Phase Flow
1. **intro** - Title screen
2. **scene** - Narrative dialogue with cinematic camera
3. **choice** - Player decisions
4. **exploration** - WASD movement, arrow keys camera, clickable objects

### Wendigo (Chapter-Dependent Behavior)
- Ch 1-2: Distant stalking, appears in fog
- Ch 3-4: Closer, sudden lunges
- Ch 5+: Aggressive, chases camera
- Features: deer skull, antlers, skeletal body, long arms, jerky movement

### Jump Scare
- White flash → red vignette → screen shake → FOV warp
- Triggers on character death or fear threshold (>80)

## Production Quality Standards
Reference: Until Dawn (https://until-dawn.fandom.com/wiki/Until_Dawn_Wiki)
- Cinematic camera work during dialogue
- Chapter-dependent horror intensity
- Terrifying monster design (Wendigo)
- Atmospheric environments with particle effects
- Sound design integration points

## Testing Checklist
- [ ] Run `npm run build` before committing
- [ ] Run `npm run lint`
- [ ] Test cinematic camera transitions
- [ ] Verify Wendigo chapter-dependent behavior
- [ ] Test jump scare effects
