import { useRef, useState } from "react";
import { getTracingResult } from "./tracingEngine";
import { GameStatus, Point, TracingResult } from "./types";

export function useTracingGame(pathSamples: Point[], computeResult: any) {
  const [status, setStatus] = useState<GameStatus>("idle");
  const [countdown, setCountdown] = useState(3);
  const [result, setResult] = useState<TracingResult | null>(null);
  // how far dot has travelled along the path
  // used to animate the dot
  const [dotProgress, setDotProgress] = useState(0);

  const startTimeRef = useRef(0);
  const animationRef = useRef(0);

  const start = () => {
    setStatus("countdown");
    setCountdown(3);
    setResult(null);
    setDotProgress(0);

    let c = 3;
    const interval = setInterval(() => {
      c--;
      if (c <= 0) {
        clearInterval(interval);
        begin();
      } else {
        setCountdown(c);
      }
    }, 1000);
  };

  const begin = () => {
    setStatus("tracing");
    startTimeRef.current = Date.now();
    animate();
  };

  const animate = () => {
    // check how much time passed
    const elapsed = Date.now() - startTimeRef.current;

    // convert time to progress, 6000ms = tracing session - 6s
    const progress = Math.min(elapsed / 6000, 1);

    setDotProgress(progress);

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setStatus("done");
    }
  };

  const finish = (trail: Point[]) => {
    const res = getTracingResult(trail, pathSamples);
    setResult(res);
  };

  // dot position derived from progress + samples
  const dotPoint =
    pathSamples[Math.floor(dotProgress * (pathSamples.length - 1))];

  return {
    status,
    countdown,
    result,
    dotPoint,
    dotProgress,
    start,
    finish,
    setStatus,
  };
}
