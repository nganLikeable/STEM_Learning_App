import { create } from 'zustand';

type AppState = {
  introSeen: boolean;
  markIntroSeen: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  introSeen: false,
  markIntroSeen: () => set({ introSeen: true }),
}));
