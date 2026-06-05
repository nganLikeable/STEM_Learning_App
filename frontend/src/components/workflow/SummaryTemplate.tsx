import { useAppTheme } from "@/hooks/useAppTheme";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// ── Stat row ─────────────────────────────────────────────────────────────────

interface StatRowProps {
  label: string;
  value: string | number;
  unit?: string;
  highlight?: boolean;
}

export function StatRow({ label, value, unit, highlight }: StatRowProps) {
  const { colors } = useAppTheme();
  return (
    <View style={[s.statRow, { borderBottomColor: colors.border }]}>
      <Text style={[s.statLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[s.statValue, { color: colors.text }, highlight && s.statValueHighlight]}>
        {value}{unit ? ` ${unit}` : ""}
      </Text>
    </View>
  );
}

// ── Section card ─────────────────────────────────────────────────────────────

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export function Section({ title, children }: SectionProps) {
  const { colors } = useAppTheme();
  return (
    <View style={[s.section, { backgroundColor: colors.surface }]}>
      <Text style={[s.sectionTitle, { borderBottomColor: colors.border }]}>{title}</Text>
      <View style={s.sectionBody}>{children}</View>
    </View>
  );
}

// ── Attempt row ───────────────────────────────────────────────────────────────

interface AttemptRowProps {
  attempt: number;
  score: number;
  isBest?: boolean;
  unit?: string;
}

export function AttemptRow({ attempt, score, isBest, unit = "pts" }: AttemptRowProps) {
  const { colors } = useAppTheme();
  return (
    <View style={[s.attemptRow, { borderBottomColor: colors.border }]}>
      <Text style={[s.attemptLabel, { color: colors.textSecondary }]}>Attempt {attempt}</Text>
      <View style={s.attemptRight}>
        {isBest && <Text style={s.bestBadge}>BEST</Text>}
        <Text style={[s.attemptScore, { color: colors.text }, isBest && s.attemptScoreBest]}>
          {score}{unit === "°" ? unit : ` ${unit}`}
        </Text>
      </View>
    </View>
  );
}

// ── Main template ─────────────────────────────────────────────────────────────

interface SummaryTemplateProps {
  activityTitle: string;
  emoji: string;
  totalPoints: number;
  reflection?: string;
  children: React.ReactNode;
}

export default function SummaryTemplate({
  activityTitle,
  emoji,
  totalPoints,
  reflection,
  children,
}: SummaryTemplateProps) {
  const { colors } = useAppTheme();
  return (
    <ScrollView
      style={[s.screen, { backgroundColor: colors.primary }]}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Points hero */}
      <LinearGradient
        colors={["#6b76ee", "#9b59b6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.hero}
      >
        <Text style={s.heroEmoji}>{emoji}</Text>
        <Text style={s.heroTitle}>{activityTitle}</Text>
        <Text style={s.heroSubtitle}>TOTAL POINTS</Text>
        <Text style={s.heroPoints}>{totalPoints.toFixed(2)}</Text>
        <Text style={s.heroPtLabel}>pts</Text>
      </LinearGradient>

      <View style={s.body}>
        {children}

        {/* Reflection */}
        {reflection ? (
          <View style={[s.section, { backgroundColor: colors.surface }]}>
            <Text style={[s.sectionTitle, { borderBottomColor: colors.border }]}>Reflection</Text>
            <View style={s.sectionBody}>
              <Text style={[s.reflectionText, { color: colors.text }]}>{reflection}</Text>
            </View>
          </View>
        ) : null}

        <HomeButton />
      </View>
    </ScrollView>
  );
}

// ── Home button ───────────────────────────────────────────────────────────────

function HomeButton() {
  const router = useRouter();
  return (
    <Pressable
      style={({ pressed }) => [s.homeBtn, pressed && s.homeBtnPressed]}
      onPress={() => router.replace("/(tabs)")}
    >
      <Text style={s.homeBtnText}>Back to Home</Text>
    </Pressable>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: 40 },

  hero: {
    alignItems: "center",
    paddingTop: 52,
    paddingBottom: 36,
    paddingHorizontal: 24,
    gap: 4,
  },
  heroEmoji: { fontSize: 48, marginBottom: 4 },
  heroTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  heroSubtitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 2,
    marginTop: 12,
  },
  heroPoints: {
    fontSize: 72,
    fontWeight: "900",
    color: "#fff",
    lineHeight: 80,
  },
  heroPtLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
  },

  body: { padding: 16, gap: 12 },

  section: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#6b76ee",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  sectionBody: { paddingHorizontal: 16, paddingVertical: 8 },

  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  statLabel: { fontSize: 14, flex: 1 },
  statValue: { fontSize: 15, fontWeight: "700" },
  statValueHighlight: { color: "#6b76ee", fontSize: 17 },

  attemptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  attemptLabel: { fontSize: 14 },
  attemptRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  bestBadge: {
    fontSize: 9,
    fontWeight: "800",
    color: "#fff",
    backgroundColor: "#6b76ee",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    letterSpacing: 0.5,
  },
  attemptScore: { fontSize: 15, fontWeight: "700" },
  attemptScoreBest: { color: "#6b76ee" },

  reflectionText: {
    fontSize: 14,
    lineHeight: 22,
    paddingVertical: 8,
  },

  homeBtn: {
    backgroundColor: "#6b76ee",
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  homeBtnPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  homeBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 1,
  },
});
