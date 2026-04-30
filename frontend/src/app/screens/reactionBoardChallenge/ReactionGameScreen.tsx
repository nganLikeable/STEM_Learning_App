import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Phase = "dominant" | "non-dominant";
type Status = "idle" | "waiting" | "ready" | "done";

const PHASE_COPY: Record<Phase, { title: string; description: string }> = {
  dominant: {
    title: "Dominant Hand",
    description: "Use your stronger, writing hand for this round.",
  },
  "non-dominant": {
    title: "Non-Dominant Hand",
    description: "Switch hands — use your weaker hand this round.",
  },
};

export function ReactionGame() {
  const [phase, setPhase] = useState<Phase>("dominant");
  const [status, setStatus] = useState<Status>("idle");
  const [dominantTime, setDominantTime] = useState<number | null>(null);
  const [nonDominantTime, setNonDominantTime] = useState<number | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentResult = phase === "dominant" ? dominantTime : nonDominantTime;
  const { title, description } = PHASE_COPY[phase];

  // ── Helpers ────────────────────────────────────────────────────────────────

  const clearPendingTimeout = () => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const startRound = () => {
    setStatus("waiting");
    const delay = Math.random() * 3000 + 1000;
    timeoutRef.current = setTimeout(() => {
      startTimeRef.current = Date.now();
      setStatus("ready");
    }, delay);
  };

  const recordResult = (ms: number) => {
    if (phase === "dominant") {
      setDominantTime(ms);
    } else {
      setNonDominantTime(ms);
    }
    setStatus("done");
  };

  const advancePhase = () => {
    setPhase("non-dominant");
    setStatus("idle");
  };

  const handleTap = () => {
    if (status === "idle") {
      startRound();
      return;
    }

    if (status === "waiting") {
      clearPendingTimeout();
      setStatus("idle"); // message derived below — no extra state needed
      return;
    }

    if (status === "ready") {
      const ms = Date.now() - (startTimeRef.current ?? Date.now());
      recordResult(ms);
      return;
    }

    if (status === "done") {
      if (phase === "dominant") {
        advancePhase();
      } else {
        // Both phases complete — reset everything
        setDominantTime(null);
        setNonDominantTime(null);
        setPhase("dominant");
        setStatus("idle");
      }
    }
  };

  const getMessage = (): string => {
    if (status === "idle") return "Tap to start";
    if (status === "waiting") return "Wait for green…";
    if (status === "ready") return "Tap now!";
    // done
    if (phase === "dominant") return `${currentResult}ms — tap for next hand`;
    return `${currentResult}ms — tap to restart`;
  };

  const getBoxColor = (): string => {
    if (status === "ready") return "#22c55e";
    if (status === "waiting") return "#ef4444";
    if (status === "done") return "#8b5cf6";
    return "#6b7280";
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {dominantTime !== null && (
        <Text style={styles.previousResult}>Dominant: {dominantTime}ms</Text>
      )}

      <Pressable
        onPress={handleTap}
        style={[styles.box, { backgroundColor: getBoxColor() }]}
      >
        <Text style={styles.message}>{getMessage()}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    color: "#111",
    marginBottom: 6,
  },
  description: {
    fontSize: 15,
    textAlign: "center",
    color: "#555",
    marginBottom: 32,
  },
  previousResult: {
    fontSize: 14,
    textAlign: "center",
    color: "#888",
    marginBottom: 12,
  },
  box: {
    padding: 60,
    borderRadius: 16,
    alignItems: "center",
  },
  message: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
  },
});

export default function ReactionGameScreen() {
  return <ReactionGame />;
}
