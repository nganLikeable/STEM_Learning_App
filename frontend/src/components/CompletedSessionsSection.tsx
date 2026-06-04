import { useAppTheme } from "@/hooks/useAppTheme";
import { SessionDoc, getCompletedSessionsByTeam } from "@/src/services/session";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export const ACTIVITY_META: Record<number, { title: string; emoji: string; color: string }> = {
  1: { title: "Parachute Drop",         emoji: "🪂", color: "#6b76ee" },
  2: { title: "Sound Pollution Hunter", emoji: "🔊", color: "#f97316" },
  3: { title: "Hand Fan Challenge",     emoji: "🌬️", color: "#0ea5e9" },
  4: { title: "Earthquake Structure",   emoji: "🏗️", color: "#ef4444" },
  5: { title: "Performance Lab",        emoji: "🏃", color: "#22c55e" },
  6: { title: "Reaction Board",         emoji: "⚡", color: "#a855f7" },
  7: { title: "Breathing Trainer",      emoji: "🫁", color: "#14b8a6" },
};

interface Props { teamId: string; }

export default function CompletedSessionsSection({ teamId }: Props) {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [bestByActivity, setBestByActivity] = useState<Record<number, SessionDoc>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamId) return;
    getCompletedSessionsByTeam(teamId)
      .then((docs) => {
        const best: Record<number, SessionDoc> = {};
        for (const s of docs) {
          const no = s.activityNo ?? 0;
          if (!best[no] || (s.totalPoints ?? 0) > (best[no].totalPoints ?? 0)) {
            best[no] = s;
          }
        }
        setBestByActivity(best);
      })
      .finally(() => setLoading(false));
  }, [teamId]);

  if (loading) return <View style={s.loading}><ActivityIndicator color="#6b76ee" /></View>;

  const entries = Object.entries(bestByActivity)
    .map(([no, session]) => ({ no: Number(no), session }))
    .sort((a, b) => a.no - b.no);

  if (entries.length === 0) return null;

  return (
    <View style={s.section}>
      <Text style={[s.sectionTitle, { color: colors.text }]}>Completed Sessions</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
        {entries.map(({ no, session }) => {
          const meta = ACTIVITY_META[no] ?? { title: `Activity ${no}`, emoji: "📊", color: "#6b76ee" };
          const bestScore = Math.max(0, ...session.activitiesCompleted.map((a) => a.score));
          return (
            <Pressable
              key={no}
              style={({ pressed }) => [
                s.card,
                { backgroundColor: colors.surface },
                pressed && s.cardPressed,
              ]}
              onPress={() =>
                router.push({
                  pathname: "/screens/ActivityHistoryScreen",
                  params: { teamId, activityNo: String(no) },
                } as any)
              }
            >
              <View style={[s.cardAccent, { backgroundColor: meta.color + "33" }]}>
                <Text style={s.cardEmoji}>{meta.emoji}</Text>
              </View>
              <Text style={[s.cardTitle, { color: colors.text }]} numberOfLines={2}>{meta.title}</Text>
              <Text style={[s.cardScore, { color: meta.color }]}>
                {(session.totalPoints ?? 0).toFixed(0)}
              </Text>
              <Text style={[s.cardScoreLabel, { color: colors.textSecondary }]}>pts</Text>
              <Text style={[s.cardAttempts, { color: colors.textSecondary }]}>
                Best: {bestScore.toFixed(0)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  loading: { paddingVertical: 16, alignItems: "center" },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "800", marginBottom: 12 },
  row: { gap: 10, paddingBottom: 4 },
  card: {
    width: 130,
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardPressed: { opacity: 0.82, transform: [{ scale: 0.97 }] },
  cardAccent: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  cardEmoji: { fontSize: 26 },
  cardTitle: { fontSize: 12, fontWeight: "700", textAlign: "center", lineHeight: 16 },
  cardScore: { fontSize: 28, fontWeight: "900", lineHeight: 32, marginTop: 4 },
  cardScoreLabel: { fontSize: 11, fontWeight: "600", marginTop: -2 },
  cardAttempts: { fontSize: 11, marginTop: 2 },
});
