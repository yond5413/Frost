# Frost: Implementation Roadmap - Interactive Cinema V2

## Core Philosophy Shift
**NO EXPLORATION** - Pure interactive cinema (film-like)
- Characters talk to each other with gestures/animations
- Players make choices that affect relationships
- Cinematic camera angles per dialogue line
- Voice acting brings characters to life
- **Priority**: Dialogue system, character animations, relationship-driven branching

---

## Quick Wins (Do First)
- [ ] Replace narratorText with dialogue array format
- [ ] Add speaker portraits with mood/emotion variants
- [ ] Show active character name/POV indicator
- [ ] Add character-specific camera angles (shot-reverse-shot)

---

## Phase 1: Dialogue System Foundation
**Estimated**: 4-6 hours

### Files to Modify:
- `src/lib/store.ts` (minor)
- `src/data/story.ts` (major)
- `src/components/ui/NarrativeDisplay.tsx` (rewrite)
- `src/components/ui/CharacterPortrait.tsx` (add mood variants)

### Changes:
- [ ] Update `Scene` interface:
  ```typescript
  interface DialogueLine {
    speaker: string;          // character ID or 'narrator'
    text: string;
    mood?: 'neutral' | 'happy' | 'angry' | 'sad' | 'scared';
    animation?: string;       // 'talking', 'gesture_angry', etc.
    camera?: 'speaker' | 'wide' | 'closeup';
  }
  interface Scene {
    id: string;
    title: string;
    description: string;
    dialogue: DialogueLine[];  // REPLACES narratorText
    choicesAt?: number;        // Index in dialogue where choices appear
    // ... other fields
  }
  ```
- [ ] Add mood variants to `public/textures/faces/`: sam_neutral.png, sam_happy.png, sam_angry.png, etc. (use simple filters for now)
- [ ] Rewrite `NarrativeDisplay.tsx`:
  - Iterate through `dialogue` array instead of single narratorText
  - Show speaker portrait + name when character speaks
  - Typewriter effect per dialogue line
  - Auto-advance after line completes (with skip)
  - When `choicesAt` index reached, show choice buttons
  - Support branching: different dialogue lines based on relationship state (use AI later)
- [ ] Convert 3-5 existing scenes to new dialogue format (test end-to-end)

---

## Phase 2: Character Animation System
**Estimated**: 4-6 hours

### Files:
- `src/components/three/Character.tsx`

### Changes:
- [ ] Extend `AnimationType`:
  ```typescript
  type AnimationType = 
    | 'idle' 
    | 'walk' 
    | 'talking'            // subtle body bob while speaking
    | 'gesture_angry'      // clenched fists, stiff posture
    | 'gesture_happy'      // light bounce, arms open
    | 'gesture_sad'        // slumped shoulders, head down
    | 'gesture_scared'     // trembling, hunched
    | 'shock'              // sudden jump back
    | 'fear';              // cowering
  ```
- [ ] Implement `talking` animation: gentle body sway, slight arm movement
- [ ] Implement gesture animations using simple transforms (rotate/scale groups)
- [ ] Add animation blending: smoothly transition between states
- [ ] Hook: `NarrativeDisplay` reads `dialogue[lineIndex].animation` and calls `setCharacterAnimation(characterId, animation)`
- [ ] Add `useEffect` in `Character.tsx` to clear animation after duration (auto-return to idle)

---

## Phase 3: Camera System - Cinematic Shots
**Estimated**: 2-3 hours

### Files:
- `src/components/three/GameScene.tsx`
- `src/components/ui/NarrativeDisplay.tsx`

### Changes:
- [ ] Update `CameraController` to support dynamic target changes per dialogue line
- [ ] Define shot types:
  - `'speaker'`: Close-up on current speaker (2m distance)
  - `'wide'`: Wide shot showing all characters (5m distance)
  - `'closeup'`: Extreme close-up on speaker (1m, focus on face)
- [ ] `NarrativeDisplay` requests camera change before each dialogue line:
  ```typescript
  const cameraTargets = {
    sam: [0, 1.5, 2],
    mike: [2, 1.5, 2],
    // ... per character
  };
  ```
- [ ] Smooth lerp between camera positions (already exists in CameraController)

---

## Phase 4: Dynamic Dialogue & Relationship Integration
**Estimated**: 4-5 hours

### Files:
- `src/data/story.ts`
- `src/components/ui/ChoiceSystem.tsx`
- `src/lib/store.ts` (queries)

