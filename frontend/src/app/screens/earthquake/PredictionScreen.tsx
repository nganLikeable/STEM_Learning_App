import { earthquakeActivity } from "@/lib/activityPhaseDescriptions";
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
      router.replace("/screens/earthquake/InstructionScreen");
      return;
    }

    router.replace({
      pathname: "/journey",
      params: { journeyData },
    } as any);
  };

  return (
    <PredictionTemplate
      activityId={4}
      activityName="Earthquake-Resistant Structure"
      title="Which structure will survive the vibration best?"
      description="Choose the design you think will move the least during the earthquake test."
      onSave={handleSave}
      fallbackDesigns={earthquakeActivity.phases}
    />
  );
}
