import { create } from "zustand";
import { MovementId, MovementResult } from "@/src/features/humanPerformance/types";

type ResultMap = Partial<Record<MovementId, MovementResult>>;

type HumanPerformanceState = {
  resultsById: ResultMap;
  upsertResult: (result: MovementResult) => void;
  resetResults: () => void;
};

export const useHumanPerformanceStore = create<HumanPerformanceState>((set) => ({
  resultsById: {},
  upsertResult: (result) =>
    set((state) => ({
      resultsById: {
        ...state.resultsById,
        [result.movementId]: result,
      },
    })),
  resetResults: () => set({ resultsById: {} }),
}));
