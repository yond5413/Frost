# Frost Operational Readiness Roadmap

This document turns a quick exploratory review into a concrete path from “playable prototype” to a production-ready cinematic horror game closer to Until Dawn quality.

## Current State Snapshot

- The app builds successfully for production (`next build`), so the baseline deployment path works.
- Linting currently fails with React rules violations in rendering/effect patterns, which blocks CI-quality enforcement.
- The narrative graph is substantial (49 scenes) and transitions are internally consistent, but content depth and systems fidelity still trail a full cinematic narrative game.
- AI fallback behavior is present, but full operational reliability still needs observability, validation, and deterministic safety rails.

## What Is Needed To Be “Fully Operational”

## 1) Engineering Stability (Must-Have)

1. **Make lint pass cleanly**
   - Fix `react-hooks/refs` in post-processing render usage.
   - Fix `react-hooks/immutability` mutations for environment particle lifetimes.
   - Fix `react-hooks/set-state-in-effect` pattern in butterfly tracker pulse logic.
   - Add lint to CI as a blocking check so regressions cannot merge.

2. **Define a release gate**
   - Required checks before merge: `npm run lint`, `npm run build`, and a smoke test of phase flow.
   - Add a minimal automated test suite for route integrity + state transitions.

3. **Harden AI integration**
   - Add strict runtime schema validation for AI JSON responses (reject malformed payloads safely).
   - Add retry/backoff and timeout metrics around `/api/generate-story`.
   - Log AI mode decisions (`healthy/degraded/offline`) and fallback activation rate.

## 2) Gameplay Completeness (High Priority)

1. **Expand narrative density and chapter parity**
   - Existing story has chapter scaffolding and many scenes, but still needs fuller chapter-by-chapter parity and richer branching outcomes.
   - Add more “lock-in” consequences that persist for multiple chapters (injuries, missing items, social fractures).

2. **Deepen consequence systems**
   - Extend butterfly effects from notifications into hard gameplay state impacts (route locks, ally abandonment, rescue odds).
   - Tie relationships and traits to concrete mechanics (QTE difficulty, dialogue gates, help/refusal outcomes).

3. **Exploration and interaction depth**
   - Increase interactables per environment and connect them to clues/inventory/cinematic reveals.
   - Add environmental puzzles and threat escalation loops (stalk → chase → hide/survive).

## 3) Horror Presentation Fidelity (High Priority)

1. **Cinematic language pass**
   - Build authored camera choreography for high-impact scenes (not only adaptive shot tags).
   - Add transitions, focus pulls, and pacing beats aligned with dialogue intent.

2. **Wendigo encounter variety**
   - Current chapter-dependent behavior concept exists; implement richer encounter templates and readability cues.
   - Add audio + animation synchronization for “don’t move” and chase tension spikes.

3. **Audio production pass**
   - Add layered ambient systems (wind, creaks, distant shrieks, interior tones by room).
   - Create dynamic mix states by fear level, proximity, and narrative stakes.

## 4) Product Readiness (Required for real launch)

1. **Save/load and run analytics**
   - Versioned save schema + migration logic.
   - Session analytics for route picks, deaths, drop-off points, and AI fallback frequency.

2. **Performance + platform hardening**
   - GPU budget profiling for post-processing and particles on low/mid hardware.
   - Asset streaming and LOD policy for environments/characters.

3. **Content operations pipeline**
   - Authoring workflow for scenes/choices/testing without code edits.
   - Validation tooling for dead-ends, unreachable scenes, and impossible survival states.

## Suggested Execution Plan

### Milestone 1 (1–2 weeks): “Stable Prototype”
- Eliminate lint failures and lock CI gates.
- Add route-graph validation tests + state transition smoke tests.
- Add AI JSON schema validation + error telemetry.

### Milestone 2 (2–4 weeks): “Systemic Consequences”
- Upgrade butterfly/relationships/traits to affect mechanics directly.
- Expand chapter content density and branch payoff scenes.
- Add interactable-driven clue and inventory loops.

### Milestone 3 (3–6 weeks): “Cinematic Horror Quality”
- Camera direction pass for key scenes.
- Wendigo encounter pack (stalk, fake-out, chase, don’t-move variants).
- Full adaptive audio mixing and scripted scare punctuation.

### Milestone 4 (2–4 weeks): “Launch-Ready”
- Save migration + analytics dashboard.
- Performance optimization pass across target hardware tiers.
- QA matrix for all endings, deaths, and major branch families.

## Immediate Next Actions (Recommended)

1. Fix lint blockers and re-run lint/build.
2. Add an automated `story graph integrity` test (all `nextScene` targets exist, no accidental dead-ends unless flagged ending).
3. Add schema validation for AI responses in `generate-story` route.
4. Prioritize one chapter as a vertical slice and elevate it to near-Until Dawn quality before broad expansion.
