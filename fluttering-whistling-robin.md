# Frost QoL Pass — Plan

## Context
The game is playable but has several broken or unfinished systems:
1. **Ending never triggers properly** — `phase === 'ending'` is defined but never set, so `DeathRecap` is permanently hidden and the "Play Again" choice just silently loops back with stale state.
2. **ElevenLabs voice never plays** — `audioQueue.ts` reads `NEXT_PUBLIC_ELEVENLABS_API_KEY` from the browser, but `.env.local` only has the server-side `ELEVENLABS_API_KEY`. Every call early-exits with `null`.
3. **No loading feedback during AI generation** — `isGeneratingAI` exists but nothing is shown.
4. **No survival ending screen** — `DeathRecap` only covers deaths; everyone surviving has no dedicated screen.

---

## Fix 1 — Ending Flow

### 1a. Add `isEnding` to `Scene` interface
**File:** `src/lib/store.ts` — in the `Scene` interface, add:
```typescript
isEnding?: boolean;
```

### 1b. Mark ending scenes in story data
**File:** `src/data/story.ts` — on both `ending_sacrifice` and `ending_survival`:
- Add `isEnding: true`
- Remove the `choices` array entirely (the end screens handle "Play Again")

### 1c. Trigger `phase('ending')` in `checkEnd`
**File:** `src/components/ui/NarrativeDisplay.tsx`

`checkEnd` appears in **two places** — inside `startTypewriter` (line 92) and inline in `handleSkip` (line 363). In **both**, add this as the first branch before all existing logic:

```typescript
// In checkEnd at line 94 (startTypewriter) and line 363 (handleSkip):
if (idx + 1 >= totalLines) {
  if (sceneRef.current?.isEnding) {   // ADD FIRST
    setPhase('ending');
    return;
  }
  if (aiChosenRouteRef.current) {     // existing logic unchanged
    ...
```

### 1d. Guard Escape key during ending phase
**File:** `src/app/page.tsx` — change the escape handler from:
```typescript
if (e.key === 'Escape' && phase !== 'intro') togglePause();
```
to:
```typescript
if (e.key === 'Escape' && phase !== 'intro' && phase !== 'ending') togglePause();
```

### 1e. `DeathRecap` already works — no changes needed
`resetGame()` sets `phase: 'intro'` via `initialState`, so clicking "Try Again" correctly returns to the intro screen.

---

## Fix 2 — Survival Ending Screen

**New file:** `src/components/ui/SurvivalScreen.tsx`

Mirrors `DeathRecap.tsx` structure. Guards:
```typescript
const deaths = consequences.filter(c => c.startsWith('death_'));
if (phase !== 'ending' || deaths.length > 0) return null;
```

Content:
- Header: "Everyone Survived" / "You lived through the night"
- Survivor names list (from `characterStates` where value === `'alive'`)
- Fear bar (same as DeathRecap — shows how close it was)
- Last 5 `storyMemory` entries ("Choices that led here")
- "Play Again" button → `onClick={resetGame}` (returns to intro automatically)

**File:** `src/app/page.tsx` — import and render `<SurvivalScreen />` next to `<DeathRecap />`.

---

## Fix 3 — ElevenLabs Voice (Server-Side Proxy)

The API key must stay server-side. Solution: add a Next.js API route that proxies to ElevenLabs.

### 3a. Create `/api/tts` route
**New file:** `src/app/api/tts/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { text, voiceId, stability } = await req.json();
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return new NextResponse(null, { status: 503 });

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'xi-api-key': apiKey },
      body: JSON.stringify({ text, voice_settings: { stability, similarity_boost: 0.85 } }),
    }
  );

  if (!res.ok) return new NextResponse(null, { status: res.status });
  const blob = await res.blob();
  return new NextResponse(blob, { headers: { 'Content-Type': 'audio/mpeg' } });
}
```

### 3b. Update `audioQueue.ts` — `fetchAudio` method
**File:** `src/lib/audioQueue.ts` (lines 186-222)

Replace the direct ElevenLabs call with a call to `/api/tts`. Remove the `apiKey` check (the route handles auth):
```typescript
private async fetchAudio(item: QueueItem, signal: AbortSignal): Promise<Blob | null> {
  const key = hashKey(item.text, item.voiceId);
  const cached = await getCached(key);
  if (cached) return cached;

  const stability = (item.fearLevel ?? 0) > 60 ? 0.3 : (item.fearLevel ?? 0) > 30 ? 0.45 : 0.65;
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: item.text, voiceId: item.voiceId, stability }),
      signal,
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    await setCached(key, blob);
    return blob;
  } catch {
    return null;
  }
}
```

