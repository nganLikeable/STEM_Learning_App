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
  const [attempts, setAttempts] = useState<{ attempt: number; score: number; breathsPerMinute: number }[]>([]);
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
            return { attempt: i + 1, score: a.score, breathsPerMinute: data.breathsPerMinute ?? 0 };
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

  const avgBpm = attempts.length > 0
    ? (attempts.reduce((s, a) => s + a.breathsPerMinute, 0) / attempts.length).toFixed(1)
    : "—";

  return (
    <SummaryTemplate activityTitle="Breathing Pace Trainer" emoji="🫁" totalPoints={totalPoints} reflection={reflection}>
      <Section title="Recordings">
        {attempts.map((a, i) => (
          <AttemptRow key={i} attempt={a.attempt} score={a.score} isBest={i === bestIndex} />
        ))}
      </Section>
      <Section title="Breathing Stats">
        <StatRow label="Highest BPM" value={attempts[bestIndex]?.breathsPerMinute ?? "—"} unit="breaths/min" highlight />
        <StatRow label="Average BPM" value={avgBpm} unit="breaths/min" />
        <StatRow label="Total score" value={Math.round(totalPoints)} unit="pts" />
      </Section>
      <Section title="Prediction">
        <StatRow label="You predicted" value={prediction != null ? `Recording ${prediction}` : "—"} />
        <StatRow label="Highest BPM recording" value={`Recording ${bestIndex + 1}`} />
        <StatRow label="Correct" value={prediction === bestIndex + 1 ? "Yes ✓" : "No ✗"} highlight />
      </Section>
    </SummaryTemplate>
  );
}
