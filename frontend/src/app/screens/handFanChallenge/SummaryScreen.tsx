import { handFanActivity } from "@/lib/activityPhaseDescriptions";
import { Section, StatRow, AttemptRow } from "@/src/components/workflow/SummaryTemplate";
import SummaryTemplate from "@/src/components/workflow/SummaryTemplate";
import { db } from "@/src/services/firestore";
import { getSessionById } from "@/src/services/session";
import { useSessionStore } from "@/src/store/session-store";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

interface AttemptData {
  attempt: number;
  designNo: number;
  designTitle: string;
  angleACB: number;
  score: number;
}

export default function SummaryScreen() {
  const { sessionId } = useSessionStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalPoints, setTotalPoints] = useState(0);
  const [reflection, setReflection] = useState<string | undefined>();
  const [attempts, setAttempts] = useState<AttemptData[]>([]);
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

        const rows = await Promise.all(
          session.activitiesCompleted.map(async (a, i) => {
            const snap = await getDoc(doc(db, "activities", a.activityId));
            const data = snap.exists() ? snap.data() : {};
            const designNo: number = data.designNo ?? i + 1;
            const phase = handFanActivity.phases.find(p => p.id === designNo);
            return {
              attempt: i + 1,
              designNo,
              designTitle: phase?.title ?? `Design ${designNo}`,
              angleACB: data.angleACB ?? 0,
              score: a.score,
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

  if (loading) return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator color="#6C63FF" size="large" />
    </View>
  );
  if (error) return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>{error}</Text>
    </View>
  );

  const best = attempts[bestIndex];

  return (
    <SummaryTemplate
      activityTitle="Hand Fan Challenge"
      emoji="🌬️"
      totalPoints={totalPoints}
      reflection={reflection}
    >
      <Section title="Attempts">
        {attempts.map((a, i) => (
          <AttemptRow key={i} attempt={a.attempt} score={a.score} isBest={i === bestIndex} unit="°" />
        ))}
      </Section>

      {best && (
        <Section title="Best Design Result">
          <StatRow label="Design" value={best.designTitle} />
          <StatRow label="Bend angle (∠ACB)" value={best.angleACB.toFixed(1)} unit="°" highlight />
        </Section>
      )}

      <Section title="All Angles">
        {attempts.map((a, i) => (
          <StatRow
            key={i}
            label={`Design ${a.designNo} — ${a.designTitle}`}
            value={a.angleACB.toFixed(1)}
            unit="°"
            highlight={i === bestIndex}
          />
        ))}
      </Section>

      <Section title="Prediction">
        <StatRow label="You predicted" value={prediction != null ? `Design ${prediction}` : "—"} />
        <StatRow label="Best design" value={`Design ${best?.designNo ?? "—"}`} />
        <StatRow
          label="Correct"
          value={prediction === best?.designNo ? "Yes ✓" : "No ✗"}
          highlight
        />
      </Section>
    </SummaryTemplate>
  );
}
