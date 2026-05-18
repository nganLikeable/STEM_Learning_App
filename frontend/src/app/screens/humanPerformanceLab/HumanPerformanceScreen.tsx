import StretchActivity from "@/src/features/humanPerformance/StretchActivity";
import {
  MovementId,
  MovementResult,
} from "@/src/features/humanPerformance/types";
import { useHumanPerformanceStore } from "@/src/store/human-performance-store";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

function parseMovementId(value: string | string[] | undefined): MovementId {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  if (parsed === 1 || parsed === 2 || parsed === 3) return parsed;
  return 1;
}

function improvementColor(delta: number) {
  if (delta > 0) return "#22c55e";
  if (delta === 0) return "#facc15";
  return "#ef4444";
}

function SummaryCard({ result }: { result: MovementResult }) {
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>
        {result.emoji} Movement {result.movementId} · {result.label}
      </Text>
      <Text style={s.cardLine}>
        Attempt 1: {result.attempt1.smoothnessScore} / 100
      </Text>
      <Text style={s.cardLine}>
        Attempt 2: {result.attempt2.smoothnessScore} / 100
      </Text>
      <Text
        style={[s.cardLine, { color: improvementColor(result.improvement) }]}
      >
        Improvement:{" "}
        {result.improvement > 0 ? `+${result.improvement}` : result.improvement}
      </Text>
    </View>
  );
}

export default function HumanPerformanceScreen() {
  const router = useRouter();
  const { addId } = useLocalSearchParams<{ addId?: string | string[] }>();
  const movementId = parseMovementId(addId);

  const [phaseCompleted, setPhaseCompleted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const { resultsById, upsertResult, resetResults } =
    useHumanPerformanceStore();

  const results = useMemo(
    () =>
      Object.values(resultsById).sort((a, b) => a.movementId - b.movementId),
    [resultsById],
  );

  const hardest = useMemo(() => {
    if (results.length === 0) return null;
    return results.reduce((a, b) =>
      a.attempt1.smoothnessScore < b.attempt1.smoothnessScore ? a : b,
    );
  }, [results]);

  const avgImprovement =
    results.length > 0
      ? Math.round(
          results.reduce((sum, item) => sum + item.improvement, 0) /
            results.length,
        )
      : 0;

  const handleComplete = (result: MovementResult) => {
    upsertResult(result);
    setPhaseCompleted(true);

    const completedMovementIds = new Set([
      ...Object.values(resultsById).map((item) => item.movementId),
      result.movementId,
    ]);

    if (completedMovementIds.size === 3) {
      setShowSummary(true);
    }
  };

  if (showSummary) {
    return (
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        <Text style={s.eyebrow}>ACTIVITY 5 COMPLETE</Text>
        <Text style={s.title}>Human Performance Summary</Text>

        <View style={s.answerBox}>
          <Text style={s.answerTitle}>Hardest movement</Text>
          <Text style={s.answerValue}>
            {hardest
              ? `${hardest.emoji} Movement ${hardest.movementId} · ${hardest.label}`
              : "—"}
          </Text>
        </View>

        <View style={s.answerBox}>
          <Text style={s.answerTitle}>Average feedback impact</Text>
          <Text
            style={[s.answerValue, { color: improvementColor(avgImprovement) }]}
          >
            {avgImprovement > 0
              ? `+${avgImprovement} points`
              : avgImprovement === 0
                ? "No overall change"
                : `${avgImprovement} points`}
          </Text>
        </View>

        {results.map((result) => (
          <SummaryCard key={result.movementId} result={result} />
        ))}

        <Pressable
          style={({ pressed }) => [s.cta, pressed && s.ctaPressed]}
          onPress={() => {
            resetResults();
            setShowSummary(false);
            setPhaseCompleted(false);
            router.back();
          }}
        >
          <Text style={s.ctaText}>DONE</Text>
        </Pressable>
      </ScrollView>
    );
  }

  if (phaseCompleted) {
    const remaining = 3 - results.length;
    return (
      <View style={s.doneScreen}>
        <Text style={s.title}>Movement {movementId} saved</Text>
        <Text style={s.subtitle}>
          {remaining > 0
            ? `${remaining} movement${remaining > 1 ? "s" : ""} remaining before summary.`
            : "All movements complete."}
        </Text>
        <Pressable
          style={({ pressed }) => [s.cta, pressed && s.ctaPressed]}
          onPress={() => router.back()}
        >
          <Text style={s.ctaText}>BACK TO JOURNEY</Text>
        </Pressable>
      </View>
    );
  }

  return <StretchActivity addId={movementId} onComplete={handleComplete} />;
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#0f172a" },
  scrollContent: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 14,
  },
  doneScreen: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#64748b",
    textAlign: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#f1f5f9",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 20,
  },
  answerBox: {
    width: "100%",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: "#334155",
  },
  answerTitle: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "700",
    letterSpacing: 1,
  },
  answerValue: {
    fontSize: 20,
    color: "#f8fafc",
    fontWeight: "800",
  },
  card: {
    width: "100%",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    padding: 16,
    gap: 4,
  },
  cardTitle: {
    color: "#e2e8f0",
    fontSize: 15,
    fontWeight: "700",
  },
  cardLine: {
    color: "#cbd5e1",
    fontSize: 13,
  },
  cta: {
    backgroundColor: "#facc15",
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 999,
    alignSelf: "center",
    marginTop: 6,
  },
  ctaPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  ctaText: {
    color: "#0f172a",
    fontWeight: "800",
    letterSpacing: 1,
  },
});
