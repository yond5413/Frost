# Frost: Finalization Plan for Series A Demo

**Goal**: Transform bug-free prototype into elite, production-quality horror experience worthy of Series A investment.

**Current State**: Clean codebase (0 lint errors, successful build), prologue functional, core systems in place.

---

## Priority 1: AI-Powered Dynamic Storytelling (Critical)

### Mistral Large 2 Integration
- Replace hardcoded scenes with real-time AI narrative generation
- Implement conversation history tracking (last 10 exchanges)
- Add character relationship state (trust, fear, alliance) that influences AI responses
- Create prompt engineering system:
  - Base prompt: "You are a horror narrative AI for 'Frost', inspired by Until Dawn"
  - Context injection: current characters, location, fear level, relationship states
  - Output format: JSON with dialogue, camera instructions, fear delta, choice consequences
- Add fallback to cached scenarios if API fails
- Implement story branching memory (store and replay choices impact)

### State Management Updates
- Extend `useGameStore` to include:
  - `relationshipScores: { [characterId]: number }` (-100 to 100)
  - `storyMemory: { choiceId: string, sceneId: string, timestamp: number }[]`
  - `currentAIResponse: AIDialogueResponse`
  - `aiServiceStatus: 'healthy' | 'degraded' | 'offline'`
- Create `lib/mistral.ts` client with rate limiting, retry logic, and response caching

---

## Priority 2: Voice Acting & Sound Design (Critical)

### ElevenLabs TTS Integration
- Extend `hooks/useVoice.ts`:
  - Add voice mapping per character (Hannah = young female, Beth = mature female, Mike = male, etc.)
  - Emotion parameter support (fear, tension, relief, urgency)
  - Caching system for generated audio URLs (store in IndexedDB)
  - Pre-load next 2-3 dialogue lines during current playback
  - Volume/shouting detection based on fear level
- Implement audio queue manager to handle overlapping lines
- Add fallback to browser speech synthesis if TTS fails
- Export TTS audio to `<Audio>` elements for spatial positioning

### 3D Positional Audio
- Install `@react-three/drei` Audio module
- Add ambient sounds per environment:
  - Lodge: crackling fireplace, wind howling, floor creaks
  - Woods: owl calls, distant screams, crunching snow
- Creature audio: Wendigo breathing, movement sounds (branch snapping)
- UI sounds: button clicks, choice hover, jump scare stingers
- Distance attenuation (sound quieter when far)

### Dynamic Music System
- Create `lib/musicManager.ts`:
  - Three states: `Exploration` (ambient), `Tension` (pulsating), `Terror` (chaotic)
  - Crossfade transitions (2-3 seconds)
  - Fear level threshold: 0-30=Exploration, 31-60=Tension, 61+=Terror
  - Stinger cues for discoveries/deaths (short burst)
- Use Web Audio API for low-latency playback
- Loop points for seamless playback

---

## Priority 4: Advanced Cinematics (Essential)

### Camera System Overhaul
**Current**: Basic look-at, limited transitions
**Target**: Cinematic, film-quality camera work

- Create `components/three/AdvancedCamera.tsx`:
  - Smooth transitions: 2-3 second ease-in-out between shots
  - Motion blur effect (post-processing)
  - Camera shake based on fear level (subtle at 30%, violent at 70%)
  - Handheld effect (slight jitter) for POV shots
  - Focus pull effects when transitioning between characters
  - Dolly zoom for dramatic moments
  - Enable depth of field (blur background in closeups)

### Shot System
```typescript
type CameraShot = 'wide' | 'medium' | 'closeup' | 'over_shoulder' | 'pov' | 'dutch' | 'low_angle' | 'high_angle';

interface CameraInstruction {
  shot: CameraShot;
  target?: string; // character name or position
  duration?: number; // override default transition
  effect?: 'shaky' | 'dutch' | 'dolly_zoom';
}
```
- Pre-canned shot positions per environment (20+ shots)
- Auto-framing: compute framing based on character/model bounding box
- Smooth interpolation using THREE.MathUtils.lerp with easing curves

### Post-Processing Pipeline
- Install `@react-three/postprocessing`
- Add effects stack:
  - Film grain (subtle, 0.3 intensity)
  - Vignette (darkens edges, 0.4 intensity)
  - Chromatic aberration (0.001, only in terror state)
  - Bloom (for jump scare flash)
  - Tone mapping (ACESFilmic)
