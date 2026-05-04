import { create } from "zustand";

export type TeamState = {
  teamId: string | null;
  setTeamId: (id: string | null) => void;
};

export const useTeamStore = create<TeamState>((set) => ({
  teamId: null,
  setTeamId: (id) => set({ teamId: id }),
  clearTeamId: () => set({ teamId: null }),
}));
