// EarthquakeActivity.tsx
import { useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import useEarthquakeTest from "./useEarthquakeTest";

const SCREEN_W = Dimensions.get("window").width;

// ── Sub-components ────────────────────────────────────────────────────────────

function LiveMeter({
  label,
  value,
  max,
  unit,
  color,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
}) {
  const pct = Math.min(value / max, 1);
  return (
    <View style={meter.wrapper}>
      <View style={meter.row}>
        <Text style={meter.label}>{label}</Text>
        <Text style={[meter.value, { color }]}>
          {value.toFixed(2)} {unit}
        </Text>
      </View>
      <View style={meter.track}>
        <View
          style={[
            meter.fill,
            { width: `${pct * 100}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

// function DesignCard({
//   result,
//   isWinner,
// }: {
//   result: DesignResult;
//   isWinner: boolean;
// }) {
//   return (
//     <View style={[card.wrapper, isWinner && card.wrapperWinner]}>
//       {isWinner && <Text style={card.winnerBadge}>⭐ BEST</Text>}
//       <Text style={card.designNum}>Design {result.designNumber}</Text>
//       <Text style={card.designLabel}>{result.label}</Text>
//       <View style={card.statsRow}>
//         <View style={card.stat}>
//           <Text style={card.statValue}>{result.stabilityScore}</Text>
//           <Text style={card.statLabel}>Stability</Text>
//         </View>
//         <View style={card.divider} />
//         <View style={card.stat}>
//           <Text style={card.statValue}>{result.totalRotationDeg}°</Text>
//           <Text style={card.statLabel}>Total rotation</Text>
//         </View>
//         <View style={card.divider} />
//         <View style={card.stat}>
//           <Text style={card.statValue}>{result.peakRotationRateDeg}°/s</Text>
//           <Text style={card.statLabel}>Peak rotation</Text>
//         </View>
//         <View style={card.divider} />
//         <View style={card.stat}>
//           <Text style={card.statValue}>
//             {result.maxAcceleration.toFixed(2)}G
//           </Text>
//           <Text style={card.statLabel}>Max accel</Text>
//         </View>
//       </View>
//     </View>
//   );
// }

interface Props {
  designNumber: 1 | 2 | 3;
}

export default function EarthquakeActivity({ designNumber }: Props) {
  const [labelInput, setLabelInput] = useState("");

  const {
    status,
    countdown,
    progress,
    result,
    liveRotation,
    liveAccel,
    beginCountdown,
    reset,
    backToPath,
  } = useEarthquakeTest(designNumber);

  // ── Idle — design label entry ─────────────────────────────────────────────

  // if (status === "idle") {
  //   return (
  //     <View style={styles.screen}>
  //       <View style={styles.header}>
  //         <Text style={styles.eyebrow}>ACTIVITY 4</Text>
  //         <Text style={styles.title}>Earthquake{"\n"}Lab</Text>
  //         <Text style={styles.subtitle}>Design {designNumber}</Text>
  //       </View>

  //       <View style={styles.inputSection}>
  //         <Text style={styles.inputLabel}>Describe your structure:</Text>
  //         <TextInput
  //           style={styles.input}
  //           placeholder="e.g. 4 folds + 4 pillars"
  //           placeholderTextColor="#475569"
  //           value={labelInput}
  //           onChangeText={setLabelInput}
  //         />
  //         <Text style={styles.inputHint}>
  //           Place your phone on the structure after tapping Start.
  //         </Text>
  //       </View>

  //       <Pressable
  //         style={({ pressed }) => [
  //           styles.cta,
  //           !labelInput.trim() && styles.ctaDisabled,
  //           pressed && labelInput.trim() && styles.ctaPressed,
  //         ]}
  //         onPress={() => {
  //           if (labelInput.trim()) {
  //             beginCountdown(labelInput.trim());
  //             setLabelInput("");
  //           }
  //         }}
  //       >
  //         <Text style={styles.ctaText}>START TEST</Text>
  //       </Pressable>
  //     </View>
  //   );
  // }

  // ── Countdown ─────────────────────────────────────────────────────────────

  if (status === "countdown") {
    return (
      <View style={styles.screen}>
        <Text style={styles.eyebrow}>PLACE PHONE ON STRUCTURE</Text>
        <Text style={styles.countdownNumber}>{countdown}</Text>
        <Text style={styles.countdownHint}>Earthquake starts soon…</Text>
      </View>
    );
  }

  // ── Calibrating ───────────────────────────────────────────────────────────

  if (status === "calibrating") {
    return (
      <View style={styles.screen}>
        <Text style={styles.eyebrow}>CALIBRATING</Text>
        <Text style={styles.calibratingText}>Hold still…</Text>
        <Text style={styles.countdownHint}>Measuring baseline</Text>
      </View>
    );
  }

  // ── Testing ───────────────────────────────────────────────────────────────

  if (status === "testing") {
    const progressPct = Math.round(progress * 100);
    const rotationColor =
      liveRotation > 10 ? "#ef4444" : liveRotation > 5 ? "#facc15" : "#22c55e";
    const accelColor =
      liveAccel > 0.3 ? "#ef4444" : liveAccel > 0.1 ? "#facc15" : "#22c55e";

    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>🔴 RECORDING</Text>
          <Text style={styles.title}>Earthquake{"\n"}in progress</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
        </View>
        <Text style={styles.progressLabel}>{progressPct}%</Text>

        {/* Live meters */}
        <View style={styles.metersSection}>
          <LiveMeter
            label="Rotation rate"
            value={liveRotation}
            max={30}
            unit="°/s"
            color={rotationColor}
          />
          <LiveMeter
            label="Acceleration"
            value={liveAccel}
            max={1}
            unit="G"
            color={accelColor}
          />
        </View>

        <Text style={styles.testingHint}>Keep hands away from the phone</Text>
      </View>
    );
  }

  // ── Done — single result ──────────────────────────────────────────────────

  if (status === "done") {
    const stabilityScore = result?.stabilityScore ?? 0;
    const scoreColor =
      stabilityScore >= 75
        ? "#22c55e"
        : stabilityScore >= 50
          ? "#facc15"
          : "#ef4444";

    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>DESIGN {designNumber} RESULT</Text>
          <Text style={styles.title}>{result?.label}</Text>
        </View>

        {/* Big score */}
        <View style={styles.scoreCircle}>
          <Text style={[styles.scoreNumber, { color: scoreColor }]}>
            {stabilityScore}
          </Text>
          <Text style={styles.scoreUnit}>/ 100</Text>
          <Text style={styles.scoreLabel}>Stability</Text>
        </View>

        {/* Breakdown */}
        <View style={styles.breakdownRow}>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownValue}>
              {result?.totalRotationDeg}°
            </Text>
            <Text style={styles.breakdownLabel}>Total rotation</Text>
          </View>
          <View style={styles.breakdownDivider} />
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownValue}>
              {result?.peakRotationRateDeg}°/s
            </Text>
            <Text style={styles.breakdownLabel}>Peak rotation</Text>
          </View>
          <View style={styles.breakdownDivider} />
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownValue}>
              {result?.maxAcceleration.toFixed(2)}G
            </Text>
            <Text style={styles.breakdownLabel}>Max accel</Text>
          </View>
        </View>
        <View style={styles.buttonRow}>
          <Pressable
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
            onPress={backToPath}
          >
            <Text style={styles.ctaText}>DONE →</Text>
          </Pressable>
        </View>
      </View>
    );
  }
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  header: { alignItems: "center", gap: 6 },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 4,
    color: "#475569",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#f1f5f9",
    textAlign: "center",
    lineHeight: 40,
  },
  subtitle: { fontSize: 14, color: "#64748b", textAlign: "center" },

  // Input
  inputSection: { width: "100%", gap: 12, marginTop: -200 },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94a3b8",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#f1f5f9",
  },
  inputHint: { fontSize: 12, color: "#475569", textAlign: "center" },

  // Countdown
  countdownNumber: { fontSize: 120, fontWeight: "900", color: "#facc15" },
  countdownHint: { fontSize: 14, color: "#64748b" },
  calibratingText: { fontSize: 48, fontWeight: "800", color: "#94a3b8" },

  // Progress
  progressTrack: {
    width: "100%",
    height: 8,
    backgroundColor: "#1e293b",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#ef4444",
    borderRadius: 4,
  },
  progressLabel: { fontSize: 13, color: "#64748b" },

  // Meters
  metersSection: { width: "100%", gap: 16 },
  testingHint: { fontSize: 12, color: "#334155" },

  // Score circle
  scoreCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#1e293b",
    borderWidth: 2,
    borderColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
  },
  scoreNumber: { fontSize: 56, fontWeight: "900", lineHeight: 60 },
  scoreUnit: { fontSize: 16, color: "#64748b", fontWeight: "600" },
  scoreLabel: { fontSize: 11, color: "#475569", letterSpacing: 1 },

  // Breakdown
  breakdownRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  breakdownItem: { alignItems: "center", gap: 2 },
  breakdownValue: { fontSize: 18, fontWeight: "800", color: "#f1f5f9" },
  breakdownLabel: { fontSize: 10, color: "#64748b", letterSpacing: 0.5 },
  breakdownDivider: { width: 1, height: 32, backgroundColor: "#1e293b" },

  // CTA
  cta: {
    backgroundColor: "#facc15",
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 50,
  },
  ctaDisabled: { backgroundColor: "#1e293b" },
  ctaPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  ctaText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: 2,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
});

const meter = StyleSheet.create({
  wrapper: { width: "100%", gap: 6 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 12, color: "#64748b", fontWeight: "600" },
  value: { fontSize: 13, fontWeight: "800" },
  track: {
    height: 10,
    backgroundColor: "#1e293b",
    borderRadius: 5,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 5 },
});

const card = StyleSheet.create({
  wrapper: {
    width: "100%",
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#334155",
    gap: 12,
  },
  wrapperWinner: {
    borderColor: "#facc15",
    backgroundColor: "#1c1a0a",
  },
  winnerBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: "#facc15",
    letterSpacing: 2,
  },
  designNum: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "600",
    letterSpacing: 2,
  },
  designLabel: { fontSize: 18, fontWeight: "700", color: "#f1f5f9" },
  statsRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 16, fontWeight: "800", color: "#facc15" },
  statLabel: {
    fontSize: 9,
    color: "#64748b",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  divider: { width: 1, height: 28, backgroundColor: "#334155" },
});
