import { useAppTheme } from "@/hooks/useAppTheme";
import { LinearGradient } from "expo-linear-gradient";
import { getActiveSession } from "@/src/services/session";
import { useTeamStore } from "@/src/store/team-store";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Design {
  id: number;
  title: string;
  description?: string;
}

interface PredictionTemplateProps {
  activityId: number;
  activityName: string;
  title: string;
  description: string;
  designs?: Design[];
  fallbackDesigns?: Design[];
  onSave: (prediction: number) => void;
  titleOnly?: boolean;
}

export default function PredictionTemplate({
  activityId,
  activityName,
  title,
  description,
  designs,
  fallbackDesigns,
  onSave,
  titleOnly = false,
}: PredictionTemplateProps) {
  const { colors } = useAppTheme();
  const [prediction, setPrediction] = useState<number | null>(null);
  const { teamId } = useTeamStore();
  const [resolvedDesigns, setResolvedDesigns] = useState<Design[]>(
    designs ?? fallbackDesigns ?? [],
  );

  useEffect(() => {
    if (designs) { setResolvedDesigns(designs); return; }
    if (!fallbackDesigns) { setResolvedDesigns([]); return; }

    let cancelled = false;
    const loadDesigns = async () => {
      if (!teamId) { setResolvedDesigns(fallbackDesigns); return; }
      try {
        const activeSession = await getActiveSession(teamId, activityId as 1 | 2 | 3 | 4 | 5 | 6 | 7);
        const savedDesigns = activeSession?.designs ?? [];
        if (cancelled) return;
        if (savedDesigns.length === 3) {
          setResolvedDesigns(savedDesigns.map((d) => ({ id: d.id, title: d.title })));
        } else {
          setResolvedDesigns(fallbackDesigns);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setResolvedDesigns(fallbackDesigns);
      }
    };
    loadDesigns();
    return () => { cancelled = true; };
  }, [activityId, designs, fallbackDesigns, teamId]);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.primary }]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <LinearGradient
          colors={["#6b76ee", "#9b59b6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <Text style={s.heroEyebrow}>ACTIVITY {activityId}</Text>
          <Text style={s.heroActivity}>{activityName}</Text>
          <Text style={s.heroTitle}>{title}</Text>
        </LinearGradient>

        {/* Description */}
        <View style={[s.descCard, { backgroundColor: colors.surface }]}>
          <Text style={[s.descText, { color: colors.textSecondary }]}>{description}</Text>
        </View>

        {/* Design options */}
        <View style={s.options}>
          {resolvedDesigns.map((d) => {
            const selected = prediction === d.id;
            return (
              <Pressable
                key={d.id}
                onPress={() => setPrediction(d.id)}
                style={[
                  s.card,
                  { backgroundColor: colors.surface, borderColor: selected ? "#6b76ee" : colors.border },
                  selected && s.cardSelected,
                ]}
              >
                <View style={s.cardTop}>
                  <Text style={[s.cardNum, { color: colors.textSecondary }]}>
                    Option {d.id}
                  </Text>
                  {selected && (
                    <View style={s.checkBadge}>
                      <Text style={s.checkText}>✓</Text>
                    </View>
                  )}
                </View>
                <Text style={[s.cardTitle, { color: colors.text }]}>{d.title}</Text>
                {!titleOnly && d.description ? (
                  <Text style={[s.cardDesc, { color: colors.textSecondary }]}>{d.description}</Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {/* Save */}
        <Pressable
          style={({ pressed }) => [
            s.btn,
            !prediction && s.btnDisabled,
            pressed && prediction != null && s.btnPressed,
          ]}
          onPress={() => prediction != null && onSave(prediction)}
          disabled={prediction == null}
        >
          <Text style={s.btnText}>Confirm Prediction</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 40 },

  hero: {
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 24,
    gap: 4,
    alignItems: "center",
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 3,
    color: "rgba(255,255,255,0.6)",
  },
  heroActivity: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 32,
  },

  descCard: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  descText: { fontSize: 14, lineHeight: 22 },

  options: { paddingHorizontal: 16, gap: 12, marginBottom: 16 },

  card: {
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 16,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardSelected: {
    shadowColor: "#6b76ee",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardNum: { fontSize: 11, fontWeight: "800", letterSpacing: 1.5 },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#6b76ee",
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: { fontSize: 12, fontWeight: "800", color: "#fff" },
  cardTitle: { fontSize: 16, fontWeight: "700", lineHeight: 22 },
  cardDesc: { fontSize: 13, lineHeight: 20 },

  btn: {
    backgroundColor: "#6b76ee",
    borderRadius: 999,
    paddingVertical: 16,
    marginHorizontal: 16,
    alignItems: "center",
  },
  btnDisabled: { backgroundColor: "#a5b4fc", opacity: 0.6 },
  btnPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  btnText: { fontSize: 15, fontWeight: "800", color: "#fff", letterSpacing: 1 },
});
