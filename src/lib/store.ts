import { create } from 'zustand';
import { EnvironmentType } from './environmentStore';

export type GamePhase = 'intro' | 'exploration' | 'dialogue' | 'choice' | 'scene' | 'ending';

export interface Choice {
  id: string;
  text: string;
  nextScene: string;
  consequence?: string;
  fearDelta?: number;
}

export interface Scene {
  id: string;
  title: string;
  description: string;
  narratorText?: string;
  speaker?: string;
  choices?: Choice[];
  cameraPosition?: [number, number, number];
  environment?: 'cabin' | 'woods' | 'mines' | 'lodge';
}

export type AnimationType = 'idle' | 'walk';

export interface CharacterPosition {
  x: number;
  y: number;
  z: number;
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
  wendigoActive: boolean;
  jumpScareActive: boolean;

  // Actions
  setPhase: (phase: GamePhase) => void;
  setCurrentScene: (sceneId: string) => void;
  makeChoice: (choiceId: string) => void;
  updateCharacterState: (char: string, state: 'alive' | 'dead' | 'unknown') => void;
  setCharacterPosition: (char: string, position: CharacterPosition) => void;
  setCharacterAnimation: (char: string, animation: AnimationType) => void;
  addClue: (clue: string) => void;
  incrementFear: (amount: number) => void;
  addConsequence: (consequence: string) => void;
  clearActiveConsequence: () => void;
  setCurrentEnvironment: (env: EnvironmentType) => void;
  voiceEnabled: boolean;
  activateWendigo: () => void;
  triggerJumpScare: () => void;
  clearJumpScare: () => void;
  toggleVoice: () => void;
  resetGame: () => void;
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
  } as Record<string, 'alive' | 'dead' | 'unknown'>,
  characterPositions: {
    sam: { x: -3, y: 0, z: 5 },
    mike: { x: 3, y: 0, z: 5 },
    jessica: { x: -5, y: 0, z: 3 },
    ashley: { x: 5, y: 0, z: 3 },
    chris: { x: -2, y: 0, z: 7 },
    josh: { x: 2, y: 0, z: 7 },
    emily: { x: -4, y: 0, z: 4 },
    matt: { x: 4, y: 0, z: 4 },
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
  } as Record<string, AnimationType>,
  clues: [],
  fearLevel: 0,
  consequences: [],
  activeConsequence: null,
  wendigoActive: false,
  jumpScareActive: false,
  voiceEnabled: false,
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,
  
  setPhase: (phase) => set({ phase }),
  
  setCurrentScene: (sceneId) => set({ currentScene: sceneId }),
  
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
  
  addClue: (clue) => set((state) => ({
    clues: [...state.clues, clue],
  })),
  
  incrementFear: (amount) => set((state) => ({
    fearLevel: Math.min(100, Math.max(0, state.fearLevel + amount)),
  })),
  
  addConsequence: (consequence) => set((state) => ({
    consequences: [...state.consequences, consequence],
    activeConsequence: consequence,
  })),
  
  clearActiveConsequence: () => set({ activeConsequence: null }),
  
  setCurrentEnvironment: (env) => set({ currentEnvironment: env }),

  activateWendigo: () => set({ wendigoActive: true }),
  triggerJumpScare: () => set({ jumpScareActive: true }),
  clearJumpScare: () => set({ jumpScareActive: false }),
  toggleVoice: () => set((state) => ({ voiceEnabled: !state.voiceEnabled })),

  resetGame: () => set(initialState),
}));
