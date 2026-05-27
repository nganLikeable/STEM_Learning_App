import { create } from "zustand";
import { useSessionStore } from "./session-store";

export type TeamState = {
  teamId: string | null;
  setTeamId: (id: string | null) => void;
  clearTeamId: () => void;
};

export const useTeamStore = create<TeamState>((set) => ({
  teamId: null,
  setTeamId: (id) => {
    // Clear any session tied to the previous team when switching teams
    useSessionStore.getState().setSessionId(null);
    set({ teamId: id });
  },
  clearTeamId: () => {
    useSessionStore.getState().setSessionId(null);
    set({ teamId: null });
  },
}));
