import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HumanPerformanceScreen() {
  const router = useRouter();
  const { phase } = useLocalSearchParams<{ phase?: string }>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.kicker}>Human Performance Lab</Text>
        <Text style={styles.title}>Movement Phase {phase ?? "1"}</Text>
        <Text style={styles.description}>
          Follow the guided movement for this phase and observe how the phone
          responds to speed, smoothness, and coordination.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What to do</Text>
          <Text style={styles.cardBody}>
            Keep the phone secure, perform the movement shown in the app, and
            compare the vibration changes across the three phases.
          </Text>
        </View>

        <Pressable style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Back to Journey</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f7fb",
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    gap: 16,
  },
  kicker: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4c9be8",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#14213d",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#475569",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#dbe5f0",
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  cardBody: {
    fontSize: 15,
    lineHeight: 22,
    color: "#475569",
  },
  button: {
    backgroundColor: "#3977fd",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
