import { useAppTheme } from "@/hooks/useAppTheme";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const hehheMascot = require("../../../assets/images/mascot/hehhe.png");

export interface DesignInput {
  id: number;
  title: string;
}

interface DesignInputProps {
  activityId: number;
  activityName: string;
  title: string;
  description: string;
  onSave: (designs: DesignInput[]) => void | Promise<void>;
}

export default function DesignInputTemplate({
  activityId,
  activityName,
  title,
  description,
  onSave,
}: DesignInputProps) {
  const { colors } = useAppTheme();
  const [designs, setDesigns] = useState<DesignInput[]>([
    { id: 1, title: "" },
    { id: 2, title: "" },
    { id: 3, title: "" },
  ]);

  const updateDesign = (id: number, titleValue: string) => {
    setDesigns((current) =>
      current.map((design) =>
        design.id === id ? { ...design, title: titleValue } : design,
      ),
    );
  };

  const allFilled = designs.every((d) => d.title.trim().length > 0);

  const handleSave = async () => {
    if (!allFilled) return;
    await onSave(designs);
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.primary }]}>
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={["#6b76ee", "#9b59b6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <Image source={hehheMascot} style={s.mascot} resizeMode="contain" />
          <Text style={s.heroEyebrow}>ACTIVITY {activityId}</Text>
          <Text style={s.heroActivity}>{activityName}</Text>
          <Text style={s.heroTitle}>{title}</Text>
        </LinearGradient>

        {/* Description */}
        <View style={[s.descCard, { backgroundColor: colors.surface }]}>
          <Text style={[s.description, { color: colors.textSecondary }]}>{description}</Text>
        </View>

        {/* Design inputs */}
        <View style={s.form}>
          {designs.map((design) => (
            <View key={design.id} style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={s.cardHeader}>
                <View style={s.cardNumBadge}>
                  <Text style={s.cardNumText}>{design.id}</Text>
                </View>
                <Text style={[s.cardTitle, { color: colors.text }]}>Design {design.id}</Text>
              </View>
              <TextInput
                value={design.title}
                onChangeText={(text) => updateDesign(design.id, text)}
                placeholder={`Describe design ${design.id}…`}
                placeholderTextColor={colors.textSecondary}
                style={[
                  s.input,
                  {
                    backgroundColor: colors.primary,
                    borderColor: design.title.trim() ? "#6b76ee55" : colors.border,
                    color: colors.text,
                  },
                ]}
                multiline
                textAlignVertical="top"
              />
            </View>
          ))}
        </View>

        {/* Save */}
        <Pressable
          style={({ pressed }) => [
            s.saveBtn,
            !allFilled && s.saveBtnDisabled,
            pressed && allFilled && { opacity: 0.85 },
          ]}
          onPress={handleSave}
          disabled={!allFilled}
        >
          <Text style={s.saveBtnText}>Save Designs</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 40 },

  hero: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 28,
    paddingHorizontal: 24,
    gap: 4,
  },
  mascot: { width: 80, height: 80, marginBottom: 4 },
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
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 28,
  },

  descCard: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  description: { fontSize: 14, lineHeight: 22 },

  form: { paddingHorizontal: 16, gap: 12, marginTop: 8, marginBottom: 16 },

  card: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 10,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardNumBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#6b76ee",
    alignItems: "center",
    justifyContent: "center",
  },
  cardNumText: { fontSize: 14, fontWeight: "900", color: "#fff" },
  cardTitle: { fontSize: 15, fontWeight: "700" },

  input: {
    minHeight: 72,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    lineHeight: 22,
  },

  saveBtn: {
    backgroundColor: "#6b76ee",
    borderRadius: 999,
    paddingVertical: 16,
    marginHorizontal: 16,
    alignItems: "center",
  },
  saveBtnDisabled: { backgroundColor: "#a5b4fc", opacity: 0.6 },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "800", letterSpacing: 1 },
});