### Changes:
- [ ] Add conditional dialogue branches:
  ```typescript
  dialogue: [
    {
      speaker: 'mike',
      text: 'I trust you, Jessica.',
      condition: { character: 'jessica', relationship: '>50' } // only if relationship > 50
    },
    {
      speaker: 'mike',
      text: 'I don\'t know what to believe anymore.',
      condition: { character: 'jessica', relationship: '<50' } // fallback
    }
  ]
  ```
- [ ] Update `NarrativeDisplay`: Before showing line, evaluate conditions against store → select appropriate text
- [ ] Precompute relationship checks: `getRelationship(char1, char2)` helper
- [ ] Add trait-based dialogue variations (similar condition system)
- [ ] Update `ChoiceSystem` to display relationship consequences more clearly (already parses `consequence` field)
- [ ] Add `getButterflyChoice(segmentId)` query in store (currently only setter exists)

---

## Phase 5: Voice Integration (ElevenLabs)
**Estimated**: 2-3 hours

### Files:
- `src/hooks/useVoice.ts` (exists, but not used)
- `src/components/ui/NarrativeDisplay.tsx`

### Changes:
- [ ] Create character-to-voice mapping:
  ```typescript
  const CHARACTER_VOICES = {
    sam: 'voice_id_1',
    mike: 'voice_id_2',
    // ... all 8 characters
  };
  ```
- [ ] In `NarrativeDisplay`: When dialogue line appears:
  - If `voiceEnabled` and speaker is a character (not narrator):
    - Call `speak(text, CHARACTER_VOICES[speaker])`
    - Optionally: block advance until voice finishes (configurable)
- [ ] Add voice preview in UI: "VOICE: ON/OFF" already exists in GameHUD
- [ ] Test voice latency: add loading indicator if needed

---

## Phase 6: 3D Character Model Upgrade (Mixamo)
**Estimated**: 6-8 hours

### Approach: Mixamo Rigged Models
**Quality/Time**: ⭐⭐⭐⭐⭐ (Best balance)

### Steps:
1. [ ] Download free base human mesh (e.g., "Base Male/Female" from BlendSwap)
2. [ ] Upload to Mixamo → auto-rig
3. [ ] Download animations: `idle`, `talking`, `gesture_angry`, `gesture_happy`, `gesture_sad`, `gesture_scared`, `shock`, `fear`
4. [ ] Convert to `.glb`
5. [ ] Create 8 character variants by:
   - Changing mesh colors (clothing, hair)
   - Scaling adjustments (height differences)
   - Adding accessories (glasses, hat, etc.)
6. [ ] Add `/public/models/` folder with 8 `.glb` files
7. [ ] Update `Character.tsx`:
   - Use `useGLTF` and `useAnimations` from `@react-three/drei`
   - Load model based on `characterId`
   - Cross-fade animations based on `animation` prop
8. [ ] Remove primitive capsule code (replace with loaded mesh)
9. [ ] Set character-specific camera positions (close-up angles for faces)

### Fallback if too complex:
Keep current stylized characters, just add better shading/material (2 hrs)

---

## Phase 7: Butterfly Consequences & Branching
**Estimated**: 4-6 hours

### Files:
- `src/data/story.ts`
- `src/lib/store.ts`

