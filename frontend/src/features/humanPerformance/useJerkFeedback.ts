import * as Haptics from "expo-haptics";
import { useRef } from "react";
import { Platform, Vibration } from "react-native";

// Jerk above this threshold triggers a buzz
const JERK_THRESHOLD = 0.05;

// Minimum gap between buzzes — prevents constant rattling
const BUZZ_COOLDOWN_MS = 250;

export default function useJerkFeedback() {
  const enabledRef = useRef(false);
  const lastBuzzRef = useRef<number>(0);

  const enable = () => {
    enabledRef.current = true;
    lastBuzzRef.current = 0;
  };

  const disable = () => {
    enabledRef.current = false;
    Vibration.cancel();
  };

  const triggerBuzz = async (duration: number) => {
    if (Platform.OS === "web") {
      Vibration.vibrate(duration);
      return;
    }

    const style =
      duration < 80
        ? Haptics.ImpactFeedbackStyle.Light
        : duration < 140
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Heavy;

    await Haptics.impactAsync(style);
  };

  // Called every accelerometer frame from useStretchAccelerometer
  const checkJerk = (jerk: number) => {
    if (!enabledRef.current) return;

    const now = Date.now();
    if (jerk > JERK_THRESHOLD && now - lastBuzzRef.current > BUZZ_COOLDOWN_MS) {
      // Duration scales with how jerky — 50ms (mild) to 200ms (very jerky)
      const ratio = Math.min(jerk / JERK_THRESHOLD, 4);
      const duration = Math.round(50 * ratio);
      void triggerBuzz(duration);
      lastBuzzRef.current = now;
    }
  };

  return { enable, disable, checkJerk };
}