- Fear-based effect intensity:
  - Vignette darkens as fear increases
  - Chromatic aberration spikes during scares
  - Grain becomes more pronounced

---

## Priority 5: Jump Scare System (Essential)

### Multi-Stage Scare Sequence
**Phase 1: Buildup** (1-2 seconds)
- Audio cue: low-frequency rumble, distorted whisper
- Visual: subtle vignette pulsing, slight screen shake
- Music: tension state with stinger approach

**Phase 2: Impact** (0.2 seconds)
- White flash (fullscreen, 100% opacity → 0% in 0.1s)
- Red vignette overlay (radial gradient)
- Screen shake: 0.3s violent shake (frequency 30Hz)
- Sound: loud scream/impact (max volume, 0.5s duration)

**Phase 3: Aftermath** (1-3 seconds)
- FOV warp: temporary 20% FOV expansion then contraction
- Fear delta: +15 to +30 based on scare intensity
- Music: crossfade to terror state
- Character reaction: camera pullback, heavy breathing TTS

### Implementation: `components/ui/JumpScare.tsx`
- Trigger by prop: `<JumpScare active intensity="high" />`
- GSAP or Framer Motion for timing
- Prevent immediate re-trigger (30s cooldown)
- Difficulty scaling: lower fear threshold for scares on subsequent playthroughs

### Wendigo Scare Triggers
- Proximity: < 5 units = buildup, < 2 units = full scare
- Line-of-sight: if player "sees" Wendigo (camera raycast)
- Scripted scares at narrative beats (pre-planned)
- Random ambient scares (20% chance when fear > 50)

---

## Priority 6: Wendigo AI Behavior (Essential)

### State Machine
```typescript
enum WendigoState {
  STALKING = 'stalk',      // distant, keeps distance 20-30 units, uses cover
  CIRCLING = 'circle',    // medium range 10-20 units, moves around player
  LUNGING = 'lunge',      // quick charge attack from 10 units
  CHASING = 'chase',      // sustained pursuit, speed 1.5x player
  HIDING = 'hide',        // retreats to darkness, reappears elsewhere
  SCARING = 'scare'       // scripted jump scare moment
}
```

### Chapter-Dependent Intensity
- Chapter 1-2: Mostly STALKING (70%), occasional CIRCLING (20%), LUNGING (10%)
- Chapter 3-4: STALKING (30%), CIRCLING (40%), LUNGING (30%)
- Chapter 5+: CHASING (50%), LUNGING (30%), HIDING (20%)
- Always SCARING at scripted story moments

### Movement & Behavior
- Pathfinding: use navmesh (three-pathfinding) or raycast-based
- Jerky, unnatural movement:
  - Head-turn speed: fast (player-like)
  - Body rotation: slow, awkward (2x standard lerp time)
  - Sprinting: head forward, arms back, irregular stride
- Detection:
  - Line-of-sight checks every 0.5s (not perfect - periodic)
  - Sound detection: player running/crouching makes noise radius
  - Light sensitivity: flashlight reveals Wendigo at 15 units, darkness hides at 5
- Stealth mechanics: Wendigo hunts by sight/sound, not omnipotent

### Creature Model Polish (See Model Polish Section)

---

## Priority 7: Exploration Mechanics (Essential)

### WASD Movement + Camera
- Current `KeyboardCameraControls.tsx` is insufficient
- Create `components/three/PlayerController.tsx`:
  - First-person character controller
  - Collision detection (capsule collider, THREE.Capsule)
  - Slam walking (Shift) with stamina bar
  - Crouching (Ctrl) for stealth
  - Jump (Space) but with limited height
  - Sprint meter: 100 capacity, drains at 10/s when running, recovers at 5/s when walking

### Interactive Environment
**InteractableObject** component enhancements:
- Prompt system: show text (PRESS E) when within 3 units and in view
- Multiple interaction types:
  - `examine`: show text description + TTS
  - `use`: consume item or trigger story event
  - `take`: add to inventory
  - `read`: full-screen document (notes, letters)
- Hand cursor on hover
- Sound feedback (tick on approach, thud on use)

