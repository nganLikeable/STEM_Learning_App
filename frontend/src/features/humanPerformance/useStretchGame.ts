import { useEffect, useRef, useState } from "react";
import { MOVEMENTS } from "./movements";
import { Attempt, MovementId, MovementResult, StretchStatus } from "./types";
import useJerkFeedback from "./useJerkFeedback";
import useStretchAccelerometer from "./useStretchAccelerometer";

const RECORDING_DURATION_MS = 15000; // 15s — slow then fast
const COUNTDOWN_FROM = 3;

export default function useStretchGame(movementId: MovementId) {
  const [status, setStatus] = useState<StretchStatus>("idle");
  const [countdown, setCountdown] = useState(COUNTDOWN_FROM);
  const [attemptNumber, setAttemptNumber] = useState<1 | 2>(1);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<MovementResult | null>(null);

  // Temp storage for attempt 1 while waiting for attempt 2
  const attempt1Ref = useRef<Attempt | null>(null);

  const accel = useStretchAccelerometer();
  const feedback = useJerkFeedback();

  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const currentMovement =
    MOVEMENTS.find((movement) => movement.id === movementId) ?? MOVEMENTS[0];

  // countdown
  const startCountdown = () => {
    accel.reset();
    setStatus("countdown");
    setCountdown(COUNTDOWN_FROM);
    setProgress(0);

    let c = COUNTDOWN_FROM;
    const tick = setInterval(() => {
      c--;
      if (c <= 0) {
        clearInterval(tick);
        beginRecording();
      } else {
        setCountdown(c);
      }
    }, 1000);
  };

  // recording
  const beginRecording = () => {
    setStatus("recording");
    startTimeRef.current = Date.now();

    // Wire jerk feedback callback into accelerometer
    if (attemptNumber === 2) {
      feedback.enable();
      accel.setJerkCallback(feedback.checkJerk);
    } else {
      accel.setJerkCallback(null);
    }

    accel.start();
    animFrameRef.current = requestAnimationFrame(animateProgress);
  };

  const animateProgress = () => {
    const elapsed = Date.now() - startTimeRef.current;
    const p = Math.min(elapsed / RECORDING_DURATION_MS, 1);
    setProgress(p);

    if (p < 1) {
      animFrameRef.current = requestAnimationFrame(animateProgress);
    } else {
      finishRecording();
    }
  };

  const finishRecording = () => {
    feedback.disable();
    accel.stop();
    accel.setJerkCallback(null);
    cancelAnimationFrame(animFrameRef.current);

    if (attemptNumber === 1) {
      // Store attempt 1, show between screen
      attempt1Ref.current = accel.getAttemptData(1, false) as Attempt;
      setAttemptNumber(2);
      setStatus("between");
    } else {
      // Both attempts done — build full movement result
      const attempt2 = accel.getAttemptData(2, true) as Attempt;
      const attempt1 = attempt1Ref.current!;

      const result: MovementResult = {
        movementId: currentMovement.id,
        label: currentMovement.label,
        emoji: currentMovement.emoji,
        attempt1,
        attempt2,
        improvement: attempt2.smoothnessScore - attempt1.smoothnessScore,
      };

      setResult(result);
      setAttemptNumber(1);
      attempt1Ref.current = null;
      setStatus("result");
    }
  };

  const reset = () => {
    feedback.disable();
    accel.reset();
    cancelAnimationFrame(animFrameRef.current);
    attempt1Ref.current = null;
    setStatus("idle");
    setAttemptNumber(1);
    setProgress(0);
    setResult(null);
    setCountdown(COUNTDOWN_FROM);
  };

  useEffect(() => {
    reset();
  }, [movementId]);

  return {
    status,
    countdown,
    progress,
    result,
    currentMovement,
    attemptNumber,
    // live readings
    liveJerkNorm: accel.liveJerkNorm,
    liveSpeedNorm: accel.liveSpeedNorm,
    liveJerk: accel.liveJerk,
    liveSpeed: accel.liveSpeed,
    // actions
    startCountdown,
    reset,
  };
}
