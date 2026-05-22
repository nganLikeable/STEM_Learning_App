import PredictionTemplate from "@/src/components/PredictionTemplate";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function PredictionScreen() {
  const router = useRouter();
  const { journeyData } = useLocalSearchParams<{ journeyData?: string }>();

  const handleSave = () => {
    if (!journeyData) {
      router.replace("/screens/parachute/InstructionScreen");
      return;
    }

    router.replace({
      pathname: "/JourneyComponent",
      params: { journeyData },
    } as any);
  };

  return (
    <PredictionTemplate
      activityNo={1}
      activityName="Parachute"
      title="Which design is the best"
      description="None"
      onSave={handleSave}
    />
  );
}
