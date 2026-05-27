import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export interface DesignInput {
  id: number;
  title: string;
}

interface DesignInputProps {
  activityId: number;
  activityName: string;
  title: string;
  description: string;
  onSave: (designs: DesignInput[]) => void | Promise<void>; // save to firestore
}

export default function DesignInputTemplate({
  activityId,
  activityName,
  title,
  description,
  onSave,
}: DesignInputProps) {
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

  const handleSave = async () => {
    if (designs.some((design) => !design.title.trim())) return;
    await onSave(designs);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.activityText}>Activity {activityId}</Text>
        <Text style={styles.activityName}>{activityName}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      <View style={styles.form}>
        {designs.map((design) => (
          <View key={design.id} style={styles.card}>
            <Text style={styles.cardTitle}>Design {design.id}</Text>
            <TextInput
              value={design.title}
              onChangeText={(text) => updateDesign(design.id, text)}
              placeholder={`Enter design ${design.id}`}
              placeholderTextColor="#94A3B8"
              style={styles.input}
              multiline
            />
          </View>
        ))}
      </View>

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save designs</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 20,
    paddingBottom: 28,
  },
  header: {
    marginBottom: 20,
  },
  activityText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4B5563",
  },
  activityName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
  },
  section: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#475569",
  },
  form: {
    gap: 12,
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D7E0EE",
    padding: 14,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  input: {
    minHeight: 72,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#3977FD",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});
