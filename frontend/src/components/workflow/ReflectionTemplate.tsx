import { useAppTheme } from "@/hooks/useAppTheme";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ReflectionTemplateProps {
  title?: string;
  prompt?: string;
  onSave: (reflection: string) => void;
}

export default function ReflectionTemplate({
  title = "Activity Reflection",
  prompt = "What did you learn from this activity?",
  onSave,
}: ReflectionTemplateProps) {
  const { colors, isDark } = useAppTheme();
  const [reflection, setReflection] = useState("");
  const canSave = reflection.trim().length > 0;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.primary }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
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
            <Text style={s.heroEmoji}>📝</Text>
            <Text style={s.heroTitle}>{title}</Text>
          </LinearGradient>

          {/* Card */}
          <View style={[s.card, { backgroundColor: colors.surface }]}>
            <Text style={[s.prompt, { color: colors.text }]}>{prompt}</Text>

            <TextInput
              style={[
                s.input,
                {
                  backgroundColor: colors.primary,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              multiline
              textAlignVertical="top"
              placeholder="Write your thoughts here..."
              placeholderTextColor={colors.textSecondary}
              value={reflection}
              onChangeText={setReflection}
            />

            <Text style={[s.charCount, { color: colors.textSecondary }]}>
              {reflection.trim().length} characters
            </Text>
          </View>

          {/* Save button */}
          <Pressable
            style={({ pressed }) => [
              s.btn,
              !canSave && s.btnDisabled,
              pressed && canSave && s.btnPressed,
            ]}
            onPress={() => canSave && onSave(reflection.trim())}
            disabled={!canSave}
          >
            <Text style={s.btnText}>Save &amp; Continue</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 40 },

  hero: {
    alignItems: "center",
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 24,
    gap: 8,
  },
  heroEmoji: { fontSize: 44 },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    letterSpacing: 0.3,
  },

  card: {
    margin: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    gap: 12,
  },
  prompt: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },
  input: {
    minHeight: 180,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    lineHeight: 22,
  },
  charCount: {
    fontSize: 12,
    textAlign: "right",
  },

  btn: {
    backgroundColor: "#6b76ee",
    borderRadius: 999,
    paddingVertical: 16,
    marginHorizontal: 16,
    alignItems: "center",
    marginTop: 4,
  },
  btnDisabled: { backgroundColor: "#a5b4fc", opacity: 0.6 },
  btnPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  btnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 1,
  },
});
