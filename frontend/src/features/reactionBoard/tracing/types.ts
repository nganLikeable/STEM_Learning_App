// coordinate
export type Point = {
  x: number;
  y: number;
};

export type GameStatus = "idle" | "countdown" | "tracing" | "done";

export type TracingResult = {
  accuracy: number;
  avgOffsetPx: number;
  totalTracingPoints: number;
};
