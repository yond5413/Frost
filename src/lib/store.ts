import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { EnvironmentType } from './environmentStore';

export type GamePhase = 'intro' | 'exploration' | 'dialogue' | 'choice' | 'scene' | 'ending';

export interface InventoryItem {
  id: string;
  name: string;
  type: 'key' | 'note' | 'tool';
  description: string;
}

export interface Choice {
  id: string;
  text: string;
  nextScene: string;
  consequence?: string;
  fearDelta?: number;
  triggerQTE?: boolean;
}

export interface Scene {
  id: string;
  title: string;
  description: string;
  dialogue: DialogueLine[];
  choices?: Choice[];  // Legacy/fallback, or can be used with choicesAt
  choicesAt?: number;  // Index in dialogue array where choices appear
  cameraPosition?: [number, number, number];
  cameraTarget?: [number, number, number]; // Point camera looks at
  cameraControls?: boolean; // Allow user to override camera with arrow keys
  interactables?: Array<{
    id: string;
    position: [number, number, number];
    label: string;
    targetScene: string;
  }>;
  environment?: 'cabin' | 'woods' | 'mines' | 'lodge';
  activeCharacter?: string;
   aiDriven?: boolean; // NEW: AI generates outcome for this scene
   fearReset?: boolean; // NEW: Reset fear level to 0 at the start of this scene
   isEnding?: boolean; // NEW: Mark this scene as an ending
   // Legacy support while migrating
   narratorText?: string;
   speaker?: string;
}

export type AnimationType = 'idle' | 'walk' | 'talking' | 'gesture_angry' | 'gesture_happy' | 'gesture_sad' | 'gesture_scared' | 'shock' | 'fear';

export type CameraShot = 'speaker' | 'wide' | 'medium' | 'closeup' | 'over_shoulder' | 'pov' | 'tracking' | 'panic' | 'freeze' | 'flicker';

export interface DialogueLine {
  speaker: string;  // character ID or 'narrator'
  text: string;
  mood?: 'neutral' | 'happy' | 'angry' | 'sad' | 'scared' | 'nervous' | 'determined' | 'serious' | 'warning' | 'somber' | 'hopeful';
  animation?: AnimationType;
  camera?: CameraShot;
  duration?: number;  // Optional: ms to display (default auto-calc)
  fearDelta?: number;  // Optional: fear increase during this line
}

export interface CharacterPosition {
  x: number;
  y: number;
  z: number;
}

export type NarratorPersonality = 'balanced' | 'brutal' | 'merciful' | 'chaotic';

export interface BehavioralProfile {
  recklessness: number;
  loyalty: number;
  deception: number;
  survivalFocus: number;
}

export interface StoryMemoryEntry {
  choiceId: string;
  sceneId: string;
  consequence: string;
  behavioralDeltas?: Partial<BehavioralProfile>;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type RuntimeDecisionMode = 'deterministic' | 'ai';

export interface RuntimeTelemetry {
  aiDecisions: number;
  deterministicTransitions: number;
  aiFallbacks: number;
  aiTimeouts: number;
  lastDecisionMode: RuntimeDecisionMode;
  lastDecisionReason: string;
}

interface GameState {
  phase: GamePhase;
  currentScene: string;
  currentEnvironment: EnvironmentType;
  playerChoices: string[];
  characterStates: Record<string, 'alive' | 'dead' | 'unknown'>;
  characterPositions: Record<string, CharacterPosition>;
  characterAnimations: Record<string, AnimationType>;
  clues: string[];
  fearLevel: number;
  consequences: string[];
  activeConsequence: string | null;
  butterflyEffects: Record<string, string>;
  characterTraits: Record<string, Record<string, number>>;
  relationships: Record<string, Record<string, number>>;
  activeCharacter: string;
  wendigoActive: boolean;
  jumpScareActive: boolean;
  currentSpeaker: string;
  currentCameraShot: CameraShot;
  // AI narrative engine
  conversationHistory: ConversationMessage[];
  storyMemory: StoryMemoryEntry[];
  aiServiceStatus: 'healthy' | 'degraded' | 'offline';
  runtimeTelemetry: RuntimeTelemetry;
  isDirectorOverlayOpen: boolean;
  // Inventory
  inventory: InventoryItem[];
  // Narrator personality
  narratorPersonality: NarratorPersonality;
  // Behavioral profile (4-axis, 0-100)
  behavioralProfile: BehavioralProfile;
  // Pause state (not persisted)
  isPaused: boolean;
  demoSeedMode: boolean;
  voiceEnabled: boolean;