### Changes:
- [ ] Define 8-10 key butterfly segments with IDs:
  - `b1_sam_bat` (Ch 1: Sam shows bat to Josh or not)
  - `b2_matt_telescope` (Ch 1: Matt sees Emily/Mike)
  - `b3_mike_jessica_rescue` (Ch 2: Mike's chase choices)
  - ... (inspired by Until Dawn wiki)
- [ ] For each segment, ensure the choice has `consequence: 'butterfly_b1_sam_bat'` etc.
- [ ] In later scenes, add conditional branches:
  ```typescript
  dialogue: [
    {
      speaker: 'sam',
      text: 'I still have that bat Josh gave me.',
      condition: { butterfly: 'b1_sam_bat', choice: 'show_bat' }
    }
  ]
  ```
- [ ] Add `checkButterfly(segmentId, expectedChoice)` helper in store
- [ ] Update scenes to reference butterfly checks (branch to different nextScene or dialogue)
- [ ] Test: early choice → mid-game consequence

---

## Phase 8: Totem System (Foreshadowing)
**Estimated**: 3-4 hours

### Files:
- `src/data/story.ts` (add totems)
- `src/components/ui/TotemVision.tsx` (create)
- `src/lib/store.ts` (add totemsFound)

### Changes:
- [ ] Define 10 totems:
  ```typescript
  const totems = [
    {
      id: 'totem_01_death',
      type: 'death',
      character: 'sam',
      vision: 'A vision of Sam falling from the cliff...',
      sceneId: 'ch1_lodge_exploration',
      position: [x, y, z]
    },
    // ...
  ];
  ```
- [ ] Add `totemsFound: string[]` to store
- [ ] When `currentScene` changes, check if totem should trigger (proximity or auto-discovery)
- [ ] Create `TotemVision` overlay component:
  - Full-screen dark fade
  - Show vision text (typewriter)
  - Play eerie sound (optional)
  - Auto-dismiss after 5s
- [ ] Integrate into `NarrativeDisplay` or as separate component (like ButterflyNotification)
- [ ] Add totem count to GameHUD

---

## Phase 9: Therapy Sessions (Meta-Narrative)
**Estimated**: 3-4 hours

### Files:
- `src/data/story.ts` (add therapy scenes)
- `src/lib/store.ts` (use existing `therapyChoices`)

### Changes:
- [ ] Create 4 therapy interlude scenes (between chapters):
  - Therapy 1: Introduction, basic questions
  - Therapy 2: Fear selection (choose from images)
  - Therapy 3: Character preferences (who do you trust?)
  - Therapy 4: Guilt/remorse questions (affects ending)
- [ ] Each therapy scene uses dialogue format (Dr. Hill speaks)
- [ ] Store `therapyChoices: any[]` tracks answers
- [ ] Therapy choices affect ending calculation:
  - `despair` ending (unrepentant) vs `repentance` ending (remorseful)
- [ ] Visual: Office environment decays across sessions (background changes)

---

## Phase 10: Content Expansion & Testing
**Estimated**: 3-4 days

### Changes:
- [ ] Convert entire story (prologue + 10 chapters) to dialogue format
  - Target: 80-100 scenes
  - Each scene has 3-8 dialogue lines
  - Every character gets at least 3 scenes to control
- [ ] Add relationship-specific dialogue branches (at least 2 variations per major relationship)
- [ ] Implement 8 butterfly segments with cascading consequences
- [ ] Place 10 totems throughout story (one per chapter roughly)
- [ ] Integrate 4 therapy scenes between chapters 1, 3, 6, 9
- [ ] Test all 8 character rotations
- [ ] Balance trait/relationship updates (values stay 0-100)
- [ ] Verify camera cuts feel cinematic (adjust positions)
- [ ] Polish: Add minor gestures (head nod, crossed arms) during dialogue
- [ ] Optimize: Lazy-load character models, reduce dialogue latency

---

## Testing Checklist (Final)
- [ ] All 8 characters have distinct voices (if voice enabled) and portraits with moods
- [ ] Dialogue flows naturally with character gestures
- [ ] Camera cuts between speakers feel dynamic
- [ ] Relationship changes visibly affect later dialogue
- [ ] Butterfly effects trigger at least 3 times in a single playthrough with visible consequences
- [ ] Totems appear and show visions
- [ ] Therapy sessions appear and choices affect ending
- [ ] At least 3 distinct endings (e.g., All survive, Some survive, None survive)
- [ ] Voice syncs with typewriter (optional: block advance until voice finishes)
- [ ] Performance: 60fps with all characters rendered

---

## Success Metrics

By end of Phase 6, you should have:
- ✅ 1 complete chapter (8-10 scenes) in dialogue format
- ✅ 3 character perspectives with distinct conversations
- ✅ Character animations (talking, gestures) working
- ✅ Cinematic camera system
- ✅ Voice integration (if voice IDs configured)

By end of Phase 10:
- ✅ Full story (all chapters) playable
- ✅ 15-20 minute playthrough
- ✅ Players feel emotional connection to characters
- ✅ Choices have meaningful impact on story
- ✅ Polished horror atmosphere (lighting, sound, pacing)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Dialogue writing is time-consuming | High - content bottleneck | Start with 1-2 chapters, use AI to generate variations, focus on key scenes |
| Too many conditional branches explode complexity | Medium | Limit to 2-3 relationship thresholds per scene (e.g., high/medium/low) |
| Voice latency breaks pacing | Medium | Don't block advance on voice; show "playing" indicator; cache voice clips |
| 3D model loading slows down | Low | Lazy-load models; use simple placeholders first |
| Camera cuts feel jarring | Medium | Use longer lerp durations; keep cuts on line breaks (natural pauses) |

---

## Next Immediate Actions

1. **Create DialogueLine type** in store.ts
2. **Rewrite NarrativeDisplay** to handle dialogue array
3. **Convert 1 scene** (prologue_start) to dialogue format as proof-of-concept
4. **Add mood variants** to CharacterPortrait (use CSS filters to generate quickly)
5. **Test**: Speaker → portrait → animation → camera → typewriter → choices flow

---

**Ready to build?** Start with Phase 1 - the dialogue system is the foundation everything else builds on.
