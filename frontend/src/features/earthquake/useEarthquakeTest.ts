// useEarthquakeTest.ts
import { setActivity4 } from "@/src/services/firestore";
import { advanceActiveSession } from "@/src/services/session";
import { useTeamStore } from "@/src/store/team-store";
import { useNavigation } from "expo-router";
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

export default function useEarthquakeTest(designNumber: 1 | 2 | 3) {
  const [status, setStatus] = useState<TestStatus>("idle");
  const [countdown, setCountdown] = useState(COUNTDOWN_FROM);
  const [progress, setProgress] = useState(0); // 0–1 during test
  const [designLabel, setDesignLabel] = useState("");
  const [result, setResult] = useState<DesignResult | null>(null);

  const gyroscope = useGyroscope();
  const accelerometer = useAccelerometer();
  const vibration = useVibrationPattern();

  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // go back to journey comopnent
  const navigation = useNavigation();

  const { teamId } = useTeamStore();

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

  const finishTest = async () => {
    gyroscope.stop();
    accelerometer.stop();
    vibration.stop();
    cancelAnimationFrame(animFrameRef.current);

    const { totalRotationDeg, peakRotationRateDeg } = gyroscope.getResult();
    const { maxAcceleration } = accelerometer.getResult();

    const stabilityScore = computeStability(totalRotationDeg, maxAcceleration);

    const result: DesignResult = {
      designNumber,
      label: designLabel,
      totalRotationDeg,
      peakRotationRateDeg,
      maxAcceleration,
      stabilityScore,
    };

    setResult(result);

    // save to firestore
    try {
      if (!teamId) {
        throw new Error(
          "Missing teamId. Join or create a team before saving Activity 4.",
        );
      }

      await setActivity4(teamId, designNumber, result);
      await advanceActiveSession(teamId, 4);
      console.log("Saved successfully");
    } catch (e) {
      console.error("Failed to save:", e);
    }

    setStatus("done");
  };

  const reset = () => {
    gyroscope.reset();
    accelerometer.reset();
    vibration.stop();
    cancelAnimationFrame(animFrameRef.current);
    setStatus("idle");
    setCountdown(COUNTDOWN_FROM);
    setProgress(0);
    setResult(null);
    setDesignLabel("");
  };

  const backToPath = () => {
    navigation.goBack();
  };

  return {
    // state
    status,
    countdown,
    progress,
    result,
    // live sensor readings for UI
    liveRotation: gyroscope.liveRotation,
    liveAccel: accelerometer.liveAccel,
    // actions
    beginCountdown,
    reset,
    backToPath,
  };
}
