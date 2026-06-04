import ReflectionTemplate from "@/src/components/workflow/ReflectionTemplate";
import { addSessionReflection } from "@/src/services/session";
import { useSessionStore } from "@/src/store/session-store";
import { useRouter } from "expo-router";

export default function ReflectionScreen() {
  const router = useRouter();
  const { sessionId } = useSessionStore();

  if (!sessionId) return null;

  const handleSave = async (reflection: string) => {
    try {
      await addSessionReflection(sessionId, reflection);
      router.replace("/screens/humanPerformanceLab/SummaryScreen");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ReflectionTemplate
      title="Activity Reflection"
      prompt="What did you learn from today's activities?"
      onSave={handleSave}
    />
  );
}
