import BreathTracker from "@/src/features/breathTracker/BreathTracker";
import { calculateFinalPoints257, setActivity7 } from "@/src/services/activity";
import { db } from "@/src/services/firestore";
import { advanceSessionById } from "@/src/services/session";
import { updateTeamScore } from "@/src/services/teamScore";
import { useSessionStore } from "@/src/store/session-store";
import { useTeamStore } from "@/src/store/team-store";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BreathTrackerScreen() {
  const router = useRouter();
  const { journeyData } = useLocalSearchParams<{ journeyData?: string }>();

  const { teamId } = useTeamStore();
  const { sessionId } = useSessionStore();

  const [saving, setSaving] = useState(false);

  const handleSave = async (bpm: number) => {
    if (!teamId || !sessionId) return;
    setSaving(true);
    try {
      const activityDocId = await setActivity7(teamId, 7, sessionId, bpm);
      const updated = await advanceSessionById(
        sessionId,
        activityDocId,
        bpm,
        3,
      );

      if (updated?.completed) {
        const finalPoints = calculateFinalPoints257(updated);
        await updateDoc(doc(db, "sessions", sessionId), {
          totalPoints: finalPoints,
        });
        await updateTeamScore(teamId);
        router.replace("/screens/breathingPaceTrainer/ReflectionScreen");
        return;
      }

      if (journeyData) {
        router.replace({
          pathname: "/journey",
          params: { journeyData },
        } as any);
        return;
      }

      router.back();
    } catch (e) {
      console.error("Failed to save breath activity:", e);
    } finally {
      setSaving(false);
    }
  };

  if (saving) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#facc15" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BreathTracker onSave={handleSave} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
  },
});
