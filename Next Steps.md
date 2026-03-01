# Frost: Implementation Roadmap

## Core Philosophy
- **Phase 1-4**: Static, hand-crafted story (Until Dawn style) - GUARANTEED quality
- **Phase 5**: AI enhancement (optional, if time permits)
- **Priority**: Character rotation, butterfly effects, 3D models

---

## Quick Wins (Do First)
- [ ] Add `activeCharacter` to store - IMMEDIATE visual feedback
- [ ] Display current character name in UI
- [ ] Character-specific camera angles (already in scene data)
- [ ] Show character model in 3D scene (use simple placeholder first)

---

## Phase 1: Store & Data Foundation
**Estimated**: 4-6 hours

### Files to Modify:
- `src/lib/store.ts`
- `src/data/story.ts`

### Changes:
- [ ] Add `activeCharacter: string` to GameState
- [ ] Add `characterStates` with traits/relationships per character
- [ ] Add `butterflyEffects: Record<string, string>`
- [ ] Add `totemsFound: string[]`
- [ ] Add `therapyChoices: any[]`
- [ ] Define initial trait baselines for all 8 characters
- [ ] Add `playableCharacter`, `butterflySegment`, `cameraPosition` to Scene interface
- [ ] Backfill all existing scenes with these fields

---

## Phase 2: Butterfly & Totem Systems
**Estimated**: 6-8 hours

### Files:
- `src/lib/store.ts` (new methods)
- `src/data/story.ts` (conditional branches)
- `src/components/ui/NarrativeDisplay.tsx` (Status Updates)
- `src/components/ui/ChoiceSystem.tsx` (consequence tracking)

### Changes:
- [ ] `setButterfly(segmentId, choiceId)` method
- [ ] `getButterfly(segmentId)` selector
- [ ] `addTotem(totemId)` method
- [ ] Create 10 totem definitions with prewritten visions
- [ ] Add totem discovery triggers in story scenes
- [ ] Display "Status Update" toast when traits/relationships change
- [ ] Add conditional scene branches (e.g., if butterfly_1 == 'A' then scene_x else scene_y)

---

## Phase 3: 3D Human Characters
**Estimated**: 6-8 hours

### Approach: Mixamo Rigged Models
**Quality/Time**: ⭐⭐⭐⭐⭐ (Best balance)

### Steps:
1. [ ] Download free base human mesh (e.g., "Base Male/Female" from BlendSwap)
2. [ ] Upload to Mixamo → auto-rig
3. [ ] Download animations: `idle`, `walk`, `fear`, `shock`, `die`
4. [ ] Convert to .glb
5. [ ] Create 8 character variants by:
   - Changing mesh colors (clothing, hair)
   - Scaling adjustments (height differences)
   - Accessory objects (glasses, hat, etc.)
6. [ ] Add `/public/models/` folder with 8 .glb files
7. [ ] Create `CharacterModel.tsx` component:
   ```typescript
   import { useGLTF, useAnimations } from '@react-three/drei';
   function Character({ character, position, animation }) { ... }
   ```
8. [ ] Update `GameScene.tsx` to render active character model
9. [ ] Set camera positions based on `activeCharacter` per scene

### Fallback if too complex:
Use simple capsule characters (2 hrs) → replace later

---

## Phase 4: Gameplay Mechanics
**Estimated**: 6-8 hours

### Changes:
- [ ] **Don't Move QTE**: Overlay with countdown bar, requires stillness (mouse unmoved)
- [ ] **Therapy Sessions**: Add 4 interlude scenes (static narrative, choices affect relationships)
- [ ] **Ending Calculator**: Determine ending based on:
  - `survivorCount` (alive characters)
  - `therapyOutcome` (despair/repentance)
  - Key butterfly choices
- [ ] Wire voice hooks: `useVoiceInput` for "Don't Move" (voice stillness detection?), `useElevenLabs` for character dialogue
- [ ] Add fear level meter (increases during chase scenes)

---

## Phase 5: AI Integration (Optional)
**Estimated**: 4-6 hours

Only if time permits after Phases 1-4 are complete and working.

### Changes:
- [ ] Rewrite `useMistralAI` prompt to include character state context
- [ ] Add `generateScene()` function that calls Mistral instead of static story.ts
- [ ] Hybrid system: 70% static plot points + 30% AI-generated dialogue
- [ ] AI-generated totem visions unique per playthrough
- [ ] Fallback to static if API fails

---

## Testing Checklist
- [ ] All 8 characters can be active and display correctly
- [ ] Traits/relationships update when choices made
- [ ] Butterfly choices from Ch1 affect Ch5 outcome
- [ ] Totems appear in correct scenes and show visions
- [ ] Don't Move mechanic triggers and fails/succeeds properly
- [ ] Therapy sessions appear between chapters
- [ ] Endings vary based on survival count
- [ ] 3D models load without errors (lazy loading ok)
- [ ] Voice input works (if wired)
- [ ] Mistral fallback works (if integrated)

---

## Tradeoffs & Risks

| Risk | Mitigation |
|------|------------|
| 3D models too time-consuming | Start with simple placeholders, upgrade later |
| Butterfly branching explodes complexity | Limit to 8-10 key segments, document dependencies |
| Mistral latency breaks immersion | Use loading spinners, pre-fetch next scene |
| Store becomes too complex | Keep trait/relationship updates simple (single choice = +10/-10) |

---

## Success Metrics

By end of Phase 4, you should have:
- ✅ Playable demo with at least 2 complete chapters
- ✅ 3 character perspectives (Sam, Mike, Jessica) with distinct scenes
- ✅ At least 3 butterfly effects with visible cascading consequences
- ✅ 3D character models visible and animated
- ✅ 5 totems discoverable with visions
- ✅ One complete playthrough takes ~15 minutes
- ✅ At least 2 distinct endings (some survivors vs all dead)

---

## Next Immediate Actions

1. **README**: Update project README with these new systems
2. **Component Architecture**:
   - `CharacterModel.tsx` - 3D human rendering
   - `StatusUpdateToast.tsx` - Trait/relationship notifications
   - `TotemVision.tsx` - Premonition overlay
   - `TherapySession.tsx` - Dr. Hill interlude
3. **Data Migration**: Expand `story.ts` to 100+ scenes with proper branching

---

**Ready to begin implementation?** Start with Phase 1 (store/data) and get a minimal character rotation working end-to-end before tackling 3D models.
