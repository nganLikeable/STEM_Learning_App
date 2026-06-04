import { useAppTheme } from "@/hooks/useAppTheme";
import { ACTIVITY_META } from "@/src/components/CompletedSessionsSection";
import { db } from "@/src/services/firestore";
import { SessionDoc, getCompletedSessionsByTeam } from "@/src/services/session";
import { useVideoPlayer, VideoView } from "expo-video";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ── Video ─────────────────────────────────────────────────────────────────────

function VideoCard({ videoUrl }: { videoUrl: string }) {
  const player = useVideoPlayer(videoUrl, (p) => { p.loop = false; });
  return (
    <VideoView player={player} style={vc.video} contentFit="cover" nativeControls />
  );
}
const vc = StyleSheet.create({ video: { width: "100%", height: 180, borderRadius: 12 } });

// ── Single attempt card ───────────────────────────────────────────────────────

function AttemptCard({
  index,
  score,
  activityId,
  activityNo,
  color,
  isBest,
}: {
  index: number;
  score: number;
  activityId: string;
  activityNo: number;
  color: string;
  isBest: boolean;
}) {
  const { colors } = useAppTheme();
  const [data, setData] = useState<Record<string, any>>({});

  useEffect(() => {
    getDoc(doc(db, "activities", activityId))
      .then((snap) => { if (snap.exists()) setData(snap.data()); })
      .catch(() => {});
  }, [activityId]);

  const fields = getFields(activityNo, data);

  return (
    <View style={[a.card, { backgroundColor: colors.surface, borderColor: isBest ? color : colors.border }]}>
      <View style={a.cardHeader}>
        <Text style={[a.attemptLabel, { color: colors.textSecondary }]}>Attempt {index + 1}</Text>
        {isBest && <View style={[a.bestBadge, { backgroundColor: color }]}><Text style={a.bestText}>BEST</Text></View>}
        <Text style={[a.score, { color }]}>{score.toFixed(0)} pts</Text>
      </View>

      {fields.length > 0 && (
        <View style={[a.statsRow, { borderTopColor: colors.border }]}>
          {fields.map((f) => (
            <View key={f.label} style={a.stat}>
              <Text style={[a.statValue, { color: colors.text }]}>{f.value}</Text>
              <Text style={[a.statLabel, { color: colors.textSecondary }]}>{f.label}</Text>
            </View>
          ))}
        </View>
      )}

      {activityNo === 1 && data.videoUrl && <VideoCard videoUrl={data.videoUrl} />}
    </View>
  );
}

function getFields(activityNo: number, data: Record<string, any>): { label: string; value: string }[] {
  switch (activityNo) {
    case 1: return [
      { label: "Time", value: `${data.experimentData?.time ?? "—"} s` },
      { label: "Distance", value: `${data.experimentData?.distance ?? "—"} m` },
      { label: "Mass", value: `${data.experimentData?.mass ?? "—"} kg` },
    ];
    case 2: return [{ label: "Peak dB", value: `${data.peakSound?.toFixed(1) ?? "—"} dB` }];
    case 4: return [{ label: "Stability", value: `${data.stabilityScore?.toFixed(1) ?? "—"}` }];
    case 5: return [{ label: "Improvement", value: data.improvement != null ? `${data.improvement > 0 ? "+" : ""}${data.improvement}` : "—" }];
    case 6: return [
      { label: "Dominant", value: `${data.dominantMs ?? "—"} ms` },
      { label: "Non-dom.", value: `${data.nonDominantMs ?? "—"} ms` },
      { label: "Accuracy", value: `${data.tracingAccuracy?.toFixed(0) ?? "—"}%` },
    ];
    case 7: return [{ label: "BPM", value: `${data.breathsPerMinute ?? "—"}` }];
    default: return [];
  }
}

const a = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  attemptLabel: { flex: 1, fontSize: 14, fontWeight: "600" },
  bestBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  bestText: { fontSize: 9, fontWeight: "800", color: "#fff", letterSpacing: 0.5 },
  score: { fontSize: 20, fontWeight: "900" },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 24,
  },
  stat: { alignItems: "center", gap: 2 },
  statValue: { fontSize: 15, fontWeight: "700" },
  statLabel: { fontSize: 10, letterSpacing: 0.3 },
});

// ── Session block ─────────────────────────────────────────────────────────────

