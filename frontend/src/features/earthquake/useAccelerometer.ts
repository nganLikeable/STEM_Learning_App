import { Accelerometer } from "expo-sensors";
import { useRef, useState } from "react";

const UPDATE_INTERVAL = 50;
const EMA_ALPHA = 0.2;
const BASELINE_SAMPLES = 10; // first 0.5s = baseline

export default function useAccelerometer() {
  const [liveAccel, setLiveAccel] = useState(0);

  const subscriptionRef = useRef<ReturnType<
    typeof Accelerometer.addListener
  > | null>(null);
  const prevFilteredRef = useRef(0);

  // calibrated resting acceleration - normal resting value
  const baselineRef = useRef(0);
  const baselineSamplesRef = useRef<number[]>([]);

  // if baseline is ready
  const isBaselineSetRef = useRef(false);

  // highest acceleration detected during test
  const maxAccelRef = useRef(0);

  // jerk:  rate at which acceleration changes
  const allJerksRef = useRef<number[]>([]);

  const handleData = ({ x, y, z }: { x: number; y: number; z: number }) => {
    const raw = Math.sqrt(x * x + y * y + z * z);

    // EMA filter
    const filtered =
      EMA_ALPHA * raw + (1 - EMA_ALPHA) * prevFilteredRef.current;

    // COLLECT BASELINE
    if (!isBaselineSetRef.current) {
      baselineSamplesRef.current.push(filtered);
      if (baselineSamplesRef.current.length >= BASELINE_SAMPLES) {
        const sum = baselineSamplesRef.current.reduce((a, b) => a + b, 0);
        baselineRef.current = sum / baselineSamplesRef.current.length;
        isBaselineSetRef.current = true;
      }
      prevFilteredRef.current = filtered;
      return;
    }

    // MEASURE AGAINST BASELINE
    // subtract the baseline to measure the movement, not gravity
    const adjusted = Math.abs(filtered - baselineRef.current);
    const jerk = Math.abs(filtered - prevFilteredRef.current);

    allJerksRef.current.push(jerk);

    if (adjusted > maxAccelRef.current) {
      maxAccelRef.current = adjusted;
    }

    setLiveAccel(adjusted);
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
    baselineRef.current = 0;
    baselineSamplesRef.current = [];
    isBaselineSetRef.current = false;
    maxAccelRef.current = 0;
    allJerksRef.current = [];
    setLiveAccel(0);
  };

  const getResult = () => ({
    maxAcceleration: Math.round(maxAccelRef.current * 1000) / 1000,
  });

  return { liveAccel, start, stop, reset, getResult };
}
