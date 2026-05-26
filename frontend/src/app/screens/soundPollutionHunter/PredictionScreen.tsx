import { soundPollutionActivity } from "@/lib/activityPhaseDescriptions";
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
      router.replace("/screens/soundPollutionHunter/InstructionScreen");
      return;
    }
    console.log(journeyData);
    router.replace({
      pathname: "/JourneyComponent",
      params: { journeyData },
    } as any);
  };

  return (
    <PredictionTemplate
      activityNo={2}
      activityName="Sound Pollution Hunter"
      title="Which sound source will be loudest?"
      description="Pick the sound source you think will create the highest dB reading in the room."
      onSave={handleSave}
      designs={soundPollutionActivity.phases}
    />
  );
}
