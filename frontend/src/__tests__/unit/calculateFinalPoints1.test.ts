import { calculateFinalPoints1 } from "../../services/activity";
import type { SessionDoc } from "../../services/session";

function makeSession(
  overrides: Partial<SessionDoc> = {},
): SessionDoc {
  return {
    id: "test-session",
    teamId: "team-1",
    activityNo: 1,
    prediction: null,
    currentPhase: 3,
    completed: true,
    activitiesCompleted: [],
    ...overrides,
  };
}

describe("calculateFinalPoints1", () => {
  // --- raw score accumulation ---

  it("returns 0 when no activities completed", () => {
    const session = makeSession({ activitiesCompleted: [] });
    expect(calculateFinalPoints1(session)).toBe(0);
  });

  it("sums scores from all completed activities", () => {
    const session = makeSession({
      activitiesCompleted: [
        { activityId: "a", score: 40 },
        { activityId: "b", score: 60 },
        { activityId: "c", score: 80 },
      ],
    });
    expect(calculateFinalPoints1(session)).toBe(180);
  });

  // --- prediction bonus ---

  it("adds bonus (100) when prediction matches bestDesign", () => {
    const session = makeSession({
      activitiesCompleted: [{ activityId: "a", score: 50 }],
      prediction: 2,
      bestDesign: 2,
    });
    expect(calculateFinalPoints1(session)).toBe(150); // 50 + 100 bonus
  });

  it("does NOT add bonus when prediction differs from bestDesign", () => {
    const session = makeSession({
      activitiesCompleted: [{ activityId: "a", score: 50 }],
      prediction: 1,
      bestDesign: 2,
    });
    expect(calculateFinalPoints1(session)).toBe(50);
  });

  it("does NOT add bonus when prediction is null", () => {
    const session = makeSession({
      activitiesCompleted: [{ activityId: "a", score: 50 }],
      prediction: null,
      bestDesign: 1,
    });
    expect(calculateFinalPoints1(session)).toBe(50);
  });

  it("does NOT add bonus when bestDesign is undefined", () => {
    const session = makeSession({
      activitiesCompleted: [{ activityId: "a", score: 50 }],
      prediction: 1,
      bestDesign: undefined,
    });
    expect(calculateFinalPoints1(session)).toBe(50);
  });

  // --- custom bonus amount ---

  it("respects a custom bonusAwardAmount", () => {
    const session = makeSession({
      activitiesCompleted: [{ activityId: "a", score: 30 }],
      prediction: 3,
      bestDesign: 3,
    });
    expect(calculateFinalPoints1(session, 200)).toBe(230); // 30 + 200 custom bonus
  });

  // --- edge: activitiesCompleted missing (undefined) ---

  it("handles activitiesCompleted being undefined gracefully", () => {
    const session = makeSession({ activitiesCompleted: undefined as any });
    expect(calculateFinalPoints1(session)).toBe(0);
  });
});
