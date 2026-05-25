import { handFanActivity } from "@/lib/activityPhaseDescriptions";
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
      router.replace("/screens/handFanChallenge/InstructionScreen");
      return;
    }

    router.replace({
      pathname: "/JourneyComponent",
      params: { journeyData },
    } as any);
  };

  return (
    <PredictionTemplate
      activityNo={3}
      activityName="Hand Fan Challenge"
      title="Which fan setup will make the paper move the most?"
      description="Pick the combination of material, fan distance, and airflow that you think will create the biggest bend."
      onSave={handleSave}
      designs={handFanActivity.phases}
    />
  );
}
