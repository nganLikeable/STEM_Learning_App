import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useState } from "react";
import {
  Button,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface BaseVideoPreviewProps {
  videoUri: string;
  onRetake: () => void;
  onProceed: (duration: number) => void;
}

interface SpeedButtonProps {
  speed: number;
  onChange: (speed: number) => void;
}

const speedRates = [0.25, 0.5, 0.75, 1.0];

export function SpeedButton({ speed, onChange }: SpeedButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  return (
    <TouchableOpacity
      style={[styles.speedButton, isPressed && styles.speedButtonActive]}
      onPress={() => onChange(speed)}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      activeOpacity={0.7}
    >
      <Text style={styles.speedText}>{speed}x</Text>
    </TouchableOpacity>
  );
}

export default function BaseVideoPreview({
  videoUri,
  onRetake,
  onProceed,
}: BaseVideoPreviewProps) {
  const [currentSpeed, setCurrentSpeed] = useState(1.0);
  // marked times to extract for calculation input - length of 2
  const [markedTimes, setMarkedTimes] = useState(new Array(2).fill(0));
  const [duration, setDuration] = useState<number | null>(null);
  // control modal display for proceeding and marking time
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Setup Video Player
  const player = useVideoPlayer(videoUri, (player) => {
    player.loop = true;
    player.play();
  });

  const isPlaying = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  const changeSpeed = (speed: number) => {
    player.playbackRate = speed;
    setCurrentSpeed(speed);
  };

  const togglePlayPause = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  // Setup Zoom function
  // Zoom Value
  const [zoomLevel, setZoomLevel] = useState(1);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  // Pan Value
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      // Allow zooming up to 10x (remove limit if you want unlimited)
      if (scale.value < 3) {
        scale.value = withSpring(1);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
      if (scale.value > 12) {
        scale.value = withSpring(12);
      }
      savedScale.value = scale.value;
    });

  // Pan gesture for moving zoomed video
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // Combine gestures
  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  // Animated style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const formatTime = (seconds: number) => {
    return (Math.round(seconds * 100) / 100).toFixed(2);
  };

  const markedCount = markedTimes.filter((t) => t > 0).length;
  const markButtonLabel =
    markedCount === 0
      ? "📍 Mark First Time"
      : markedCount === 1
        ? "📍 Mark Second Time"
        : "📍 Mark Time";

  const { currentTime } = useEvent(player, "timeUpdate", {
    currentTime: 0,
    currentLiveTimestamp: null,
    currentOffsetFromLive: null,
    bufferedPosition: 0,
  });

  const getDuration = () => {
    setDuration(
      markedTimes.reduce((x: number, y: number) => Math.abs(x - y), 0),
    );
  };

  const handleProceed = () => {
    setIsModalOpen(false);
    // pause video on unmount - moving to next screen
    try {
      player.pause();
    } catch {}
    onProceed(duration !== null ? duration : 0);
  };

  // remove the first item and append the latest marked time to the end
  const handleMarkTime = () => {
    const t = player.currentTime;
    setMarkedTimes((prev) => {
      // remove the first item by slicing
      const remainingTime = prev.slice(1);
      const next = [...remainingTime, t];

      const validCount = next.filter((v) => v > 0).length;

      // if theres already 2 items in marked time, show modal
      if (validCount === 2) {
        const d = Math.abs(next[0] - next[1]);
        setDuration(d);
        setIsModalOpen(true);
        player.pause();
        console.log(duration);
      }
      return next;
    });
    // print
    markedTimes.map((t) => console.log(t));
  };

  const handleRemark = () => {
    setIsModalOpen(false);
    setMarkedTimes(new Array(2).fill(0));
    player.play();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.videoWrapper}>
        <GestureDetector gesture={composedGesture}>
          <Animated.View style={[{ flex: 1 }, animatedStyle]}>
            <VideoView
              style={styles.fullPreview}
              player={player}
              fullscreenOptions={{ enable: false }}
              allowsPictureInPicture={false}
            />
          </Animated.View>
        </GestureDetector>
      </View>

      {/* speed buttons */}
      <View style={styles.speedButtonsContainer}>
        {speedRates.map((speed: number) => (
          <SpeedButton
            speed={speed}
            onChange={() => changeSpeed(speed)}
            key={speed}
          />
        ))}
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity onPress={togglePlayPause} style={styles.playPauseBtn}>
          <Text style={styles.playPauseText}>
            {player.playing ? "⏸️" : "▶️"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleMarkTime} style={styles.markBtn}>
          <Text style={styles.markBtnText}>{markButtonLabel}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.markStatusRow}>
        <View
          style={[
            styles.markStatusCard,
            markedTimes[0] > 0 && styles.markStatusCardDone,
          ]}
        >
          <Text style={styles.markStatusLabel}>Mark 1</Text>
          <Text style={styles.markStatusValue}>
            {markedTimes[0] > 0 ? `${formatTime(markedTimes[0])}s` : "--"}
          </Text>
        </View>

        <View
          style={[
            styles.markStatusCard,
            markedTimes[1] > 0 && styles.markStatusCardDone,
          ]}
        >
          <Text style={styles.markStatusLabel}>Mark 2</Text>
          <Text style={styles.markStatusValue}>
            {markedTimes[1] > 0 ? `${formatTime(markedTimes[1])}s` : "--"}
          </Text>
        </View>
      </View>

      {/* bottom controls */}
      <View style={styles.previewControls}>
        <Button title="Discard & Retake" onPress={onRetake} />
      </View>

      {/* mark time modal */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Time Marked</Text>
            <Text style={styles.modalTime}>
              {duration !== null ? `${formatTime(duration)}s` : "--"}
            </Text>
            <Text style={styles.modalSubtitle}>
              Use this as your experiment time?
            </Text>

            <TouchableOpacity style={styles.proceedBtn} onPress={handleProceed}>
              <Text style={styles.proceedBtnText}>✅ Use this time</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.remarkBtn} onPress={handleRemark}>
              <Text style={styles.remarkBtnText}>🔄 Remark</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  fullPreview: {
    flex: 1,
    backgroundColor: "#000",
  },
  speedButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  previewControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "rgba(0,0,0,0.8)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    gap: 10,
  },
  speedButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    minWidth: 50,
    alignItems: "center",
  },
  speedButtonActive: {
    backgroundColor: "rgba(100,200,255,0.6)",
    borderColor: "rgba(100,200,255,1)",
  },
  speedText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  playPauseBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  playPauseText: {
    color: "#fff",
    fontSize: 16,
  },
  videoWrapper: {
    flex: 1,
    position: "relative",
  },
  liveTimestamp: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  liveTimestampText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  markStatusRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  markStatusCard: {
    flex: 1,
    maxWidth: 180,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  markStatusCardDone: {
    borderColor: "rgba(76,175,80,0.9)",
    backgroundColor: "rgba(76,175,80,0.15)",
  },
  markStatusLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "600",
  },
  markStatusValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
  },
  markBtn: {
    backgroundColor: "rgba(79,195,247,0.15)",
    borderWidth: 1,
    borderColor: "rgba(79,195,247,0.5)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  markBtnText: {
    color: "#4fc3f7",
    fontWeight: "600",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#1e1e1e",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 32,
    alignItems: "center",
    gap: 12,
  },
  modalTitle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  modalTime: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "800",
    letterSpacing: 2,
  },
  modalSubtitle: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
    marginBottom: 8,
  },
  proceedBtn: {
    width: "100%",
    backgroundColor: "#4caf50",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  proceedBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  remarkBtn: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  remarkBtnText: {
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
    fontSize: 15,
  },
  displayedSeconds: {
    fontSize: 20,
    color: "rgba(255,255,255,0.7)",
  },
});
