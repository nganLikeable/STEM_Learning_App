import SummaryTemplate, { AttemptRow, Section, StatRow } from "@/src/components/workflow/SummaryTemplate";
import { db } from "@/src/services/firestore";
import { getSessionById } from "@/src/services/session";
import { useSessionStore } from "@/src/store/session-store";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function SummaryScreen() {
  const { sessionId } = useSessionStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalPoints, setTotalPoints] = useState(0);
  const [reflection, setReflection] = useState<string | undefined>();
  const [prediction, setPrediction] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<{
    attempt: number; score: number;
    dominantMs: number; nonDominantMs: number; tracingAccuracy: number;
  }[]>([]);
  const [bestIndex, setBestIndex] = useState(0);

  useEffect(() => {
    if (!sessionId) { setError("No session found."); setLoading(false); return; }
    (async () => {
      try {
        const session = await getSessionById(sessionId);
        if (!session) { setError("Session not found."); setLoading(false); return; }
        setTotalPoints(session.totalPoints ?? 0);
        setReflection(session.reflection);
        setPrediction(session.prediction);

        const rows = await Promise.all(
          session.activitiesCompleted.map(async (a, i) => {
            const snap = await getDoc(doc(db, "activities", a.activityId));
            const data = snap.exists() ? snap.data() : {};
            return {
              attempt: i + 1,
              score: a.score,
              dominantMs: data.dominantMs ?? 0,
              nonDominantMs: data.nonDominantMs ?? 0,
              tracingAccuracy: data.tracingAccuracy ?? 0,
            };
          })
        );

        const best = rows.length > 0 ? rows.reduce((max, r, i, arr) => r.score > arr[max].score ? i : max, 0) : 0;
        setAttempts(rows);
        setBestIndex(best);
      } catch (e) {
        setError("Failed to load summary.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  if (loading) return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><ActivityIndicator color="#6b76ee" size="large" /></View>;
  if (error) return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><Text>{error}</Text></View>;

  return (
    <SummaryTemplate activityTitle="Reaction Board Challenge" emoji="⚡" totalPoints={totalPoints} reflection={reflection}>
      <Section title="Attempts">
        {attempts.map((a, i) => (
          <AttemptRow key={i} attempt={a.attempt} score={a.score} isBest={i === bestIndex} />
        ))}
      </Section>
      {attempts[bestIndex] && (
        <Section title="Best Attempt Breakdown">
          <StatRow label="Dominant hand" value={attempts[bestIndex].dominantMs} unit="ms" />
          <StatRow label="Non-dominant hand" value={attempts[bestIndex].nonDominantMs} unit="ms" />
          <StatRow label="Tracing accuracy" value={`${attempts[bestIndex].tracingAccuracy.toFixed(1)}%`} highlight />
        </Section>
      )}
      <Section title="Prediction">
        <StatRow label="You predicted" value={prediction != null ? `Attempt ${prediction}` : "—"} />
        <StatRow label="Best attempt" value={`Attempt ${bestIndex + 1}`} />
        <StatRow label="Correct" value={prediction === bestIndex + 1 ? "Yes ✓" : "No ✗"} highlight />
      </Section>
      <Section title="Score">
        <StatRow label="Total score" value={totalPoints.toFixed(2)} unit="pts" highlight />
      </Section>
    </SummaryTemplate>
  );
}
