/**
 * dB SPL Meter using expo-av
 *
 * Prerequisites:
 *   npx expo install expo-av
 *
 * iOS:  Add to app.json → expo.ios.infoPlist:
 *   "NSMicrophoneUsageDescription": "Used to measure sound levels"
 * Android: expo-av handles RECORD_AUDIO permission automatically
 *
 * Note: dB SPL is approximated by adding DB_CALIBRATION_OFFSET to the raw
 * dBFS value from the microphone. Accuracy varies by device.
 */

import { useTeamStore } from "@/src/store/team-store";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Constants ────────────────────────────────────────────────────────────────

// Mobile mics report dBFS (−160 to 0). Adding ~90 approximates dB SPL.
const DB_CALIBRATION_OFFSET = 86;

// Display range in dB SPL
const MIN_DB = 30;
const MAX_DB = 100;

// Tick marks along the meter bar (dB SPL)
const TICKS = [40, 55, 70, 85, 100];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dbfsToSpl(dbfs: number): number {
  return dbfs + DB_CALIBRATION_OFFSET;
}

// Map a dB SPL value to a 0–1 fill ratio for the bar
function dbToRatio(db: number): number {
  const clamped = Math.min(Math.max(db, MIN_DB), MAX_DB);
  return (clamped - MIN_DB) / (MAX_DB - MIN_DB);
}

// Green → yellow → red based on real-world dB SPL thresholds
function dbToColor(db: number): string {
  if (db < 60) return "#4ade80"; // green  — quiet / safe
  if (db < 85) return "#facc15"; // yellow — moderate
  return "#ef4444"; // red    — loud / risk of hearing damage
}

