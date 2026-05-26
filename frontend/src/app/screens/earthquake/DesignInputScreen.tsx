import DesignInputTemplate, {
  DesignInput,
} from "@/src/components/workflow/DesignInputTemplate";
import { updateSessionDesigns } from "@/src/services/session";
import { useSessionStore } from "@/src/store/session-store";
import { useTeamStore } from "@/src/store/team-store";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function DesignInputScreen() {
  const router = useRouter();
  const { journeyData } = useLocalSearchParams<{ journeyData?: string }>();
  const { sessionId } = useSessionStore();
  const { teamId } = useTeamStore();

  const handleSave = async (designs: DesignInput[]) => {
    if (!sessionId || !teamId) return;

    await updateSessionDesigns(sessionId, designs);

    router.replace({
      pathname: "/screens/earthquake/PredictionScreen",
      params: journeyData ? { journeyData } : undefined,
    } as any);
  };

  return (
    <DesignInputTemplate
      activityId={4}
      activityName="Earthquake-Resistant Structure"
      title="Enter designs to test how strong they can hold up the phone-simulated earthquake."
      description="Write three earthquake-resistant design structures. For example: 4 folds + 4 pillars; 10 folds + 4 pillars; etc."
      onSave={handleSave}
    />
  );
}
