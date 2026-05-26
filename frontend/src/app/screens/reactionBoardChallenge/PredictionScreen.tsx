import { reactionBoardActivity } from "@/lib/activityPhaseDescriptions";
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
      router.replace("/screens/reactionBoardChallenge/InstructionScreen");
      return;
    }

    router.replace({
      pathname: "/JourneyComponent",
      params: { journeyData },
    } as any);
  };

  return (
    <PredictionTemplate
      activityId={6}
      activityName="Reaction Board Challenge"
      title="Which challenge will be fastest?"
      description="Choose the test you think will produce the quickest reaction time and strongest focus."
      onSave={handleSave}
      designs={reactionBoardActivity.phases}
    />
  );
}
