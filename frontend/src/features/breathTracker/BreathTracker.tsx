import { useAppTheme } from "@/hooks/useAppTheme";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import useBreathTracker from "./useBreathTracker";

interface Props {
  onSave?: (bpm: number) => void;
}

export default function BreathTracker({ onSave }: Props) {
  const { colors } = useAppTheme();
  const { bpm, x, y, z, stop, start, isRecording } = useBreathTracker();
  const [finalBpm, setFinalBpm] = useState<number | null>(null);

  const handleStop = () => {
    const recorded = stop();
    setFinalBpm(recorded);
  };

  const handleSave = () => {
    if (finalBpm !== null) onSave?.(finalBpm);
  };

  const displayBpm = finalBpm !== null ? finalBpm : bpm;

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <Text style={styles.eyebrow}>BREATHING PACE TRAINER</Text>
      <Text style={[styles.bpm, { color: colors.text }]}>{displayBpm}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>breaths / min</Text>

      {/* for debugging */}
      <Text style={[styles.debug, { color: colors.textSecondary }]}>
        x: {x.toFixed(3)} y: {y.toFixed(3)} z: {z.toFixed(3)}
      </Text>

      <View style={styles.buttons}>
        <Pressable
          style={[styles.btn, styles.btnSecondary, isRecording && styles.btnDisabled]}
          onPress={start}
          disabled={isRecording || finalBpm !== null}
        >
          <Text style={styles.btnTextSecondary}>Start</Text>
        </Pressable>

        <Pressable
          style={[styles.btn, styles.btnSecondary, !isRecording && styles.btnDisabled]}
          onPress={handleStop}
          disabled={!isRecording}
        >
          <Text style={styles.btnTextSecondary}>Stop</Text>
        </Pressable>
      </View>

      {finalBpm !== null && onSave && (
        <Pressable
          style={({ pressed }) => [styles.btn, styles.btnPrimary, pressed && styles.btnPressed]}
          onPress={handleSave}
        >
          <Text style={styles.btnTextPrimary}>Record &amp; Continue</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 4,
    color: "#475569",
    textAlign: "center",
    marginBottom: 8,
  },
  bpm: { fontSize: 80, fontWeight: "200" },
  label: { fontSize: 16, marginTop: 4 },
  debug: {
    fontSize: 11,
    marginTop: 32,
    fontVariant: ["tabular-nums"],
    opacity: 0.4,
  },
  buttons: { flexDirection: "row", gap: 12, marginTop: 16 },
  btn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  btnPrimary: { backgroundColor: "#facc15" },
  btnSecondary: { backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#334155" },
  btnDisabled: { opacity: 0.35 },
  btnPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  btnTextPrimary: { fontSize: 14, fontWeight: "800", color: "#0f172a", letterSpacing: 1.5 },
  btnTextSecondary: { fontSize: 14, fontWeight: "600", color: "#f1f5f9" },
});
