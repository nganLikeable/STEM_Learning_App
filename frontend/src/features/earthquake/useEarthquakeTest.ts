// useEarthquakeTest.ts
import { useRef, useState } from "react";
import { DesignResult, TestStatus } from "./types";
import useAccelerometer from "./useAccelerometer";
import useGyroscope from "./useGyroscope";
import useVibrationPattern from "./useVibrationPattern";

const TEST_DURATION_MS = 5000;
const COUNTDOWN_FROM = 3;
// Calibration: expected worst-case total rotation (no structure, on table)
const MAX_EXPECTED_DEG = 45;

function computeStability(totalRotationDeg: number, maxAccel: number): number {
  // Weight rotation 70%, acceleration 30%
  const rotationScore = Math.max(0, 1 - totalRotationDeg / MAX_EXPECTED_DEG);
  const accelScore = Math.max(0, 1 - maxAccel / 2); // 2G = worst case
  return Math.round((rotationScore * 0.7 + accelScore * 0.3) * 100);
}

export default function useEarthquakeTest() {
  const [status, setStatus] = useState<TestStatus>("idle");
  const [countdown, setCountdown] = useState(COUNTDOWN_FROM);
  const [progress, setProgress] = useState(0); // 0–1 during test
  const [results, setResults] = useState<DesignResult[]>([]);
  const [currentDesign, setCurrentDesign] = useState(1);
  const [designLabel, setDesignLabel] = useState("");

  const gyroscope = useGyroscope();
  const accelerometer = useAccelerometer();
  const vibration = useVibrationPattern();

  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // ── Countdown ─────────────────────────────────────────────────────────────

  const beginCountdown = (label: string) => {
    setDesignLabel(label);
    setStatus("countdown");
    setCountdown(COUNTDOWN_FROM);
    setProgress(0);

    let c = COUNTDOWN_FROM;
    const tick = setInterval(() => {
      c--;
      if (c <= 0) {
        clearInterval(tick);
        beginCalibration();
      } else {
        setCountdown(c);
      }
    }, 1000);
  };

  // ── Calibration (0.5s baseline) ───────────────────────────────────────────

  const beginCalibration = () => {
    setStatus("calibrating");
    gyroscope.start();
    accelerometer.start();

    // Wait for baseline samples to accumulate (BASELINE_SAMPLES × 50ms = 0.5s)
    setTimeout(() => {
      beginTest();
    }, 600);
  };

  // ── Active test ───────────────────────────────────────────────────────────

  const beginTest = () => {
    setStatus("testing");
    startTimeRef.current = Date.now();

    // Start vibration pattern (non-blocking)
    vibration.start(TEST_DURATION_MS);

    // Animate progress bar
    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const p = Math.min(elapsed / TEST_DURATION_MS, 1);
      setProgress(p);

      if (p < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        finishTest();
      }
    };
    animFrameRef.current = requestAnimationFrame(tick);
  };

  const finishTest = () => {
    gyroscope.stop();
    accelerometer.stop();
    vibration.stop();
    cancelAnimationFrame(animFrameRef.current);

    const { totalRotationDeg, maxRotationDeg } = gyroscope.getResult();
    const { maxAcceleration } = accelerometer.getResult();

    const result: DesignResult = {
      designNumber: currentDesign as 1 | 2 | 3,
      label: designLabel,
      totalRotationDeg,
      maxRotationDeg,
      maxAcceleration,
      stabilityScore: computeStability(totalRotationDeg, maxAcceleration),
    };

    setResults((prev) => [...prev, result]);
    setStatus("done");
  };

  // ── Navigation ────────────────────────────────────────────────────────────

  const nextDesign = () => {
    gyroscope.reset();
    accelerometer.reset();
    setCurrentDesign((d) => d + 1);
    setStatus("idle");
    setProgress(0);
  };

  const reset = () => {
    gyroscope.reset();
    accelerometer.reset();
    vibration.stop();
    cancelAnimationFrame(animFrameRef.current);
    setStatus("idle");
    setCountdown(COUNTDOWN_FROM);
    setProgress(0);
    setResults([]);
    setCurrentDesign(1);
    setDesignLabel("");
  };

  return {
    // state
    status,
    countdown,
    progress,
    results,
    currentDesign,
    totalDesigns: 3,
    isLastDesign: currentDesign === 3,
    // live sensor readings for UI
    liveRotation: gyroscope.liveRotation,
    liveAccel: accelerometer.liveAccel,
    // actions
    beginCountdown,
    nextDesign,
    reset,
  };
}
