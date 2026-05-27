import { parachuteActivity } from "@/lib/activityPhaseDescriptions";
import PredictionTemplate from "@/src/components/workflow/PredictionTemplate";
import { updateSession } from "@/src/services/session";
import { useSessionStore } from "@/src/store/session-store";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function PredictionScreen() {
  const router = useRouter();
  const { journeyData } = useLocalSearchParams<{ journeyData?: string }>();

  const { sessionId } = useSessionStore();

  const handleSave = async (prediction: number) => {
    console.log("SAVE CLICKED");
    console.log("Prediction:", prediction);
    console.log("Session:", sessionId);

    if (!sessionId) {
      console.log("NO SESSION ID");
      return;
    } // update prediction
    await updateSession(sessionId, prediction, 1);
    console.log(sessionId);

    if (!journeyData) {
      router.replace("/screens/parachute/InstructionScreen");
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
      activityId={1}
      activityName="Parachute Drop Challenge"
      title="Which parachute design is the best?"
      description="Pick a parachute design that will land slower and safer."
      onSave={handleSave}
      designs={parachuteActivity.phases}
    />
  );
}
