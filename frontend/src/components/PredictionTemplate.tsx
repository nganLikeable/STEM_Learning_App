import { useLocalSearchParams, useRouter } from "expo-router";
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
  const { journeyData } = useLocalSearchParams<{ journeyData?: string }>();

  console.log(journeyData);

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
              <View style={styles.cardTopRow}>
                <Text style={styles.cardNumber}>0{d.id}</Text>
              </View>
              <Text style={styles.buttonTitle}>{d.title}</Text>
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
    borderColor: "#D7E0EE",
    borderRadius: 18,
    padding: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 2,
    gap: 10,
  },

  selectedButton: {
    borderColor: "#3977fd",
    backgroundColor: "#EFF6FF",
    shadowOpacity: 0.12,
    transform: [{ translateY: -1 }],
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cardNumber: {
    fontSize: 13,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 1.4,
  },

  buttonTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: 22,
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
