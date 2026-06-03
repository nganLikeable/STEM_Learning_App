import { Pressable, StyleSheet, Text, View } from "react-native";
import { MovementId, MovementResult } from "./types";
import useStretchGame from "./useStretchGame";

type StretchActivityProps = {
  addId: MovementId;
  onComplete?: (result: MovementResult) => void;
};

function smoothnessLabel(score: number) {
  if (score >= 80) return { emoji: "🟢", text: "Very smooth" };
  if (score >= 60) return { emoji: "🟡", text: "Moderate" };
  if (score >= 40) return { emoji: "🟠", text: "Somewhat jerky" };
  return { emoji: "🔴", text: "Jerky — try slower" };
}

function meterColor(norm: number) {
  if (norm < 0.4) return "#22c55e";
  if (norm < 0.7) return "#facc15";
  return "#ef4444";
}

function improvementColor(delta: number) {
  if (delta > 10) return "#22c55e";
  if (delta > 0) return "#facc15";
  return "#ef4444";
}

function LiveBar({
  label,
  norm,
  valueLabel,
}: {
  label: string;
  norm: number;
  valueLabel: string;
}) {
  const color = meterColor(norm);
  return (
    <View style={bar.wrapper}>
      <View style={bar.row}>
        <Text style={bar.label}>{label}</Text>
        <Text style={[bar.value, { color }]}>{valueLabel}</Text>
      </View>
      <View style={bar.track}>
        <View
          style={[
            bar.fill,
            { width: `${Math.round(norm * 100)}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

function AttemptCompare({ result }: { result: MovementResult }) {
  const { attempt1, attempt2, improvement } = result;
  const impColor = improvementColor(improvement);

  return (
    <View style={cmp.wrapper}>
      {/* Attempt 1 */}
      <View style={cmp.side}>
        <Text style={cmp.attemptLabel}>No feedback</Text>
        <Text style={cmp.score}>{attempt1.smoothnessScore}</Text>
        <Text style={cmp.scoreUnit}>/ 100</Text>
        <Text style={cmp.detail}>{attempt1.peakSpeedG.toFixed(2)}G peak</Text>
        <Text style={cmp.detail}>{attempt1.rangeOfMotion} range</Text>
      </View>

      {/* Arrow + improvement */}
      <View style={cmp.middle}>
        <Text style={cmp.arrow}>→</Text>
        <View
          style={[
            cmp.impBadge,
            { backgroundColor: impColor + "22", borderColor: impColor },
          ]}
        >
          <Text style={[cmp.impText, { color: impColor }]}>
            {improvement > 0 ? `+${improvement}` : improvement}
          </Text>
        </View>
      </View>

      {/* Attempt 2 */}
      <View style={cmp.side}>
        <Text style={cmp.attemptLabel}>With buzz 📳</Text>
        <Text style={cmp.score}>{attempt2.smoothnessScore}</Text>
        <Text style={cmp.scoreUnit}>/ 100</Text>
        <Text style={cmp.detail}>{attempt2.peakSpeedG.toFixed(2)}G peak</Text>
        <Text style={cmp.detail}>{attempt2.rangeOfMotion} range</Text>
      </View>
    </View>
  );
}

export default function StretchActivity({ addId, onComplete }: StretchActivityProps) {

  const {
    status,
    countdown,
    progress,
    result,
    currentMovement,
    attemptNumber,
    liveJerkNorm,
    liveSpeedNorm,
    liveJerk,
    liveSpeed,
    startCountdown,
    reset,
  } = useStretchGame(addId);

  if (status === "idle") {
    return (
      <View style={s.screen}>
        <View style={s.header}>
          <Text style={s.eyebrow}>ACTIVITY 5 · MOVEMENT {currentMovement.id} OF 3</Text>
          <Text style={s.bigEmoji}>{currentMovement.emoji}</Text>
          <Text style={s.title}>{currentMovement.label}</Text>
          <Text style={s.subtitle}>{currentMovement.instruction}</Text>
        </View>

        <View style={s.tipBox}>
          <Text style={s.tipTitle}>💡 TIP</Text>
          <Text style={s.tipText}>{currentMovement.tip}</Text>
          <View style={s.tipDivider} />
          <Text style={s.tipText}>
            You will do this movement <Text style={s.tipBold}>twice</Text>.
            {"\n"}
            First freely, then the phone will{" "}
            <Text style={s.tipBold}>buzz</Text> when you're too jerky.
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [s.cta, pressed && s.ctaPressed]}
          onPress={startCountdown}
        >
          <Text style={s.ctaText}>START ATTEMPT 1</Text>
        </Pressable>
      </View>
    );
  }

  if (status === "countdown") {
    return (
      <View style={s.screen}>
        <Text style={s.eyebrow}>
          {currentMovement.emoji} ATTEMPT {attemptNumber} — GET READY
        </Text>
        <Text style={s.countdownNumber}>{countdown}</Text>
        <Text style={s.countdownHint}>
          {attemptNumber === 1
            ? "No feedback this round"
            : "📳 Phone will buzz if you're jerky"}
        </Text>
      </View>
    );
  }

  if (status === "recording") {
    const pct = Math.round(progress * 100);
    // First half = slow phase, second half = speed up
    const phase = progress < 0.5 ? "🐢 Move slowly" : "⚡ Now speed up!";
    const phaseColor = progress < 0.5 ? "#22c55e" : "#facc15";

    return (
      <View style={s.screen}>
        <View style={s.header}>
          <Text style={s.eyebrow}>
            🔴 RECORDING · ATTEMPT {attemptNumber}
            {attemptNumber === 2 ? " · 📳 BUZZ ACTIVE" : ""}
          </Text>
          <Text style={s.title}>
            {currentMovement.emoji} {currentMovement.label}
          </Text>
          <Text style={[s.phaseLabel, { color: phaseColor }]}>{phase}</Text>
        </View>

        {/* Progress bar with midpoint marker */}
        <View style={s.progressWrapper}>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${pct}%` }]} />
          </View>
          {/* Midpoint divider — "speed up" cue */}
          <View style={s.progressMid} />
          <View style={s.progressLabels}>
            <Text style={s.progressPhaseLabel}>Slow</Text>
            <Text style={s.progressPhaseLabel}>Fast</Text>
          </View>
        </View>

        {/* Live meters */}
        <View style={s.metersSection}>
          <LiveBar
            label="Jerk (lower = smoother)"
            norm={liveJerkNorm}
            valueLabel={liveJerk.toFixed(4)}
          />
          <LiveBar
            label="Speed"
            norm={liveSpeedNorm}
            valueLabel={`${liveSpeed.toFixed(3)}G`}
          />
        </View>

        <Text style={s.hint}>
          {attemptNumber === 2
            ? "Try to keep the phone quiet — no buzzing!"
            : "Move naturally — start slow, build up speed"}
        </Text>
      </View>
    );
  }

  if (status === "between") {
    return (
      <View style={s.screen}>
        <View style={s.header}>
          <Text style={s.eyebrow}>ATTEMPT 1 DONE</Text>
          <Text style={s.title}>Now with{"\n"}buzz feedback</Text>
          <Text style={s.subtitle}>
            This time the phone will vibrate when you move too suddenly. Use it
            to stay smooth.
          </Text>
        </View>

        <View style={s.feedbackExplainer}>
          <View style={s.feedbackRow}>
            <Text style={s.feedbackIcon}>📳</Text>
            <Text style={s.feedbackDesc}>Buzz = too jerky, slow down</Text>
          </View>
          <View style={s.feedbackRow}>
            <Text style={s.feedbackIcon}>🔇</Text>
            <Text style={s.feedbackDesc}>Silence = smooth, keep going</Text>
          </View>
          <View style={s.feedbackRow}>
            <Text style={s.feedbackIcon}>⚡</Text>
            <Text style={s.feedbackDesc}>Strong buzz = very jerky</Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [s.cta, pressed && s.ctaPressed]}
          onPress={startCountdown}
        >
          <Text style={s.ctaText}>START ATTEMPT 2 📳</Text>
        </Pressable>
      </View>
    );
  }

  if (status === "result") {
    if (!result) return null;

    const latest = result;
    const impColor = improvementColor(latest.improvement);
    const { emoji: sEmoji, text } = smoothnessLabel(
      latest.attempt1.smoothnessScore,
    );

    return (
      <View style={s.screen}>
        <View style={s.header}>
          <Text style={s.eyebrow}>
            {latest.emoji} {latest.label.toUpperCase()} RESULT
          </Text>
          <Text style={s.title}>Movement {latest.movementId}</Text>
        </View>

        {/* Comparison */}
        <AttemptCompare result={latest} />

        {/* Improvement callout */}
        <View style={[s.impCallout, { borderColor: impColor }]}>
          <Text style={[s.impCalloutValue, { color: impColor }]}>
            {latest.improvement > 0
              ? `+${latest.improvement} pts`
              : latest.improvement === 0
                ? "No change"
                : `${latest.improvement} pts`}
          </Text>
          <Text style={s.impCalloutLabel}>
            {latest.improvement > 0
              ? "Feedback helped! ✓"
              : latest.improvement === 0
                ? "Same result"
                : "Feedback didn't help this time"}
          </Text>
        </View>

        <View style={s.verdictRow}>
          <Text style={s.verdictEmoji}>{sEmoji}</Text>
          <Text style={s.verdictText}>{text}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [s.cta, pressed && s.ctaPressed]}
          onPress={() => {
            if (result && onComplete) {
              onComplete(result);
              return;
            }
            reset();
          }}
        >
          <Text style={s.ctaText}>{onComplete ? "FINISH MOVEMENT" : "RUN AGAIN"}</Text>
        </Pressable>
      </View>
    );
  }

  return null;
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  header: { alignItems: "center", gap: 8 },
  bigEmoji: { fontSize: 52 },
  eyebrow: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 3,
    color: "#475569",
    textAlign: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#f1f5f9",
    textAlign: "center",
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },
  phaseLabel: { fontSize: 16, fontWeight: "700" },

  tipBox: {
    width: "100%",
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#334155",
    gap: 10,
  },
  tipTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 1,
  },
  tipText: { fontSize: 14, color: "#cbd5e1", lineHeight: 22 },
  tipBold: { fontWeight: "700", color: "#f1f5f9" },
  tipDivider: { height: 1, backgroundColor: "#334155" },

  countdownNumber: { fontSize: 120, fontWeight: "900", color: "#facc15" },
  countdownHint: { fontSize: 15, color: "#64748b", textAlign: "center" },

  progressWrapper: { width: "100%", gap: 6 },
  progressTrack: {
    width: "100%",
    height: 10,
    backgroundColor: "#1e293b",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#facc15", borderRadius: 5 },
  progressMid: {
    position: "absolute",
    left: "50%",
    top: 0,
    width: 2,
    height: 10,
    backgroundColor: "#475569",
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressPhaseLabel: { fontSize: 10, color: "#475569" },

  metersSection: { width: "100%", gap: 20 },
  hint: { fontSize: 12, color: "#334155", textAlign: "center" },

  // Between attempts
  feedbackExplainer: {
    width: "100%",
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  feedbackRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  feedbackIcon: { fontSize: 24, width: 36 },
  feedbackDesc: { fontSize: 14, color: "#cbd5e1", flex: 1 },

  // Result
  impCallout: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  impCalloutValue: { fontSize: 28, fontWeight: "900" },
  impCalloutLabel: { fontSize: 13, color: "#94a3b8" },

  verdictRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  verdictEmoji: { fontSize: 22 },
  verdictText: { fontSize: 16, fontWeight: "600", color: "#cbd5e1" },

  cta: {
    backgroundColor: "#facc15",
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 50,
  },
  ctaPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  ctaText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: 2,
  },
});

const bar = StyleSheet.create({
  wrapper: { width: "100%", gap: 6 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 12, color: "#64748b", fontWeight: "600" },
  value: { fontSize: 12, fontWeight: "800" },
  track: {
    height: 10,
    backgroundColor: "#1e293b",
    borderRadius: 5,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 5 },
});

const cmp = StyleSheet.create({
  wrapper: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#334155",
    gap: 8,
  },
  side: { flex: 1, alignItems: "center", gap: 4 },
  attemptLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#475569",
    letterSpacing: 1,
    textAlign: "center",
  },
  score: { fontSize: 36, fontWeight: "900", color: "#facc15" },
  scoreUnit: { fontSize: 11, color: "#475569" },
  detail: { fontSize: 10, color: "#64748b" },
  middle: { alignItems: "center", gap: 8 },
  arrow: { fontSize: 20, color: "#334155" },
  impBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  impText: { fontSize: 14, fontWeight: "800" },
});

