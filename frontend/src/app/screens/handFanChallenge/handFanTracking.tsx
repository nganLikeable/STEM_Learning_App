import React, { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BaseCamera from '@/src/features/parachute/components/BaseCamera';
import HandFanVideoPreview from './HandFanVideoPreview';

export default function HandFanTracking() {
  const [video, setVideo] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {video ? (
        <HandFanVideoPreview
          videoUri={video}
          onRetake={() => setVideo(null)}
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
