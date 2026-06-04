import TapReactionGame from "@/src/features/reactionBoard/tap/TapReactionGame";
import TracingGame from "@/src/features/reactionBoard/tracing/TracingGame";
import {
  calculateFinalPoints6,
  scoreReactionTime,
  setActivity6,
} from "@/src/services/activity";
import { db } from "@/src/services/firestore";
import { advanceSessionById } from "@/src/services/session";
import { updateTeamScore } from "@/src/services/teamScore";
import { useSessionStore } from "@/src/store/session-store";
import { useTeamStore } from "@/src/store/team-store";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

type Phase = "dominant" | "non-dominant" | "tracing";

export default function ReactionBoardGameScreen() {
  const router = useRouter();
  const { journeyData } = useLocalSearchParams<{ journeyData?: string }>();
  const { teamId } = useTeamStore();
  const { sessionId } = useSessionStore();

  const [phase, setPhase] = useState<Phase>("dominant");
  const [dominantMs, setDominantMs] = useState<number>(0);
  const [nonDominantMs, setNonDominantMs] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const handleDominantDone = (ms: number) => {
    setDominantMs(ms);
    setPhase("non-dominant");
  };

  const handleNonDominantDone = (ms: number) => {
    setNonDominantMs(ms);
    setPhase("tracing");
  };

  const handleTracingDone = async (accuracyPercent: number) => {
    if (!teamId || !sessionId) return;
    setSaving(true);
    try {
      const phase1Score = scoreReactionTime(dominantMs);
      const phase2Score = scoreReactionTime(nonDominantMs);
      const phaseScore = phase1Score + phase2Score + Math.round(accuracyPercent);

      const activityDocId = await setActivity6(
        teamId, 6, sessionId,
        dominantMs, nonDominantMs, accuracyPercent,
        phaseScore,
      );

      const updated = await advanceSessionById(sessionId, activityDocId, phaseScore, 3);

      if (updated?.completed) {
        // take highest score across all attempts, then add swap + prediction bonuses
        const finalPoints = calculateFinalPoints6(updated, dominantMs, nonDominantMs);
        await updateDoc(doc(db, "sessions", sessionId), { totalPoints: finalPoints });
        await updateTeamScore(teamId);
        router.replace("/screens/reactionBoardChallenge/ReflectionScreen");
        return;
      }

      if (journeyData) {
        router.replace({ pathname: "/journey", params: { journeyData } } as any);
        return;
      }
      router.back();
    } catch (e) {
      console.error("Failed to save activity 6:", e);
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

  if (phase === "dominant")
    return <TapReactionGame phase="dominant" onNext={handleDominantDone} />;

  if (phase === "non-dominant")
    return <TapReactionGame phase="non-dominant" onNext={handleNonDominantDone} />;

  return <TracingGame onDone={handleTracingDone} />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0f172a" },
});