### Inventory System
- Zustand slice: `inventory: InventoryItem[]`
- Inventory UI: bottom bar with icons, max 12 slots
- Item types: key, note, tool, weapon (melee), healing
- Quick-select (1-9 keys)
- Item examination mode (click icon → close-up view)

### Puzzle Elements
- Integrate puzzles into story scenes:
  - Locked door → find key or combination
  - Environmental puzzle: redirect power, clear debris
  - Timing puzzle: escape before Wendigo arrives
- Puzzle state tracking in store
- Hint system: character dialogue suggests solutions if stuck > 30s

---

## Priority 8: UI/UX Excellence (Essential)

### Fear Meter Visualization
- Radial or bar meter in corner (top-left)
- Three zones: Green (0-30), Yellow (31-60), Red (61-100)
- Screen effects tied to fear:
  - 30+: subtle vignette (10% darkening)
  - 50+: vignette (25%), breathing overlay (slight blur at edges)
  - 70+: vignette (40%), chromatic aberration (0.0005), screen shake (0.1 amplitude)
  - 90+: red flash pulse, heartbeat sound
- Character portrait reactions: show fear expressions that worsen

### Choice Wheel System
- F radial menu on key press (Space or E)
- 4-6 choices displayed with icons
- Time limit: 15s countdown (configurable difficulty)
- Audio cue when 5s remain
- Default to " hesitate " if time expires (fear +10)
- Color code: helpful (blue), risky (orange), dangerous (red)
- Tooltips: hover shows consequence preview

### Relationship Status Screen
- Accessible via Tab
- Grid of character portraits with:
  - Trust meter (−100 to +100, color gradient red→green)
  - Status text (Ally, Neutral, Suspicious, Hostile, Dead)
  - Last interaction summary
- AI-generated brief: "Mike trusts you less because you abandoned him"
- Relationship changes after every major choice

### Death Recap & Chapter Summary
- On death: show fullscreen overlay
- Death cause: "Killed by Wendigo after choosing to split up"
- Statistics: playtime, choices made, fear reached, scares survived
- "Continue from last checkpoint" or "Return to menu"
- Chapter end: summary of key decisions, teaser for next chapter

### Settings Menu
- Audio sliders: Master, Music, Voice, SFX (0-100%)
- Controls: invert Y-axis, sensitivity, key remap
- Graphics: quality presets (Low/Med/High), resolution, fullscreen
- Accessibility: subtitles (on/off + size), colorblind mode (protanopia/deuteranopia), reduce screen shake
- Horror settings: jump scare intensity (Low/Med/High), fear effects (on/off)

### Save/Load System
- Auto-save: after every major choice and at scene boundaries
- Manual save slots: 3 slots + quick-save (F5)
- Save data includes:
  - Current scene ID
  - Fear level, relationship scores
  - Inventory
  - Story memory/choices made
  - Playtime
- Load screen: thumbnail of last scene, brief stats
- Confirm overwrite for existing saves

---

## Additional Critical Polish: Models & Visuals

### Wendigo Model Improvements
- **Current**: Basic placeholder model
- **Target**: High-poly, terrifying, anatomically-believable

1. **Sculpt refinements** (Blender/Maya):
   - Deer skull: add aged cracks, missing teeth, moss
   - Antlers: asymmetrical, broken tips, blood stains
   - Skin: stretched sinews, exposed ribs, tumor-like growths
   - Pose: hunched 30°, long arms (knees to ground)
   - UV unwrap for clean texturing

2. **Texturing** (Substance Painter):
   - Skin: pale, blistered, with frostbite discolorations (blue/purple)
   - Bone: yellowed ivory, deep cracks with dirt
   - Blood: dried dark red, fresh bright red on claws
   - Emissive for eyes (faint white glow)
   - Vertex color for frost overlay

3. **Rigging & Animation**:
   - spine_01-5 bones for spinal hunching
   - neck, head, jaw (separate for snap)
   - leg: 3 bones each (upper, lower, foot)
   - arm: 4+ bones (shoulder, elbow, hand, finger controls)
   - tailbone (spine extension)
   - **Animation set**:
     - `stalk`: slow creep, head-turning, breathing
     - `circle`: lateral shuffle, crouch-walk
     - `lunge`: explosive forward charge (0.5s acceleration)
     - `chase`: galloping run (4-legged sprint, arms dragging)
     - `idle`: twitching, head-tilt, ear flicks
     - `attack`: lunge + swipe, jaw snap

