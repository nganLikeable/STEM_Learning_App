import BaseCamera from "@/src/features/parachute/components/BaseCamera";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import HandFanVideoPreview from "./HandFanVideoPreview";

export default function HandFanTrackingScreen() {
  const [video, setVideo] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const { design, journeyData } = useLocalSearchParams<{
    design?: string;
    journeyData?: string;
  }>();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {video ? (
        <HandFanVideoPreview
          videoUri={video}
          onRetake={() => setVideo(null)}
          design={Number(design) || 1}
          journeyData={journeyData}
        />
      ) : (
        <BaseCamera
          onVideoCaptured={setVideo}
          onReadyChange={setIsCameraReady}
          isCameraReady={isCameraReady}
        />
      )}
    </GestureHandlerRootView>
  );
}
