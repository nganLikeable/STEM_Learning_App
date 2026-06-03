import { getActiveSession } from "@/src/services/session";
import { useTeamStore } from "@/src/store/team-store";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
interface Design {
  id: number;
  title: string;
  description?: string; // applied to hardcoded (predefined ones)
}
interface PredictionTemplateProps {
  activityId: number;
  activityName: string;
  title: string;
  description: string;
  designs?: Design[]; // applied to activities requiring user inputs for designs
  fallbackDesigns?: Design[]; // applied too activities with predefined acts
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
  const [prediction, setPrediction] = useState<number | null>(null);
  const { teamId } = useTeamStore();
  const [resolvedDesigns, setResolvedDesigns] = useState<Design[]>(
    designs ?? fallbackDesigns ?? [],
  );

  // fetch design inputs if applicable
  useEffect(() => {
    if (designs) {
      setResolvedDesigns(designs);
      return;
    }

    if (!fallbackDesigns) {
      setResolvedDesigns([]);
      return;
    }

    let cancelled = false;

    const loadDesigns = async () => {
      if (!teamId) {
        setResolvedDesigns(fallbackDesigns);
        return;
      }

      try {
        // get active session to fetch the right inputs by teamId and activityId
        const activeSession = await getActiveSession(teamId);
        const savedDesigns = activeSession?.designs ?? [];

        if (cancelled) return;

        if (savedDesigns.length === 3) {
          setResolvedDesigns(
            savedDesigns.map((design) => ({
              id: design.id,
              title: design.title,
            })),
          );
        } else {
          setResolvedDesigns(fallbackDesigns);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setResolvedDesigns(fallbackDesigns);
      }
    };

    loadDesigns();

    return () => {
      cancelled = true;
    };
  }, [activityId, designs, fallbackDesigns, teamId]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.activityText}>Activity {activityId}</Text>
        <Text style={styles.activityName}>{activityName}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Prediction</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      <View style={styles.buttonContainer}>
        {resolvedDesigns.map((d, index) => {
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
                <Text style={styles.cardNumber}>Design {d.id}</Text>
              </View>
              <Text style={styles.buttonTitle}>{d.title}</Text>
              {!titleOnly && d.description ? (
                <Text style={styles.buttonSubtitle}>{d.description}</Text>
              ) : null}
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

  buttonSubtitle: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
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
