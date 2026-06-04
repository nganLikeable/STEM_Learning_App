import BaseCamera from "@/src/features/parachute/components/BaseCamera";
import BaseVideoPreview from "@/src/features/parachute/components/BaseVideoPreview";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VideoRecorderScreen() {
  const [video, setVideo] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const router = useRouter();
  const { journeyData } = useLocalSearchParams<{ journeyData?: string }>();

  // if theres a record, show preview
  if (video) {
    return (
      <SafeAreaView style={styles.container}>
        <BaseVideoPreview
          videoUri={video}
          onProceed={(markedTime) => {
            setVideo(null);
            console.log("Marked time: ", markedTime);
            router.push({
              pathname: "./CalculationScreen",
              params: {
                markedTime: markedTime.toFixed(2),
                video,
                ...(journeyData ? { journeyData } : {}),
              }, // passed to next screen, so that finish at the end of calculation screen can navigate back to the right journey component
            });
          }}
          onRetake={() => setVideo(null)}
        />
      </SafeAreaView>
    );
  }

  // otherwise, show camera screen
  return (
    <SafeAreaView style={styles.container}>
      <BaseCamera
        onVideoCaptured={(uri) => setVideo(uri)}
        onReadyChange={() => setIsCameraReady(true)}
        isCameraReady={isCameraReady}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