4. **PBR Materials**:
   - `skin`: StandardMaterial, roughness 0.7, metalness 0.1
   - `bone`: roughness 0.9, metalness 0.0
   - `eyes`: emissive 0xffffff, intensity 0.5

### Character Models (Mike, Hannah, Sam, etc.)
- Replace stick figures with proper humanoid models
- Face rigging for expressions (fear, relief, anger)
- Body shapes: distinct silhouettes (Mike = bulky, Hannah = slender)
- Clothing: era-appropriate (1990s winter gear)
- Hair: physics-enabled (movement with motion/impact)

### Environment Polish

#### Trees & Foliage
- Use SpeedTree or manual models with wind shader
- Snow accumulation on branches (vertex painting)
- Particle system: snow fall, drifting mist
- LOD system (3 levels, last = billboards)

#### Cabin Interior
- Furniture models: couch, table, fireplace, bunks
- Props: cans, books, photos, blood splatters
- Lighting: point lights (lanterns), fireplace emissive mesh
- Fog volume: cold breath in interior

#### Exterior Woods
- Snow ground: parabolic displacement map for footprints
- Rock models: ice-covered variations
- Cabin exterior: detailed logs, chimney smoke, broken windows
- Skybox: cloudy, moonlit, aurora borealis subtle

---

## Technical Implementation Phases

### Phase 1: AI & Voice (Week 1-2)
- [ ] Implement Mistral client with caching
- [ ] Update store for relationship/memory
- [ ] Wire AI to narrative system (replace static scenes)
- [ ] Complete ElevenLabs integration with caching
- [ ] Add voice queue manager
- [ ] Create prompt templates for different scenes

### Phase 2: Audio & Music (Week 2-3)
- [ ] Ambiance system per environment
- [ ] Positional audio for creature
- [ ] Dynamic music state machine
- [ ] Audio stinger library (10+ effects)
- [ ] Mixer UI for debugging

### Phase 3: Cinematics & Scares (Week 3-4)
- [ ] AdvancedCamera with smooth transitions
- [ ] Post-processing pipeline (all effects)
- [ ] JumpScare component with sequence
- [ ] Fear-based effect scaling
- [ ] Cinematic shot library (50+ shots)

### Phase 4: Wendigo AI (Week 4-5)
- [ ] State machine implementation
- [ ] Pathfinding integration
- [ ] Detection systems (sight, sound)
- [ ] Chapter-dependent behavior curves
- [ ] Animation controller (blend trees)
- [ ] Creature movement polish (jerky, unnatural)

### Phase 5: Exploration (Week 5-6)
- [ ] PlayerController with collision
- [ ] Stamina & crouch systems
- [ ] InteractableObject enhancement
- [ ] Inventory UI & management
- [ ] Quick-select controls
- [ ] Puzzle framework + 3-5 sample puzzles

### Phase 6: UI/UX Polish (Week 6-7)
- [ ] Fear meter with screen effects
- [ ] Choice wheel with timer
- [ ] Relationship screen
- [ ] Death recap & summary
- [ ] Settings menu (audio/controls/graphics)
- [ ] Save/Load system (auto + manual)

### Phase 7: Model Polish (Week 7-8)
- [ ] Wendigo high-poly sculpt, retopology
- [ ] UV unwrap, texture bake
- [ ] Substance Painter texturing
- [ ] Rigging + weight painting
- [ ] Animation set (6-8 animations)
- [ ] Character models for all cast
- [ ] Environment detail pass (furniture, props)
- [ ] Particle effects (snow, mist, breath)

### Phase 8: Integration & Playtesting (Week 8-9)
- [ ] Full Chapter 1 loop test (prologue → ending)
- [ ] Balance fear curve (not too punishing)
- [ ] Tune AI difficulty
- [ ] Optimize performance (target 60 FPS)
- [ ] Bug bash: eliminate crashes, freezes
- [ ] QA: 5+ external testers, collect feedback
- [ ] Build: production build setup

---

## Success Metrics

