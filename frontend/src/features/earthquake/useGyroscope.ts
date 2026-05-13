// useGyroscope.ts
import { Gyroscope } from "expo-sensors";
import { useRef, useState } from "react";

const UPDATE_INTERVAL = 50; // 20hz — enough for this use case

export default function useGyroscope() {
  const [liveRotation, setLiveRotation] = useState(0);

  const subscriptionRef = useRef<ReturnType<
    typeof Gyroscope.addListener
  > | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const totalRotationRef = useRef(0);
  const maxRotationRef = useRef(0);
  const peakInstantRef = useRef(0);

  const handleData = ({ x, y, z }: { x: number; y: number; z: number }) => {
    const now = Date.now();

    // dt = time since last sample in seconds
    const dt =
      lastTimestampRef.current !== null
        ? (now - lastTimestampRef.current) / 1000
        : UPDATE_INTERVAL / 1000;

    lastTimestampRef.current = now;

    // total rotation rate magnitude across all axes (rad/s → deg/s)
    const rotationRateDegS = Math.sqrt(x * x + y * y + z * z) * (180 / Math.PI);

    // integrate: degrees moved this frame
    const deltaDeg = rotationRateDegS * dt;

    totalRotationRef.current += deltaDeg;

    if (rotationRateDegS > maxRotationRef.current) {
      maxRotationRef.current = rotationRateDegS;
    }

    if (deltaDeg > peakInstantRef.current) {
      peakInstantRef.current = deltaDeg;
    }

    setLiveRotation(rotationRateDegS);
  };

  const start = () => {
    reset();
    Gyroscope.setUpdateInterval(UPDATE_INTERVAL);
    subscriptionRef.current = Gyroscope.addListener(handleData);
  };

  const stop = () => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
  };

  const reset = () => {
    stop();
    totalRotationRef.current = 0;
    maxRotationRef.current = 0;
    peakInstantRef.current = 0;
    lastTimestampRef.current = null;
    setLiveRotation(0);
  };

  const getResult = () => ({
    totalRotationDeg: Math.round(totalRotationRef.current * 10) / 10,
    maxRotationDeg: Math.round(maxRotationRef.current * 10) / 10,
  });

  return { liveRotation, start, stop, reset, getResult };
}
