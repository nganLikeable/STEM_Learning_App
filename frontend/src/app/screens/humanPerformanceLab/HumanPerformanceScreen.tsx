import StretchActivity from "@/src/features/humanPerformance/StretchActivity";
import {
  MovementId,
  MovementResult,
} from "@/src/features/humanPerformance/types";
import { useAppTheme } from "@/hooks/useAppTheme";
import { calculateFinalPoints257, setActivity5 } from "@/src/services/activity";
import { db } from "@/src/services/firestore";
import { advanceSessionById, getSessionById } from "@/src/services/session";
import { updateTeamScore } from "@/src/services/teamScore";
import { useSessionStore } from "@/src/store/session-store";
import { useTeamStore } from "@/src/store/team-store";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

function improvementColor(delta: number) {
  if (delta > 0) return "#22c55e";
  if (delta === 0) return "#facc15";
  return "#ef4444";
}

export default function HumanPerformanceScreen() {
  const router = useRouter();
  const { journeyData } = useLocalSearchParams<{ journeyData?: string }>();

  const { teamId } = useTeamStore();
  const { sessionId } = useSessionStore();

  const { colors } = useAppTheme();
  const [movementId, setMovementId] = useState<MovementId>(1);
  const [result, setResult] = useState<MovementResult | null>(null);
  const [saving, setSaving] = useState(false);

  // Derive movement from session currentPhase so each journey node shows the right movement
  useEffect(() => {
    if (!sessionId) return;
    getSessionById(sessionId).then((session) => {
      const phase = session?.currentPhase ?? 1;
      const id = Math.min(Math.max(phase, 1), 3) as MovementId;
      setMovementId(id);
    });
  }, [sessionId]);

  // Called when StretchActivity finishes — show local summary only
  const handleComplete = (r: MovementResult) => {
    setResult(r);
  };

  // Save + advance + navigate (mirrors handleFinish in CalculationScreen)
  const handleFinish = async () => {
    if (!result || !teamId || !sessionId) return;
    setSaving(true);
    try {
      const score = Math.max(0, result.improvement);
      const activityDocId = await setActivity5(
        teamId,
        5,
        sessionId,
        result.improvement,
      );
      const updated = await advanceSessionById(
        sessionId,
        activityDocId,
        score,
        3,
      );

      if (updated?.completed) {
        const finalPoints = calculateFinalPoints257(updated);
        await updateDoc(doc(db, "sessions", sessionId), {
          totalPoints: finalPoints,
        });
        await updateTeamScore(teamId);
        router.replace("/screens/humanPerformanceLab/ReflectionScreen");
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
      console.error("Failed to save movement:", e);
    } finally {
      setSaving(false);
    }
  };

  if (result) {
    const impColor = improvementColor(result.improvement);
    return (
      <ScrollView style={[s.scroll, { backgroundColor: colors.primary }]} contentContainerStyle={s.scrollContent}>
        <Text style={s.eyebrow}>MOVEMENT COMPLETE</Text>
        <Text style={s.bigEmoji}>{result.emoji}</Text>
        <Text style={[s.title, { color: colors.text }]}>{result.label}</Text>

        <View style={[s.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={s.scoreBox}>
            <Text style={[s.scoreLabel, { color: colors.textSecondary }]}>Without feedback</Text>
            <Text style={s.scoreValue}>{result.attempt1.smoothnessScore}</Text>
            <Text style={[s.scoreUnit, { color: colors.textSecondary }]}>/ 100</Text>
          </View>
          <Text style={[s.arrow, { color: colors.border }]}>→</Text>
          <View style={s.scoreBox}>
            <Text style={[s.scoreLabel, { color: colors.textSecondary }]}>With buzz 📳</Text>
            <Text style={s.scoreValue}>{result.attempt2.smoothnessScore}</Text>
            <Text style={[s.scoreUnit, { color: colors.textSecondary }]}>/ 100</Text>
          </View>
        </View>

        <View style={[s.impBox, { borderColor: impColor }]}>
          <Text style={[s.impValue, { color: impColor }]}>
            {result.improvement > 0
              ? `+${result.improvement} pts`
              : result.improvement === 0
                ? "No change"
                : `${result.improvement} pts`}
          </Text>
          <Text style={[s.impLabel, { color: colors.textSecondary }]}>
            {result.improvement > 0
              ? "Feedback helped ✓"
              : result.improvement === 0
                ? "Same result"
                : "Feedback didn't help this time"}
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [s.cta, pressed && s.ctaPressed]}
          onPress={handleFinish}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#0f172a" />
          ) : (
            <Text style={s.ctaText}>DONE</Text>
          )}
        </Pressable>
      </ScrollView>
    );
  }

  return <StretchActivity addId={movementId} onComplete={handleComplete} />;
}

const s = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 20,
    alignItems: "center",
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 3,
    color: "#475569",
    textAlign: "center",
  },
  bigEmoji: { fontSize: 52 },
  title: { fontSize: 28, fontWeight: "800", textAlign: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  scoreBox: { flex: 1, alignItems: "center", gap: 4 },
  scoreLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1, textAlign: "center" },
  scoreValue: { fontSize: 36, fontWeight: "900", color: "#facc15" },
  scoreUnit: { fontSize: 11 },
  arrow: { fontSize: 20 },
  impBox: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    gap: 6,
  },
  impValue: { fontSize: 32, fontWeight: "900" },
  impLabel: { fontSize: 13 },
  cta: {
    backgroundColor: "#facc15",
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 999,
    alignSelf: "center",
    marginTop: 4,
  },
  ctaPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  ctaText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: 2,
  },
});
