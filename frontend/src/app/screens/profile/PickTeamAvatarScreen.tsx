import { useAppTheme } from "@/hooks/useAppTheme";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AvatarPicker from "../../../components/Avatar/AvatarPicker";
import { updateTeamAvatar } from "../../../services/firestore";

export default function PickTeamAvatarScreen() {
  const { colors } = useAppTheme();
  const { teamId } = useLocalSearchParams<{ teamId?: string }>();
  const router = useRouter();

  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!selected || !teamId) return;
    setLoading(true);
    try {
      await updateTeamAvatar(teamId, selected);
      router.replace("/screens/profile/PickUserAvatarScreen");
    } catch (e) {
      console.error("Error saving team avatar", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: colors.primary }]}>
      <LinearGradient
        colors={["#6b76ee", "#9b59b6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.hero}
      >
        <Text style={s.heroEmoji}>🪐</Text>
        <Text style={s.heroTitle}>Choose Your Team Planet</Text>
        <Text style={s.heroSub}>Represent your team's identity</Text>
      </LinearGradient>

      <View style={{ flex: 1 }}>
        <AvatarPicker
          selected={selected}
          onSelect={setSelected}
          category="teamAvatar"
          title="Select Your Team Planet"
        />
      </View>

      <View style={[s.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <Pressable
          onPress={handleSave}
          disabled={!selected || loading}
          style={({ pressed }) => [
            s.btn,
            !selected && s.btnDisabled,
            pressed && selected && { opacity: 0.85 },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.btnText}>
              {selected ? "Confirm Team Planet" : "Pick a planet to continue"}
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  hero: {
    alignItems: "center",
    paddingTop: 28,
    paddingBottom: 24,
    gap: 6,
  },
  heroEmoji: { fontSize: 40 },
  heroTitle: { fontSize: 22, fontWeight: "900", color: "#fff" },
  heroSub: { fontSize: 13, color: "rgba(255,255,255,0.75)" },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  btn: {
    backgroundColor: "#6b76ee",
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
  },
  btnDisabled: { backgroundColor: "#a5b4fc", opacity: 0.6 },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 15, letterSpacing: 1 },
});
