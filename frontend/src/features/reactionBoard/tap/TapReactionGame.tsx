import { useAppTheme } from "@/hooks/useAppTheme";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
type Status = "idle" | "waiting" | "ready" | "done";

const STATUS_CONFIG: Record<
  Status,
  { bg: string; label: string; sublabel?: string }
> = {
  idle: { bg: "#ffc800", label: "TAP TO START", sublabel: "reaction test" },
  waiting: { bg: "#dc2626f0", label: "WAIT...", sublabel: "don't tap yet" },
  ready: { bg: "#16a34a", label: "TAP!", sublabel: "now!" },
  done: { bg: "#c09bff", label: "", sublabel: "tap to retry" },
};

const getFeedback = (ms: number) => {
  if (ms < 200) return { emoji: "⚡", label: "Lightning fast" };
  if (ms < 300) return { emoji: "🟢", label: "Great" };
  if (ms < 400) return { emoji: "🟡", label: "Average" };
  return { emoji: "🔴", label: "Keep practicing" };
};

// for screen setting stage
interface TapReactionGameProps {
  phase: "dominant" | "non-dominant";
  onNext: (reactionTimeMs: number) => void;
}

export default function TapReactionGame({
  phase,
  onNext,
}: TapReactionGameProps) {
  const { colors } = useAppTheme();
  const [status, setStatus] = useState<Status>("idle");
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleStart = () => {
    setReactionTime(null);
    setStatus("waiting");
    const delay = Math.random() * 2000 + 1000;

    // delay random time, when delay time is over, set ready and start counting time
    timerRef.current = setTimeout(() => {
      startTimeRef.current = Date.now();
      setStatus("ready");
    }, delay);
  };

  const handleTap = () => {
    if (status === "idle" || status === "done") {
      handleStart();
      return;
    }

    // if tapped too early
    if (status === "waiting") {
      clearTimeout(timerRef.current!);
      timerRef.current = null;
      setStatus("idle");
      return;
    }

    if (status === "ready") {
      const elapsed = Date.now() - (startTimeRef.current || 0);
      setReactionTime(elapsed);
      setStatus("done");
    }
    const config = STATUS_CONFIG[status];
    const feedback = reactionTime ? getFeedback(reactionTime) : null;
  };

  const config = STATUS_CONFIG[status];
  const feedback = reactionTime ? getFeedback(reactionTime) : null;

  // reset when phase changes
  useEffect(() => {
    setStatus("idle");
    setReactionTime(null);
    startTimeRef.current = null;
    timerRef.current = null;
    // reset when unmount
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }
  }, [phase]);

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <View style={styles.header}>
        <Text style={styles.title}>REACTION TEST</Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>How fast{"\n"}are you?</Text>
        {/* Phase badge */}
        <View style={[styles.phaseBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={styles.phaseDot}>●</Text>
          <Text style={[styles.phaseText, { color: colors.textSecondary }]}>
            {phase === "dominant" ? "Dominant Hand" : "Non-dominant Hand"}
          </Text>
        </View>
      </View>

      <View style={styles.gameWrapper}>
        <Pressable
          onPress={handleTap}
          style={({ pressed }) => [
            styles.game,
            { backgroundColor: config.bg },
            pressed && styles.gamePressed,
          ]}
        >
          {status === "done" && reactionTime ? (
            <View style={styles.resultInner}>
              <Text style={styles.resultMs}>{reactionTime}</Text>
              <Text style={styles.resultUnit}>ms</Text>
            </View>
          ) : (
            <Text style={styles.gameLabel}>{config.label}</Text>
          )}
          <Text style={styles.gameSublabel}>{config.sublabel}</Text>
        </Pressable>
      </View>

      {/* feedback */}
      <View style={styles.feedbackRow}>
        {feedback && status === "done" ? (
          <>
            <Text style={styles.feedbackEmoji}>{feedback.emoji}</Text>
            <Text style={[styles.feedbackLabel, { color: colors.text }]}>{feedback.label}</Text>
          </>
        ) : (
          <Text style={[styles.feedbackPlaceholder, { color: colors.textSecondary }]}>—</Text>
        )}
      </View>

      <View style={styles.nextWrapper}>
        {status === "done" && (
          <Pressable
            onPress={() => reactionTime != null && onNext(reactionTime)}
            style={({ pressed }) => [
              styles.nextBtn,
              pressed && styles.nextBtnPressed,
            ]}
          >
            <Text style={styles.nextBtnText}>
              {phase === "dominant"
                ? "Test your non-dominant hand"
                : "Move to Tracing Game"}
            </Text>
          </Pressable>
        )}
      </View>

      {/* instruction */}
      <Text style={[styles.instruction, { color: colors.textSecondary }]}>
        {status === "waiting"
          ? "Wait for green, then tap!"
          : status === "idle"
            ? "Tap the circle to begin"
            : status === "done"
              ? "Tap to go again"
              : ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  // background set dynamically via useAppTheme
  header: {
    alignItems: "center",
  },
  title: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 38,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 44,
  },
  // game
  gameWrapper: {
    width: 240,
    height: 240,
    justifyContent: "center",
    alignItems: "center",
  },
  game: {
    width: 240,
    height: 240,
    borderRadius: 120,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 16,
  },
  gamePressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  gameLabel: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 1,
  },
  gameSublabel: {
    fontSize: 13,
    marginTop: 4,
    letterSpacing: 1,
  },

  // result
  resultInner: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  resultMs: {
    fontSize: 52,
    fontWeight: "900",
    lineHeight: 56,
  },
  resultUnit: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 6,
    marginLeft: 4,
  },

  // feedbackrow
  feedbackRow: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  feedbackEmoji: {
    fontSize: 22,
  },
  feedbackLabel: {
    fontSize: 20,
    fontWeight: "600",
  },
  feedbackPlaceholder: {
    fontSize: 20,
  },
  // instruction
  instruction: {
    fontSize: 13,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  // next button to proceed
  nextWrapper: {
    height: 56, // fixed — prevents layout shift when button appears/disappears
    justifyContent: "center",
  },
  nextBtn: {
    backgroundColor: "#facc15",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 50,
  },
  nextBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  nextBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: 1,
  },
  // phase - hand Type
  phaseBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1e293b",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#334155",
    marginTop: 4,
  },
  phaseDot: {
    fontSize: 8,
    color: "#facc15",
  },
  phaseText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94a3b8",
    letterSpacing: 0.5,
  },
});
