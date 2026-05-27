// types.ts
export type DesignResult = {
  designNumber: 1 | 2 | 3;
  label: string;
  peakRotationRateDeg: number;
  totalRotationDeg: number;
  maxAcceleration: number;
  stabilityScore: number;
};

export type TestStatus =
  | "idle"
  | "countdown"
  | "calibrating" // first 0.5s — baseline subtraction
  | "testing"
  | "done";