function SessionBlock({
  session,
  index,
  activityNo,
  color,
  isBestSession,
}: {
  session: SessionDoc;
  index: number;
  activityNo: number;
  color: string;
  isBestSession: boolean;
}) {
  const { colors } = useAppTheme();
  const blockColor = "#6b76ee";
  const bestAttemptIdx = session.activitiesCompleted.length > 0
    ? session.activitiesCompleted.reduce((max, cur, i, arr) =>
        cur.score > arr[max].score ? i : max, 0)
    : -1;

  return (
    <View style={[b.block, { backgroundColor: colors.surface, borderLeftColor: blockColor }]}>
      {/* Coloured top bar */}
      <View style={[b.blockTopBar, { backgroundColor: blockColor }]}>
        <Text style={b.sessionLabel}>Session {index + 1}</Text>
        {isBestSession && (
          <View style={b.topBadge}>
            <Text style={b.topBadgeText}>⭐ TOP SESSION</Text>
          </View>
        )}
        <Text style={b.totalPts}>
          {(session.totalPoints ?? 0).toFixed(0)} pts
        </Text>
      </View>

      <View style={b.blockBody}>
        {session.reflection && (
          <View style={[b.reflectionBox, { backgroundColor: blockColor + "18", borderColor: blockColor + "55" }]}>
            <Text style={[b.reflectionLabel, { color: blockColor }]}>💬 Reflection</Text>
            <Text style={[b.reflectionText, { color: colors.text }]}>{session.reflection}</Text>
          </View>
        )}
        {session.activitiesCompleted.map((act, i) => (
          <AttemptCard
            key={act.activityId}
            index={i}
            score={act.score}
            activityId={act.activityId}
            activityNo={activityNo}
            color={color}
            isBest={i === bestAttemptIdx}
          />
        ))}
      </View>
    </View>
  );
}

const b = StyleSheet.create({
  block: {
    borderRadius: 18,
    overflow: "hidden",
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  blockTopBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  blockBody: { padding: 12, gap: 10 },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  sessionLabel: { fontSize: 15, fontWeight: "800", color: "#fff", flex: 1 },
  topBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  topBadgeText: { fontSize: 10, fontWeight: "800", color: "#fff", letterSpacing: 0.5 },
  totalPts: { fontSize: 16, fontWeight: "900", color: "#fff" },
  attempts: { gap: 10 },
  reflectionBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  reflectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  reflectionText: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: "italic",
  },
});

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ActivityHistoryScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { teamId, activityNo: activityNoStr } = useLocalSearchParams<{
    teamId: string;
    activityNo: string;
  }>();
  const activityNo = Number(activityNoStr);
  const meta = ACTIVITY_META[activityNo] ?? { title: `Activity ${activityNo}`, emoji: "📊", color: "#6b76ee" };

  const [sessions, setSessions] = useState<SessionDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamId || !activityNo) return;
    getCompletedSessionsByTeam(teamId, activityNo as 1 | 2 | 3 | 4 | 5 | 6 | 7)
      .then((docs) => setSessions(docs.sort((a, b) => (b.totalPoints ?? 0) - (a.totalPoints ?? 0))))
      .finally(() => setLoading(false));
  }, [teamId, activityNo]);

  const bestSessionIdx = sessions.length > 0
    ? sessions.reduce((max, cur, i, arr) =>
        (cur.totalPoints ?? 0) > (arr[max].totalPoints ?? 0) ? i : max, 0)
    : -1;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.primary }]}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={12}>
          <Text style={[s.backText, { color: colors.text }]}>←</Text>
        </Pressable>
        <Text style={s.headerEmoji}>{meta.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[s.headerTitle, { color: colors.text }]}>{meta.title}</Text>
          <Text style={[s.headerSub, { color: colors.textSecondary }]}>
            {sessions.length} session{sessions.length !== 1 ? "s" : ""} completed
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator color={meta.color} size="large" /></View>
      ) : sessions.length === 0 ? (
        <View style={s.center}>
          <Text style={[s.empty, { color: colors.textSecondary }]}>No completed sessions yet.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {sessions.map((session, i) => (
            <SessionBlock
              key={session.id}
              session={session}
              index={i}
              activityNo={activityNo}
              color={meta.color}
              isBestSession={i === bestSessionIdx}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
  },
  backBtn: { paddingRight: 4 },
  backText: { fontSize: 24, fontWeight: "300" },
  headerEmoji: { fontSize: 30 },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  headerSub: { fontSize: 12, marginTop: 1 },
  scroll: { padding: 16, gap: 24, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { fontSize: 15 },
});
