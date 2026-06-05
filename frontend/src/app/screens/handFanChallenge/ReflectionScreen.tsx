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
      router.replace("/screens/handFanChallenge/SummaryScreen");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ReflectionTemplate
      title="Hand Fan Reflection"
      prompt="What did you discover about how fan design and distance affect the bending of materials?"
      onSave={handleSave}
    />
  );
}
