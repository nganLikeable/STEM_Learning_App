import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
interface Design {
  id: number;
  title: string;
  description: string;
}
interface PredictionTemplateProps {
  activityNo: number;
  activityName: string;
  title: string;
  description: string;
  designs: Design[];
  onSave: (prediction: number) => void;
}

export default function PredictionTemplate({
  activityNo,
  activityName,
  title,
  description,
  designs,
  onSave,
}: PredictionTemplateProps) {
  const [prediction, setPrediction] = useState<number | null>(null);
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.activityText}>Activity {activityNo}</Text>
        <Text style={styles.activityName}>{activityName}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Prediction</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      <View style={styles.buttonContainer}>
        {designs.map((d, index) => {
          const selected = prediction === d.id;
          return (
            <Pressable
              key={index}
              onPress={() => setPrediction(d.id)}
              style={[
                styles.predictionButton,
                selected && styles.selectedButton,
              ]}
            >
              <Text style={styles.buttonTitle}>{d.title}</Text>
              <Text style={styles.buttonDescription}>{d.description}</Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        style={styles.saveButton}
        onPress={() => {
          if (prediction == null) return;
          onSave(prediction);
        }}
      >
        <Text style={styles.saveButtonText}>Save prediction</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  header: {
    marginBottom: 24,
  },

  activityText: {
    fontSize: 16,
  },

  activityName: {
    fontSize: 24,
    fontWeight: "bold",
  },

  section: {
    marginBottom: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },

  description: {
    fontSize: 16,
  },

  buttonContainer: {
    gap: 12,
    marginBottom: 24,
  },

  predictionButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 14,
  },

  selectedButton: {
    borderColor: "#3977fd",
    backgroundColor: "#eef4ff",
  },

  buttonTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },

  buttonDescription: {
    fontSize: 14,
  },

  saveButton: {
    backgroundColor: "#3977fd",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  saveButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