  // Actions
  setPhase: (phase: GamePhase) => void;
  setCurrentScene: (sceneId: string) => void;
  setActiveCharacter: (character: string) => void;
  makeChoice: (choiceId: string) => void;
  updateCharacterState: (char: string, state: 'alive' | 'dead' | 'unknown') => void;
  setCharacterPosition: (char: string, position: CharacterPosition) => void;
  setCharacterAnimation: (char: string, animation: AnimationType) => void;
  setButterflyEffect: (id: string, result: string) => void;
  updateTrait: (char: string, trait: string, delta: number) => void;
  updateRelationship: (char1: string, char2: string, delta: number) => void;
  addClue: (clue: string) => void;
  incrementFear: (amount: number) => void;
  setFearLevel: (level: number) => void;
  addConsequence: (consequence: string) => void;
  clearActiveConsequence: () => void;
  setCurrentEnvironment: (env: EnvironmentType) => void;
  activateWendigo: () => void;
  triggerJumpScare: () => void;
  clearJumpScare: () => void;
  setCurrentSpeaker: (speaker: string) => void;
  setCurrentCameraShot: (shot: CameraShot) => void;

  qteActive: boolean;
  _qteCallbacks: { pass: (() => void) | null, fail: (() => void) | null };
  triggerQTE: (onPass: () => void, onFail: () => void) => void;
  passQTE: () => void;
  failQTE: () => void;

  applyAIChanges: (aiResponse: {
    characterDeath?: string;
    butterflyEffect?: { id: string; choice: string };
    relationshipChanges?: Array<{ character1: string; character2: string; delta: number }>;
  }) => void;
  getRelationship: (char1: string, char2: string) => number;
  getButterflyChoice: (segmentId: string) => string | undefined;

  resetGame: () => void;

  // AI state management
  addToConversationHistory: (role: 'user' | 'assistant', content: string) => void;
  addStoryMemory: (entry: StoryMemoryEntry) => void;
  setAiServiceStatus: (status: 'healthy' | 'degraded' | 'offline') => void;
  recordRuntimeDecision: (mode: RuntimeDecisionMode, reason: string) => void;
  recordAiFallback: (reason: string, isTimeout?: boolean) => void;
  toggleDirectorOverlay: () => void;

