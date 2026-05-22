import { useRouter } from "expo-router";
import { useState } from "react";
import { Button, Pressable, StyleSheet, Text, View } from "react-native";

interface PredictionTemplateProps {
  activityNo: number;
  activityName: string;
  title: string;
  description: string;
  onSave: (prediction: number) => void;
}

export default function PredictionTemplate({
  activityNo,
  activityName,
  title,
  description,
  onSave,
}: PredictionTemplateProps) {
  const [prediction, setPrediction] = useState<number | null>(null);
  const router = useRouter();

  return (
    <View>
      <View>
        <Text>Activity {activityNo}</Text>
        <Text>{activityName}</Text>
      </View>

      <View>
        <Text>Prediction</Text>
        <Text>{description}</Text>
      </View>

      <View>
        {[1, 2, 3].map((number) => (
          <Pressable
            key={number}
            onPress={() => setPrediction(number)}
            style={styles.predictionButton}
          >
            <Text>{number}</Text>
          </Pressable>
        ))}
      </View>
      <Button
        title="Save prediction"
        onPress={() => {
          if (prediction == null) return;
          onSave(prediction);
          router.push("/screens/parachute/InstructionScreen");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  predictionButton: {
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#3977fd",
  },
});
