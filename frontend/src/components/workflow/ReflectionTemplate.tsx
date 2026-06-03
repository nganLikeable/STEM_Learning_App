import { Button } from "@react-navigation/elements";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

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
  const [reflection, setReflection] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <Text style={styles.prompt}>{prompt}</Text>

      <TextInput
        style={styles.input}
        multiline
        textAlignVertical="top"
        placeholder="Write your reflection here..."
        value={reflection}
        onChangeText={setReflection}
      />

      <Button
        onPress={() => onSave(reflection.trim())}
        disabled={!reflection.trim()}
      >
        Save Reflection
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F8FAFC",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },
  prompt: {
    fontSize: 16,
    marginBottom: 12,
    color: "#475569",
  },
  input: {
    minHeight: 180,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
    fontSize: 16,
  },
});
