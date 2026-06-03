import { soundPollutionActivity } from "@/lib/activityPhaseDescriptions";
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
      router.replace("/screens/soundPollutionHunter/InstructionScreen");
      return;
    }

    router.replace({
      pathname: "/journey",
      params: { journeyData },
    } as any);
  };

  return (
    <PredictionTemplate
      activityId={2}
      activityName="Sound Pollution Hunter"
      title="Which sound source will be loudest?"
      description="Pick the sound source you think will create the highest dB reading in the room."
      fallbackDesigns={soundPollutionActivity.phases}
      titleOnly
      onSave={handleSave}
    />
  );
}
