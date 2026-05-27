import { Gyroscope } from "expo-sensors";
import { useRef, useState } from "react";

const UPDATE_INTERVAL = 50; // update every 50ms
// general idea:
// Gyroscope gives you:     "rotating at 30 deg/s right now"
// You want to know:        "how many total degrees did it rotate?"

// Answer: add up (rate × time) for every frame

// Frame 1: 30 deg/s × 0.05s = 1.5°
// Frame 2: 28 deg/s × 0.05s = 1.4°
// Frame 3: 45 deg/s × 0.05s = 2.25°
// ...
// Total = 1.5 + 1.4 + 2.25 + ... = X degrees over 5 seconds

export default function useGyroscope() {
  const [liveRotation, setLiveRotation] = useState(0);

  // active sensor subscription
  const subscriptionRef = useRef<ReturnType<
    typeof Gyroscope.addListener
  > | null>(null);

  // timestamp of previous sensor reading , to calculate how many seconds passed since the last reading
  const lastTimestampRef = useRef<number | null>(null);

  // running total of all rotation across test session
  const totalRotationRef = useRef(0);

  // highest rotation
  const maxRotationRef = useRef(0);

  // highest rotation in an interval - how fast at peak
  const peakInstantRef = useRef(0);

  const handleData = ({ x, y, z }: { x: number; y: number; z: number }) => {
    const now = Date.now();

    // CALCULATE DELTA TIME - how many seconds have passed
    const dt =
      lastTimestampRef.current !== null
        ? (now - lastTimestampRef.current) / 1000 //ms => seconds
        : UPDATE_INTERVAL / 1000; // first frame callback

    lastTimestampRef.current = now;

    // CALCULATE ROTATION RATE MAGNITUDE IN DEGREES
    // convert radian/s to degree/s
    const rotationRateDegs = Math.sqrt(x * x + y * y + z * z) * (180 / Math.PI);

    // CALCULATE TOTAL ROTATION
    // degrees = rate * time
    const deltaDeg = rotationRateDegs * dt;
    totalRotationRef.current += deltaDeg;

    // TRACK MAXIMUM
    if (rotationRateDegs > maxRotationRef.current)
      maxRotationRef.current = rotationRateDegs;

    if (deltaDeg > peakInstantRef.current) peakInstantRef.current = deltaDeg;

    // UPDATE UI
    setLiveRotation(rotationRateDegs);
  };

  const start = () => {
    reset();
    Gyroscope.setUpdateInterval(UPDATE_INTERVAL);
    subscriptionRef.current = Gyroscope.addListener(handleData);
  };

  const stop = () => {
    // unsubscribe from sensor
    // w/o => keeps running in background
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
  };

  const reset = () => {
    stop();

    // clear accumulated data
    totalRotationRef.current = 0;
    maxRotationRef.current = 0;
    peakInstantRef.current = 0;
    lastTimestampRef.current = null;
  };

  // round to one decimal
  const getResult = () => ({
    totalRotationDeg: Math.round(totalRotationRef.current * 10) / 10,
    peakRotationRateDeg: Math.round(maxRotationRef.current * 10) / 10,
  });

  return {
    liveRotation,
    start,
    stop,
    reset,
    getResult,
  };
}
