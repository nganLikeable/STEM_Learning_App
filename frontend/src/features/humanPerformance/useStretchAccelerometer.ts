import { Accelerometer } from "expo-sensors";
import { useRef, useState } from "react";

const UPDATE_INTERVAL = 50; // 20hz
const EMA_ALPHA = 0.2;
const BASELINE_SAMPLES = 10; // first 0.5s → baseline

// Calibration ceilings
const MAX_JERK = 0.12; // G/frame — tune after real testing
const MAX_SPEED = 1.5; // G
const MAX_ROM = 40.0; // G·s accumulated

type JerkCallback = (jerk: number) => void;

export default function useStretchAccelerometer() {
  const [liveJerk, setLiveJerk] = useState(0);
  const [liveSpeed, setLiveSpeed] = useState(0);

  const subscriptionRef = useRef<ReturnType<
    typeof Accelerometer.addListener
  > | null>(null);
  const prevFilteredRef = useRef(0);
  const baselineSamplesRef = useRef<number[]>([]);
  const baselineRef = useRef(0);
  const isBaselineSetRef = useRef(false);

  const allJerksRef = useRef<number[]>([]);
  const peakJerkRef = useRef(0);
  const peakSpeedRef = useRef(0);
  const rangeAccumRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  // External callback so useJerkFeedback can react per-frame
  const jerkCallbackRef = useRef<JerkCallback | null>(null);

  const setJerkCallback = (cb: JerkCallback | null) => {
    jerkCallbackRef.current = cb;
  };

  const handleData = ({ x, y, z }: { x: number; y: number; z: number }) => {
    const raw = Math.sqrt(x * x + y * y + z * z);
    const filtered =
      EMA_ALPHA * raw + (1 - EMA_ALPHA) * prevFilteredRef.current;

    // Phase 1 — baseline collection
    if (!isBaselineSetRef.current) {
      baselineSamplesRef.current.push(filtered);
      if (baselineSamplesRef.current.length >= BASELINE_SAMPLES) {
        const sum = baselineSamplesRef.current.reduce((a, b) => a + b, 0);
        baselineRef.current = sum / baselineSamplesRef.current.length;
        isBaselineSetRef.current = true;
        startTimeRef.current = Date.now();
      }
      prevFilteredRef.current = filtered;
      return;
    }

    // Phase 2 — active measurement
    const adjusted = Math.abs(filtered - baselineRef.current);
    const jerk = Math.abs(filtered - prevFilteredRef.current);

    allJerksRef.current.push(jerk);
    if (jerk > peakJerkRef.current) peakJerkRef.current = jerk;
    if (adjusted > peakSpeedRef.current) peakSpeedRef.current = adjusted;
    rangeAccumRef.current += adjusted * (UPDATE_INTERVAL / 1000);

    // Fire external callback (for vibration feedback)
    jerkCallbackRef.current?.(jerk);

    setLiveJerk(jerk);
    setLiveSpeed(adjusted);
    prevFilteredRef.current = filtered;
  };

  const start = () => {
    reset();
    Accelerometer.setUpdateInterval(UPDATE_INTERVAL);
    subscriptionRef.current = Accelerometer.addListener(handleData);
  };

  const stop = () => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
  };

  const reset = () => {
    stop();
    prevFilteredRef.current = 0;
    baselineSamplesRef.current = [];
    baselineRef.current = 0;
    isBaselineSetRef.current = false;
    allJerksRef.current = [];
    peakJerkRef.current = 0;
    peakSpeedRef.current = 0;
    rangeAccumRef.current = 0;
    startTimeRef.current = null;
    setLiveJerk(0);
    setLiveSpeed(0);
  };

  const getAttemptData = (attemptNumber: 1 | 2, vibrationEnabled: boolean) => {
    const jerks = allJerksRef.current;
    const avgJerk =
      jerks.length > 0 ? jerks.reduce((a, b) => a + b, 0) / jerks.length : 0;

    const smoothnessScore = Math.round(
      Math.max(0, 1 - avgJerk / MAX_JERK) * 100,
    );

    return {
      attemptNumber,
      vibrationEnabled,
      smoothnessScore,
      avgJerk: Math.round(avgJerk * 10000) / 10000,
      peakJerk: Math.round(peakJerkRef.current * 10000) / 10000,
      peakSpeedG: Math.round(peakSpeedRef.current * 1000) / 1000,
      rangeOfMotion: Math.round(rangeAccumRef.current * 10) / 10,
      durationMs: startTimeRef.current ? Date.now() - startTimeRef.current : 0,
    };
  };

  // Normalised 0–1 for live meters
  const liveJerkNorm = Math.min(liveJerk / MAX_JERK, 1);
  const liveSpeedNorm = Math.min(liveSpeed / MAX_SPEED, 1);

  return {
    liveJerk,
    liveSpeed,
    liveJerkNorm,
    liveSpeedNorm,
    start,
    stop,
    reset,
    getAttemptData,
    setJerkCallback,
  };
}
