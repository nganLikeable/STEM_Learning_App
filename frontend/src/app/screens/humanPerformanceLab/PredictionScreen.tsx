import { humanPerformanceActivity } from "@/lib/activityPhaseDescriptions";
import PredictionTemplate from "@/src/components/workflow/PredictionTemplate";
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
      router.replace("/screens/humanPerformanceLab/InstructionScreen");
      return;
    }

    router.replace({
      pathname: "/JourneyComponent",
      params: { journeyData },
    } as any);
  };

  return (
    <PredictionTemplate
      activityId={5}
      activityName="Human Performance Lab"
      title="Which movement will create the strongest sensor response?"
      description="Pick the movement style you think will produce the most noticeable vibration changes."
      onSave={handleSave}
      designs={humanPerformanceActivity.phases}
    />
  );
}
