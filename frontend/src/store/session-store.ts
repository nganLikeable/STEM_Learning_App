import { create } from "zustand";

interface SessionStore {
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  sessionId: null,
  setSessionId: (id) => set({ sessionId: id }),
  clearSession: () => set({ sessionId: null }),
}));
