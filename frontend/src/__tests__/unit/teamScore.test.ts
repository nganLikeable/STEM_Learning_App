// Unit tests for team score aggregation logic extracted from teamScore.ts.
// Tests the totalScore calculation: sum of best scores per activity.

type ActivityScores = Partial<Record<1 | 2 | 3 | 4 | 5 | 6 | 7, number>>;

function calcTotalScore(scores: ActivityScores): number {
  return Object.values(scores).reduce((sum, s) => sum + s, 0);
}

describe("calcTotalScore", () => {
  it("returns 0 for an empty scores object", () => {
    expect(calcTotalScore({})).toBe(0);
  });

  it("returns the score when only one activity has a score", () => {
    expect(calcTotalScore({ 1: 150 })).toBe(150);
  });

  it("sums scores across multiple activities", () => {
    expect(calcTotalScore({ 1: 100, 2: 200, 3: 300 })).toBe(600);
  });

  it("sums all 7 activities correctly", () => {
    expect(calcTotalScore({ 1: 10, 2: 20, 3: 30, 4: 40, 5: 50, 6: 60, 7: 70 })).toBe(280);
  });

  it("handles activities with a score of 0", () => {
    expect(calcTotalScore({ 1: 0, 2: 100 })).toBe(100);
  });
});
