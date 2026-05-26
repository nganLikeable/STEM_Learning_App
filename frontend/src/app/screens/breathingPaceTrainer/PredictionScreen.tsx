import { breathingPaceActivity } from "@/lib/activityPhaseDescriptions";
import PredictionTemplate from "@/src/components/PredictionTemplate";
import { updateSession } from "@/src/services/session";
import { useSessionStore } from "@/src/store/session-store";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function PredictionScreen() {
  const router = useRouter();
  const { journeyData } = useLocalSearchParams<{ journeyData?: string }>();
  const { sessionId } = useSessionStore();

  const handleSave = async (prediction: number) => {
    if (!sessionId) return;

    await updateSession(sessionId, prediction, 1);

    if (!journeyData) {
      router.replace("/screens/breathingPaceTrainer/InstructionScreen");
      return;
    }

    router.replace({
      pathname: "/JourneyComponent",
      params: { journeyData },
    } as any);
  };

  return (
    <PredictionTemplate
      activityNo={7}
      activityName="Breathing Pace Trainer"
      title="When will breathing be fastest?"
      description="Choose the phase where you expect the breathing rate to increase the most."
      onSave={handleSave}
      designs={breathingPaceActivity.phases}
    />
  );
}
