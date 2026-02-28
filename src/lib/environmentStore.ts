import { create } from 'zustand';

export type EnvironmentType = 'cabin' | 'woods' | 'mines' | 'lodge';

interface EnvironmentState {
  currentEnvironment: EnvironmentType;
  setEnvironment: (env: EnvironmentType) => void;
}

export const useEnvironmentStore = create<EnvironmentState>((set) => ({
  currentEnvironment: 'cabin',
  setEnvironment: (env) => set({ currentEnvironment: env }),
}));