  // Inventory
  addItem: (item: InventoryItem) => void;
  removeItem: (id: string) => void;
  useItem: (id: string) => void;
  // Narrator personality
  setNarratorPersonality: (p: NarratorPersonality) => void;
  // Behavioral profile
  updateBehavioralProfile: (deltas: Partial<BehavioralProfile>) => void;
  // Pause
  togglePause: () => void;
  setDemoSeedMode: (enabled: boolean) => void;
  setVoiceEnabled: (enabled: boolean) => void;
}

const initialState = {
  phase: 'intro' as GamePhase,
  currentScene: 'prologue_start',
  currentEnvironment: 'cabin' as EnvironmentType,
  playerChoices: [],
  characterStates: {
    sam: 'alive',
    mike: 'alive',
    jessica: 'alive',
    ashley: 'alive',
    chris: 'alive',
    josh: 'alive',
    emily: 'alive',
    matt: 'alive',
    hannah: 'alive',
    beth: 'alive',
  } as Record<string, 'alive' | 'dead' | 'unknown'>,
  characterPositions: {
    sam: { x: -2, y: 0, z: 2 },
    mike: { x: 2, y: 0, z: 2 },
    jessica: { x: 3, y: 0, z: 1 },
    emily: { x: -3, y: 0, z: 1 },
    ashley: { x: 1, y: 0, z: 3 },
    chris: { x: -1, y: 0, z: 3 },
    josh: { x: 0, y: 0, z: 3 },
    matt: { x: 2, y: 0, z: 0 },
    hannah: { x: -2, y: 0, z: 0 },
    beth: { x: 0, y: 0, z: 2 },
  } as Record<string, CharacterPosition>,
  characterAnimations: {
    sam: 'idle',
    mike: 'idle',
    jessica: 'idle',
    ashley: 'idle',
    chris: 'idle',
    josh: 'idle',
    emily: 'idle',
    matt: 'idle',
    hannah: 'idle',
    beth: 'idle',
  } as Record<string, AnimationType>,
  clues: [],
  fearLevel: 0,
  consequences: [],
  activeConsequence: null,
  butterflyEffects: {},
  characterTraits: {
    sam: { bravery: 50, honesty: 50, curious: 50 },
    mike: { bravery: 50, honesty: 50, curious: 50 },
    jessica: { bravery: 50, honesty: 50, curious: 50 },
    ashley: { bravery: 50, honesty: 50, curious: 50 },
    chris: { bravery: 50, honesty: 50, curious: 50 },
    josh: { bravery: 50, honesty: 50, curious: 50 },
    emily: { bravery: 50, honesty: 50, curious: 50 },
    matt: { bravery: 50, honesty: 50, curious: 50 },
  },
  relationships: {
    sam_mike: { value: 60 },
    sam_jessica: { value: 55 },
    mike_jessica: { value: 70 },
    chris_ashley: { value: 75 },
    josh_sam: { value: 65 },
    emily_matt: { value: 65 },
  },
   activeCharacter: 'sam',
   wendigoActive: false,
   jumpScareActive: false,
   qteActive: false,
  currentSpeaker: 'narrator',
  currentCameraShot: 'wide' as CameraShot,
  conversationHistory: [],
  storyMemory: [],
  aiServiceStatus: 'healthy' as const,
  runtimeTelemetry: {
    aiDecisions: 0,
    deterministicTransitions: 0,
    aiFallbacks: 0,
    aiTimeouts: 0,
    lastDecisionMode: 'deterministic' as RuntimeDecisionMode,
    lastDecisionReason: 'game_start',
  } as RuntimeTelemetry,
  isDirectorOverlayOpen: false,
  inventory: [],
  narratorPersonality: 'balanced' as NarratorPersonality,
  behavioralProfile: {
    recklessness: 50,
    loyalty: 50,
    deception: 50,
    survivalFocus: 50,
  } as BehavioralProfile,
  isPaused: false,
  demoSeedMode: false,
  voiceEnabled: true,
};

export const useGameStore = create<GameState>()(persist((set, get) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),

  setCurrentScene: (sceneId) => set({ currentScene: sceneId }),

  setActiveCharacter: (character) => set({ activeCharacter: character }),

  makeChoice: (choiceId) => set((state) => ({
    playerChoices: [...state.playerChoices, choiceId],
  })),

  updateCharacterState: (char, charState) => set((state) => ({
    characterStates: { ...state.characterStates, [char]: charState },
  })),

  setCharacterPosition: (char, position) => set((state) => ({
    characterPositions: { ...state.characterPositions, [char]: position },
  })),

  setCharacterAnimation: (char, animation) => set((state) => ({
    characterAnimations: { ...state.characterAnimations, [char]: animation },
  })),

  setButterflyEffect: (id, result) => set((state) => ({
    butterflyEffects: { ...state.butterflyEffects, [id]: result }
  })),

  updateTrait: (char, trait, delta) => set((state) => ({
    characterTraits: {
      ...state.characterTraits,
      [char]: {
        ...state.characterTraits[char],
        [trait]: Math.min(100, Math.max(0, (state.characterTraits[char]?.[trait] || 50) + delta))
      }
    }
  })),

  updateRelationship: (char1, char2, delta) => set((state) => {
    const key = [char1, char2].sort().join('_');
    return {
      relationships: {
        ...state.relationships,
        [key]: {
          ...state.relationships[key],
          value: Math.min(100, Math.max(0, ((state.relationships[key] as { value: number } | undefined)?.value ?? 50) + delta))
        }
      }
    };
  }),

  addClue: (clue) => set((state) => ({
    clues: [...state.clues, clue],
  })),

  incrementFear: (amount) => set((state) => ({
    fearLevel: Math.min(100, Math.max(0, state.fearLevel + amount)),
  })),

  setFearLevel: (level) => set({ fearLevel: level }),

  addConsequence: (consequence) => set((state) => ({
    consequences: [...state.consequences, consequence],
    activeConsequence: consequence,
  })),

  clearActiveConsequence: () => set({ activeConsequence: null }),

  setCurrentEnvironment: (env) => set({ currentEnvironment: env }),

  activateWendigo: () => set({ wendigoActive: true }),
  triggerJumpScare: () => set({ jumpScareActive: true }),
  clearJumpScare: () => set({ jumpScareActive: false }),
  setCurrentSpeaker: (speaker) => set({ currentSpeaker: speaker }),
  setCurrentCameraShot: (shot) => set({ currentCameraShot: shot }),

  qteActive: false,
  _qteCallbacks: { pass: null as (() => void) | null, fail: null as (() => void) | null },

  triggerQTE: (onPass, onFail) => set({
    qteActive: true,
    _qteCallbacks: { pass: onPass, fail: onFail }
  }),

  passQTE: () => {
    const { _qteCallbacks } = get() as GameState;
    set({ qteActive: false });
    if (_qteCallbacks?.pass) _qteCallbacks.pass();
  },

  failQTE: () => {
    const { _qteCallbacks } = get() as GameState;
    set({ qteActive: false });
    if (_qteCallbacks?.fail) _qteCallbacks.fail();
  },

  applyAIChanges: (aiResponse: {
    characterDeath?: string;
    butterflyEffect?: { id: string; choice: string };
    relationshipChanges?: Array<{ character1: string; character2: string; delta: number }>;
  }) => {
    const state = get();

    // Handle character death
    if (aiResponse.characterDeath) {
      state.updateCharacterState(aiResponse.characterDeath, 'dead');
      state.addConsequence(`death_${aiResponse.characterDeath}`);
    }

    // Handle butterfly effect
    if (aiResponse.butterflyEffect) {
      state.setButterflyEffect(aiResponse.butterflyEffect.id, aiResponse.butterflyEffect.choice);
      state.addConsequence(`butterfly_${aiResponse.butterflyEffect.id}`);
    }

    // Handle relationship changes
    if (aiResponse.relationshipChanges) {
      aiResponse.relationshipChanges.forEach(change => {
        state.updateRelationship(change.character1, change.character2, change.delta);
      });
    }
  },

  getRelationship: (char1: string, char2: string): number => {
    const state = get();
    const key = [char1, char2].sort().join('_');
    return (state.relationships[key] as { value: number } | undefined)?.value ?? 50;
  },

  getButterflyChoice: (segmentId: string): string | undefined => {
    const state = get();
    return state.butterflyEffects[segmentId];
  },

  resetGame: () => set(initialState),

  addToConversationHistory: (role, content) => set((state) => ({
    conversationHistory: [
      ...state.conversationHistory.slice(-9),
      { role, content },
    ],
  })),

  addStoryMemory: (entry) => set((state) => ({
    storyMemory: [...state.storyMemory, entry],
  })),

  setAiServiceStatus: (status) => set({ aiServiceStatus: status }),

  recordRuntimeDecision: (mode, reason) => set((state) => ({
    runtimeTelemetry: {
      ...state.runtimeTelemetry,
      aiDecisions: state.runtimeTelemetry.aiDecisions + (mode === 'ai' ? 1 : 0),
      deterministicTransitions: state.runtimeTelemetry.deterministicTransitions + (mode === 'deterministic' ? 1 : 0),
      lastDecisionMode: mode,
      lastDecisionReason: reason,
    },
  })),

  recordAiFallback: (reason, isTimeout = false) => set((state) => ({
    runtimeTelemetry: {
      ...state.runtimeTelemetry,
      aiFallbacks: state.runtimeTelemetry.aiFallbacks + 1,
      aiTimeouts: state.runtimeTelemetry.aiTimeouts + (isTimeout ? 1 : 0),
      lastDecisionMode: 'ai',
      lastDecisionReason: reason,
    },
  })),

  toggleDirectorOverlay: () => set((state) => ({ isDirectorOverlayOpen: !state.isDirectorOverlayOpen })),

  addItem: (item) => set((state) => ({
    inventory: [...state.inventory, item],
  })),

  removeItem: (id) => set((state) => ({
    inventory: state.inventory.filter((i) => i.id !== id),
  })),

  useItem: (id) => set((state) => ({
    inventory: state.inventory.filter((i) => i.id !== id),
  })),

  setNarratorPersonality: (p) => set({ narratorPersonality: p }),

  updateBehavioralProfile: (deltas) => set((state) => ({
    behavioralProfile: {
      recklessness: Math.min(100, Math.max(0, state.behavioralProfile.recklessness + (deltas.recklessness ?? 0))),
      loyalty: Math.min(100, Math.max(0, state.behavioralProfile.loyalty + (deltas.loyalty ?? 0))),
      deception: Math.min(100, Math.max(0, state.behavioralProfile.deception + (deltas.deception ?? 0))),
      survivalFocus: Math.min(100, Math.max(0, state.behavioralProfile.survivalFocus + (deltas.survivalFocus ?? 0))),
    },
  })),

  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  setDemoSeedMode: (enabled) => set({ demoSeedMode: enabled }),
  setVoiceEnabled: (enabled) => set({ voiceEnabled: enabled }),
}), {
  name: 'frost-game-state',
   partialize: (state) => ({
     fearLevel: state.fearLevel,
     characterStates: state.characterStates,
     inventory: state.inventory,
     storyMemory: state.storyMemory,
     currentScene: state.currentScene,
     playerChoices: state.playerChoices,
     butterflyEffects: state.butterflyEffects,
     relationships: state.relationships,
     narratorPersonality: state.narratorPersonality,
     behavioralProfile: state.behavioralProfile,
     runtimeTelemetry: state.runtimeTelemetry,
     demoSeedMode: state.demoSeedMode,
     voiceEnabled: state.voiceEnabled,
   }),
}));
