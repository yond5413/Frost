# Frost

> An AI-driven horror survival game inspired by *Until Dawn*. Survive the night on Blackwood Mountain where every choice matters—and every decision has consequences.

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat&logo=three.js&logoColor=white)](https://threejs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Features

- **Dynamic AI Storytelling** — Mistral Large 2 generates branching narratives based on player choices
- **Cinematic Camera System** — Multiple shot types (wide, medium, closeup, over_shoulder, pov) with smooth transitions
- **Chapter-Dependent Horror** — The Wendigo's behavior evolves across chapters, from distant stalking to aggressive pursuit
- **Butterfly Effect** — Track how your decisions ripple through the story with the consequence system
- **Multiple Environments** — Explore the Lodge, Mines, Woods, and Cabin with atmospheric 3D scenes
- **Jump Scares** — Fear-based effects trigger white flash, red vignette, screen shake, and FOV warp
- **Interactive Exploration** — WASD movement, arrow key camera control, and clickable objects
- **Survival Mechanics** — Manage fear levels, QTEs, and character survival

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| 3D Engine | React-Three-Fiber + Three.js |
| State | Zustand |
| AI | Mistral Large 2 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/yourusername/frost.git
cd frost
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint        # Run ESLint
npm run lint --fix  # Auto-fix issues
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/
│   │   └── generate-story/ # Mistral AI story generation endpoint
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Game entry point
├── components/
│   ├── three/              # 3D game components
│   │   ├── environments/   # Lodge, Mines, Woods, Cabin
│   │   ├── shared/         # Atmosphere, PostProcessing
│   │   ├── CinematicCamera.tsx
│   │   ├── Character.tsx
│   │   ├── GameScene.tsx
│   │   ├── PlayerController.tsx
│   │   └── Wendigo.tsx
│   └── ui/                 # HUD and UI overlays
│       ├── ChoiceSystem.tsx
│       ├── FearEffects.tsx
│       ├── JumpScare.tsx
│       ├── NarrativeDisplay.tsx
│       └── SurvivalScreen.tsx
├── data/
│   ├── characters.ts       # Character definitions
│   └── story.ts           # Scene definitions and dialogue
├── hooks/                  # Custom React hooks
└── lib/
    ├── environmentStore.ts # Environment state
    ├── mistral.ts         # AI integration
    ├── musicManager.ts    # Audio management
    └── store.ts           # Global game state
```

## Game Systems

### Phase Flow

1. **intro** — Title screen with "Press Start"
2. **scene** — Narrative dialogue with cinematic camera
3. **choice** — Player decisions (2-4 options per choice point)
4. **exploration** — WASD movement, interactive objects

### Camera Shots

| Shot | Use Case |
|------|----------|
| `wide` | Establishing shots, environmental storytelling |
| `medium` | General dialogue |
| `closeup` | Emotional moments, character reactions |
| `over_shoulder` | Tension, looking at objects/characters |
| `pov` | First-person perspective, fear moments |

### Wendigo Behavior by Chapter

| Chapters | Behavior |
|----------|----------|
| 1-2 | Distant stalking, appears in fog |
| 3-4 | Closer proximity, sudden lunges |
| 5+ | Aggressive, chases camera directly |

### Fear System

- **0-49** — Normal gameplay
- **50-79** — Camera shake, subtle distortion
- **80+** — Jump scare trigger, screen effects intensify

## Environment Variables

Create a `.env.local` file with the following:

```env
MISTRAL_API_KEY=your_mistral_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key  # Optional: TTS
```

## Contributing

Developers working on this project should follow the guidelines in [AGENTS.md](./AGENTS.md).

## Credits

- Inspired by **Until Dawn** (Supermassive Games)
- AI story generation powered by **Mistral AI**
- Voice synthesis by **ElevenLabs**
- Built with **React-Three-Fiber** and **Three.js**

## License

MIT License — see [LICENSE](LICENSE) for details.
