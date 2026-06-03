export type MovementId = 1 | 2 | 3;

export type StretchStatus =
  | "idle"
  | "countdown"
  | "recording"
  | "between" // between attempt 1 and attempt 2
  | "result" // single movement result (both attempts done)
  | "done"; // all 3 movements complete

export type AttemptNumber = 1 | 2;

export type Attempt = {
  attemptNumber: AttemptNumber;
  vibrationEnabled: boolean;
  smoothnessScore: number;
  avgJerk: number;
  peakJerk: number;
  peakSpeedG: number;
  rangeOfMotion: number;
  durationMs: number;
};

export type MovementResult = {
  movementId: MovementId;
  label: string;
  emoji: string;
  attempt1: Attempt;
  attempt2: Attempt;
  improvement: number; // attempt2.smoothness - attempt1.smoothness
};
