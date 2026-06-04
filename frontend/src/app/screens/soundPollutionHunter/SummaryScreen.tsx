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
  const [attempts, setAttempts] = useState<{ attempt: number; score: number; peakSound: number }[]>([]);
  const [bestIndex, setBestIndex] = useState(0);
  const [prediction, setPrediction] = useState<number | null>(null);

  useEffect(() => {
    if (!sessionId) { setError("No session found."); setLoading(false); return; }
    (async () => {
      try {
        const session = await getSessionById(sessionId);
        if (!session) { setError("Session not found."); setLoading(false); return; }

        setTotalPoints(session.totalPoints ?? 0);
        setPrediction(session.prediction);
        setReflection(session.reflection);

        // fetch each activity doc by its stored ID for reliable matching
        const rows = await Promise.all(
          session.activitiesCompleted.map(async (a, i) => {
            const snap = await getDoc(doc(db, "activities", a.activityId));
            const data = snap.exists() ? snap.data() : {};
            return {
              attempt: i + 1,
              score: a.score,
              peakSound: data.peakSound ?? 0,
            };
          })
        );

        const best = rows.length > 0
          ? rows.reduce((max, r, i, arr) => r.score > arr[max].score ? i : max, 0)
          : 0;
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
    <SummaryTemplate activityTitle="Sound Pollution Hunter" emoji="🔊" totalPoints={totalPoints} reflection={reflection}>
      <Section title="Measurements">
        {attempts.map((a, i) => (
          <AttemptRow key={i} attempt={a.attempt} score={a.score} isBest={i === bestIndex} />
        ))}
      </Section>
      {attempts[bestIndex] && (
        <Section title="Best Reading">
          <StatRow label="Peak sound level" value={attempts[bestIndex].peakSound.toFixed(1)} unit="dB" highlight />
        </Section>
      )}
      <Section title="Prediction">
        <StatRow label="You predicted" value={prediction != null ? `Attempt ${prediction}` : "—"} />
        <StatRow label="Loudest attempt" value={`Attempt ${bestIndex + 1}`} />
        <StatRow label="Correct" value={prediction === bestIndex + 1 ? "Yes ✓" : "No ✗"} highlight />
      </Section>
    </SummaryTemplate>
  );
}