### Functional
- ✅ Chapter 1 playable from start to finish without crashes
- ✅ AI generates unique dialogue per playthrough (70% variation)
- ✅ Voice lines play without gaps or repeats
- ✅ Wendigo encounters at least 3 times, each unique behavior
- ✅ Jump scare triggers correctly (fear threshold + scripted)
- ✅ All UI screens accessible and functional

### Performance
- ✅ 60 FPS consistent on RTX 3060 / GTX 1660
- ✅ Load time < 5s for Chapter 1
- ✅ Memory < 2GB
- ✅ No console errors

### Polish
- ✅ No placeholder assets (all models/textures final quality)
- ✅ No hardcoded dialogue in Chapter 1
- ✅ All voice lines TTS-generated (no system default)
- ✅ Settings save to localStorage
- ✅ Death recap shows statistics
- ✅ Settings menu fully functional

### Accessibility
- ✅ Subtitles (option)
- ✅ Colorblind mode (3 variants)
- ✅ Reduce motion option
- ✅ Rebindable controls

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI rate limits (Mistral) | High | Cache all responses, local fallback scenarios |
| TTS latency (>2s) | High | Pre-fetch + queue, use cached audio ifslow |
| Wendigo animations not finished | Critical | Outsource to freelance animator, use placeholders with post-processing |
| Performance on low-end GPUs | Medium | Quality presets, LODs, disable shadows on Low |
| Scene length < 15 minutes | Medium | Expand dialogue, add exploration area, back-track allowed |
| AI narrative incoherence | High | Strict JSON schema, validation, fallback to hand-written scenes |
| Voice API costs exceed budget | Medium | Monitor usage, cache aggressively, limit calls per session |

---

## Asset Checklist

### Models
- [ ] Wendigo (rigged, animated) - high priority
- [ ] Mike, Hannah, Sam, Beth (player characters) - high priority
- [ ] Forest creatures (deer, wolves) - medium
- [ ] Props (keys, notes, tools) - medium

### Textures
- [ ] Wendigo texture set ( diffuse, normal, roughness, emissive )
- [ ] Character texture sets (diffuse, normal, roughness)
- [ ] Environment textures (snow, wood, ice, rock)
- [ ] UI texture atlas (icons, buttons, frames)

### Audio
- [ ] Ambient loops (woods, lodge, terror)
- [ ] Creature sounds (breathing, movement, scream)
- [ ] Music tracks (3 states, 5min each)
- [ ] UI SFX (button, hover, confirm, error)
- [ ] Jump scare stingers (5 variations)
- [ ] Footstep surfaces (snow, wood, carpet)

### Voice
- [ ] Prologue lines (Hannah, Beth, Narrator)
- [ ] Chapter 1 dialogue (all characters)
- [ ] TTS voice IDs mapped and tested

---

## Demo Script (15-Minute Experience)

**0-3 min**: Prologue (frozen lake scene)
- Intro screen → dialogue between Hannah & Beth
- First choice: "stay together" or "split up"
- Wendigo stalk (first visual scare, no jump scare)
- Transition to Chapter 1

**3-12 min**: Chapter 1 - The Abandoned Cabin
- Exploration: find key, read notes, discover backstory
- Wendigo encounters (2 chases, 1 scare)
- Relationship building with Mike & Sam
- 3-4 meaningful choices with friendship/fear consequences
- Puzzle: power on generator to unlock basement

**12-15 min**: Climax & Ending
- Basement revelation ( Wendigo lair )
- Final choice: "fight" or "flee" → 2 distinct endings
- Short outro: "Will they survive?" → Series A tease

**Must showcase**:
- Voice acting (50%+ lines voiced)
- AI-generated responses (unscripted choices)
- Wendigo AI behavior variation
- Cinematic camera work
- Jump scare with full effects
- Fear meter impact on gameplay
- Relationship changes visible

---

## Out of Scope for Series A (Post-Demo)

- Full game (10+ chapters)
- All character arcs completed
- Multiplayer/co-op
- VR support
- Advanced graphics (ray tracing)
- Procedural content generation
- Complex RPG systems (abilities, perks)
- Extensive enemy types (only Wendigo)

---

**Target completion**: 9 weeks from kickoff
**Critical path**: Wendigo model → AI integration → Chapter 1 loop → polish
**Buffer**: 1 week for QA and bug fixes before investor demo
