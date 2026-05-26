import * as Haptics from "expo-haptics";
import { useRef, useState } from "react";

export default function useVibrationPattern() {
  const [isVibrating, setIsVibrating] = useState(false);
  const activeRef = useRef(false);

  const start = async (durationMs = 5000) => {
    setIsVibrating(true);
    activeRef.current = true;

    const endTime = Date.now() + durationMs;

    while (Date.now() < endTime && activeRef.current) {
      // Rapid-fire heavy impacts with minimal pause — most intense pattern possible
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await new Promise((r) => setTimeout(r, 0));
    }

    // cleanup
    setIsVibrating(false);
    activeRef.current = false;
  };

  const stop = () => {
    activeRef.current = false;
    setIsVibrating(false);
  };

  return { isVibrating, start, stop };
}