// Human-readable label for the current level
function dbToLabel(db: number): string {
  if (db < 45) return "Very Quiet";
  if (db < 60) return "Quiet";
  if (db < 70) return "Moderate";
  if (db < 85) return "Loud";
  return "Very Loud";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SoundMeasureTracking() {
  const [db, setDb] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const meterAnim = useRef(new Animated.Value(0)).current;

  const { teamId } = useTeamStore();

  const { journeyData } = useLocalSearchParams<{ journeyData?: string }>();

  function animateBar(ratio: number) {
    Animated.timing(meterAnim, {
      toValue: ratio,
      duration: 80,
      useNativeDriver: false,
    }).start();
  }

  const recorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });

  // useAudioRecorderState polls the recorder every 100 ms and returns RecorderState
  // RecorderState.metering is the dBFS level when isMeteringEnabled is true
  const recorderState = useAudioRecorderState(recorder, 100);
  const [peakDb, setPeakDb] = useState(0);

  useEffect(() => {
    if (isRecording && recorderState.metering !== undefined) {
      const spl = dbfsToSpl(recorderState.metering);

      setDb(spl);
      setPeakDb((prev) => Math.max(prev, spl));

      animateBar(dbToRatio(spl));
    }
  }, [recorderState.metering, isRecording]);
  // ── Start ──────────────────────────────────────────────────────────────────
  async function startRecording() {
    try {
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) {
        console.warn("Microphone permission denied");
        return;
      }
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setPeakDb(0); // reset
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  }

  // ── Stop ───────────────────────────────────────────────────────────────────
  async function stopRecording() {
    try {
      await recorder.stop();
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: false,
      });
    } catch (err) {
      console.error("Failed to stop recording:", err);
    }
    setIsRecording(false);
    setDb(null);
    animateBar(0);
  }

  // save to firestore
  async function finishAttempt() {
    try {
      if (!teamId) throw new Error("Missing teamId.");

      console.log("Result saved:", peakDb);
    } catch (err) {
      console.error("Failed to save result:", err);
    }
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const displayDb = db !== null ? db.toFixed(1) : "—";
  const barColor = db !== null ? dbToColor(db) : "#334155";
  const levelLabel = db !== null ? dbToLabel(db) : "Press Start";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <View style={styles.container}>
        {/* Title */}
        <Text style={styles.title}>Sound Level Meter</Text>
        <Text style={styles.subtitle}>
          Live microphone — dB SPL (estimated)
        </Text>

        {/* Numeric readout */}
        <View style={styles.readoutBox}>
          <Text style={[styles.dbValue, { color: barColor }]}>{displayDb}</Text>
          <Text style={styles.dbUnit}>dB</Text>
          <Text style={[styles.levelLabel, { color: barColor }]}>
            {levelLabel}
          </Text>
          <View style={styles.peakBox}>
            <Text style={styles.peakLabel}>PEAK SOUND LEVEL</Text>
            <Text style={styles.peakValue}>{peakDb.toFixed(1)} dB</Text>
          </View>
        </View>

        {/* Meter bar */}
        <View style={styles.meterTrack}>
          <Animated.View
            style={[
              styles.meterFill,
              {
                width: meterAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
                backgroundColor: barColor,
              },
            ]}
          />

          {TICKS.map((tick) => (
            <View
              key={tick}
              style={[
                styles.tick,
                { left: `${dbToRatio(tick) * 100}%` as any },
              ]}
            >
              <View style={styles.tickLine} />
              <Text style={styles.tickLabel}>{tick}</Text>
            </View>
          ))}
        </View>

        {/* Scale endpoints */}
        <View style={styles.scaleRow}>
          <Text style={styles.scaleLabel}>{MIN_DB} dB</Text>
          <Text style={styles.scaleLabel}>{MAX_DB} dB</Text>
        </View>

        {/* Reference guide */}
        <View style={styles.referenceBox}>
          <Text style={styles.referenceTitle}>Reference levels</Text>
          <View style={styles.referenceRow}>
            <View
              style={[styles.referenceDot, { backgroundColor: "#4ade80" }]}
            />
            <Text style={styles.referenceText}>
              {"< 60 dB — Quiet (library, whisper)"}
            </Text>
          </View>
          <View style={styles.referenceRow}>
            <View
              style={[styles.referenceDot, { backgroundColor: "#facc15" }]}
            />
            <Text style={styles.referenceText}>
              60–85 dB — Moderate (conversation, traffic)
            </Text>
          </View>
          <View style={styles.referenceRow}>
            <View
              style={[styles.referenceDot, { backgroundColor: "#ef4444" }]}
            />
            <Text style={styles.referenceText}>
              {">85 dB — Loud (risk of hearing damage)"}
            </Text>
          </View>
        </View>

        {/* Status chip */}
        <View
          style={[styles.statusChip, isRecording && styles.statusChipActive]}
        >
          <View style={[styles.dot, isRecording && styles.dotActive]} />
          <Text style={styles.statusText}>
            {isRecording ? "Measuring" : "Idle"}
          </Text>
        </View>

        {/* Record / Stop button */}
        <TouchableOpacity
          style={[styles.button, isRecording && styles.buttonStop]}
          onPress={isRecording ? stopRecording : startRecording}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {isRecording ? "⏹  Stop" : "⏺  Start Measuring"}
          </Text>
        </TouchableOpacity>
        {!isRecording && peakDb > 0 && (
          <TouchableOpacity
            style={styles.finishButton}
            onPress={async () => {
              await finishAttempt();

              if (journeyData) {
                router.replace({
                  pathname: "/JourneyComponent",
                  params: { journeyData },
                } as any);
                return;
              }

              router.replace("/screens/soundPollutionHunter/InstructionScreen");
            }}
          >
            <Text style={styles.finishButtonText}>Finish Attempt</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f8fafc",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
    marginBottom: 32,
    textAlign: "center",
  },

  readoutBox: {
    alignItems: "center",
    marginBottom: 36,
  },
  dbValue: {
    fontSize: 72,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  dbUnit: {
    fontSize: 18,
    color: "#64748b",
    marginTop: -8,
  },
  levelLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    letterSpacing: 0.5,
  },

  meterTrack: {
    width: "100%",
    height: 28,
    backgroundColor: "#1e293b",
    borderRadius: 6,
    overflow: "visible",
    position: "relative",
  },
  meterFill: {
    height: "100%",
    borderRadius: 6,
    position: "absolute",
    left: 0,
    top: 0,
  },
  tick: {
    position: "absolute",
    top: 0,
    alignItems: "center",
  },
  tickLine: {
    width: 1,
    height: 28,
    backgroundColor: "#0f172a",
    opacity: 0.5,
  },
  tickLabel: {
    fontSize: 10,
    color: "#475569",
    marginTop: 4,
  },

  scaleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
    marginBottom: 24,
  },
  scaleLabel: {
    fontSize: 11,
    color: "#475569",
  },

  referenceBox: {
    width: "100%",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    gap: 8,
  },
  referenceTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  referenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  referenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  referenceText: {
    fontSize: 12,
    color: "#64748b",
    flex: 1,
  },

  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 24,
    gap: 8,
  },
  statusChipActive: {
    backgroundColor: "#162416",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#475569",
  },
  dotActive: {
    backgroundColor: "#4ade80",
  },
  statusText: {
    fontSize: 13,
    color: "#94a3b8",
  },

  button: {
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 14,
  },
  buttonStop: {
    backgroundColor: "#ef4444",
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  peakBox: {
    marginTop: 20,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    minWidth: 180,
  },

  peakLabel: {
    fontSize: 11,
    color: "#94a3b8",
    letterSpacing: 1,
    fontWeight: "700",
  },

  peakValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#facc15",
    marginTop: 4,
  },
  finishButton: {
    marginTop: 12,
    backgroundColor: "#22c55e",
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 14,
  },

  finishButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
});