### 3c. Add browser SpeechSynthesis fallback in `playNext`
**File:** `src/lib/audioQueue.ts` — in `playNext()`, where `blobUrl` is null (currently silently skips), add:
```typescript
if (!blobUrl) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const utt = new SpeechSynthesisUtterance(item.text);
    utt.rate = (item.fearLevel ?? 0) > 60 ? 1.2 : 1.0;
    utt.onend = () => { this.onLineEnd?.(); this.isPlaying = false; this.playNext(); };
    window.speechSynthesis.speak(utt);
  } else {
    this.onLineEnd?.(); this.isPlaying = false; this.playNext();
  }
  return;
}
```

### 3d. Default voice to ON + persist it
**File:** `src/lib/store.ts`:
- Change `voiceEnabled: false` → `voiceEnabled: true` in `initialState`
- Add `voiceEnabled: state.voiceEnabled` to the `partialize` block

---

## Fix 4 — AI Loading State

**File:** `src/components/ui/NarrativeDisplay.tsx`

In the bottom letterbox render area, before the narrator/character text branches, add a unified loading block that shows when `isGeneratingAI` is true:

```tsx
{isGeneratingAI ? (
  <div className="flex items-center justify-center w-full px-8 gap-3">
    <div className="flex gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-700/60 animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-700/60 animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-700/60 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
    <p className="text-gray-500 text-sm italic font-serif animate-pulse">{loadingLine}</p>
  </div>
) : isNarrator ? (
  /* existing narrator block */
) : (
  /* existing character block */
)}
```

Remove the now-redundant `isGeneratingAI` branches inside the narrator and character sub-blocks.

---

## Fix 5 — Rate Limiting to Protect ElevenLabs Quota

Two layers of protection: a server-side rate limiter on the `/api/tts` route, and a client-side minimum-length guard before even enqueueing.

### 5a. Server-side in-memory rate limiter in `/api/tts/route.ts`

Add a simple sliding window limiter at the top of the file (resets on server restart, enough for dev protection):

```typescript
// Rate limit: max 30 calls per minute per session
const callLog: number[] = [];
const RATE_LIMIT = 30;
const WINDOW_MS = 60_000;

function isRateLimited(): boolean {
  const now = Date.now();
  while (callLog.length && callLog[0] < now - WINDOW_MS) callLog.shift();
  if (callLog.length >= RATE_LIMIT) return true;
  callLog.push(now);
  return false;
}

export async function POST(req: NextRequest) {
  if (isRateLimited()) return new NextResponse(null, { status: 429 });
  // ... rest of route unchanged
```

This exports a named `POST` function (required by Next.js App Router) with rate limiting built in. The `callLog` array is module-level — it persists across requests in the same server process.

### 5b. Minimum text length guard in `audioQueue.ts`

In the `enqueue` method, skip enqueueing if the text is too short to be worth a TTS call (single words, punctuation-only, very short interjections):

```typescript
enqueue(text: string, voiceId: string, fearLevel?: number) {
  if (!text || text.trim().length < 15) return;  // skip very short lines
  // ... rest of enqueue unchanged
```

This prevents burning credits on lines like `"Yes."`, `"Run!"`, `"..."`, or mid-sentence fragments from the typewriter.

### 5c. Narrator-only mode option (optional, can be toggled)
The `enqueue` call in `NarrativeDisplay.tsx` already passes the speaker's `voiceId`. No changes needed — if you want to restrict to narrator only for now, simply skip enqueueing for non-narrator speakers by checking `dialogueLine.speaker !== 'narrator'` before calling `audioQueue.enqueue`. This can be toggled later.

---

## Files Changed

| File | Change |
|---|---|
| `src/lib/store.ts` | Add `isEnding?: boolean` to `Scene`; flip `voiceEnabled` to `true`; add to `partialize` |
| `src/data/story.ts` | `isEnding: true` + remove choices on both ending scenes |
| `src/components/ui/NarrativeDisplay.tsx` | `isEnding` guard in `checkEnd` (×2 locations); unified loading block |
| `src/app/page.tsx` | Escape guard + render `<SurvivalScreen />` |
| `src/app/api/tts/route.ts` | **New** — server-side ElevenLabs proxy |
| `src/lib/audioQueue.ts` | Point `fetchAudio` at `/api/tts`; add browser TTS fallback |
| `src/components/ui/SurvivalScreen.tsx` | **New** — mirrors DeathRecap for zero-death endings |

---

## Verification

1. **Ending flow**: Play to `ending_sacrifice` or `ending_survival`. After last narration line completes (or skip), `phase` becomes `'ending'`. Confirm correct screen appears (DeathRecap if deaths > 0, SurvivalScreen if none). Click button → confirm intro screen shows with state reset.
2. **Voice**: Toggle voice ON (now default). Watch browser Network tab for `POST /api/tts` requests firing after each typed line. Confirm audio plays.
3. **Voice fallback**: Temporarily remove `ELEVENLABS_API_KEY` from `.env.local`. Confirm browser speech synthesis reads lines instead.
4. **Loading state**: Navigate to any `aiDriven: true` scene. Confirm three bouncing dots appear during the AI call window.
