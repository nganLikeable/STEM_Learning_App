import BreathTracker from "@/src/features/breathTracker/components/BreathTracker";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import JourneyComponent from "../../JourneyComponent";

export default function BreathTrackerScreen() {

  

  return (
    <SafeAreaView style={styles.container}>
      <BreathTracker />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
});
