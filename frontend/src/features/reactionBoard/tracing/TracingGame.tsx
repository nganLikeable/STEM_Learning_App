// TracingGame.tsx
import { useAppTheme } from "@/hooks/useAppTheme";
import { SHAPES } from "@/src/app/constants/shapes";
import { useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Polyline,
  Stop,
} from "react-native-svg";
import { getTracingResult, samplePath } from "./tracingEngine";
import { useTracingGame } from "./useTracingGame";
import useTracingInput from "./useTracingInput";

const VIEWBOX_SIZE = 100;
const SCREEN_W = Dimensions.get("window").width;
const SVG_SIZE = Math.min(SCREEN_W - 48, 340);

const SHAPE_IDS = Object.keys(SHAPES);

function randomShapeId() {
  return SHAPE_IDS[Math.floor(Math.random() * SHAPE_IDS.length)];
}

function accuracyLabel(pct: number) {
  if (pct >= 85) return { emoji: "⭐", text: "Perfect trace!" };
  if (pct >= 65) return { emoji: "🟢", text: "Great job" };
  if (pct >= 45) return { emoji: "🟡", text: "Getting there" };
  return { emoji: "🔴", text: "Keep practicing" };
}

interface TracingGameProps {
  onDone?: (accuracyPercent: number) => void;
}

export default function TracingGame({ onDone }: TracingGameProps) {
  const { colors } = useAppTheme();
  const [shapeId, setShapeId] = useState(() => randomShapeId());
  const shape = SHAPES[shapeId];

  const pathSamples = useMemo(() => samplePath(shape.path, 300), [shape.path]);

  // layoutRef — screen position of the SVG canvas, used for coordinate conversion
  const layoutRef = useRef({ x: 0, y: 0, width: SVG_SIZE });

  // statusRef — synced to status state, read inside PanResponder without stale closure
  const statusRef = useRef("idle");

  const { status, countdown, dotPoint, result, start, finish } = useTracingGame(
    pathSamples,
    getTracingResult,
  );

  const { trail, trailRef, panResponder, resetTrail } = useTracingInput(
    statusRef,
    layoutRef,
  );

  // Keep statusRef in sync every render
  statusRef.current = status;

  // When status flips to "done", compute result from the trail ref
  useEffect(() => {
    if (status === "done") {
      finish(trailRef.current);
    }
  }, [status]);

  // On retry — pick a new random shape and clear the trail
  const handleStart = () => {
    setShapeId(randomShapeId());
    resetTrail();
    start();
  };

  const trailPoints = trail.map((p) => `${p.x},${p.y}`).join(" ");
  const label = result ? accuracyLabel(result.accuracy) : null;

  return (
    <View style={[styles.screen, { backgroundColor: colors.primary }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Tracing Challenge</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {status === "idle" && `Trace the ${shape.emoji} ${shape.label}`}
          {status === "countdown" && "Get ready…"}
          {status === "tracing" && `Trace the ${shape.emoji} ${shape.label}!`}
          {status === "done" && "Here's how you did"}
        </Text>
      </View>

      <View
        style={[styles.canvas, { width: SVG_SIZE, height: SVG_SIZE, backgroundColor: colors.surface, borderColor: colors.border }]}
        ref={(ref) => {
          // measure gives pageX/pageY — absolute screen position
          // needed so screenToSvg can offset correctly
          if (ref) {
            ref.measure((_fx, _fy, _w, _h, px, py) => {
              layoutRef.current = { x: px, y: py, width: SVG_SIZE };
            });
          }
        }}
        {...panResponder.panHandlers}
      >
        <Svg
          width={SVG_SIZE}
          height={SVG_SIZE}
          viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        >
          <Defs>
            <LinearGradient id="trailGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#facc15" stopOpacity="0.95" />
              <Stop offset="100%" stopColor="#f97316" stopOpacity="0.7" />
            </LinearGradient>
          </Defs>

          <Path
            d={shape.path}
            fill="none"
            stroke="#334155"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Finger trail */}
          {trail.length > 1 && (
            <Polyline
              points={trailPoints}
              fill="none"
              stroke="url(#trailGrad)"
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.9}
            />
          )}

          {/* Moving dot — glow ring + core */}
          {(status === "tracing" || status === "countdown") && dotPoint && (
            <>
              <Circle
                cx={dotPoint.x}
                cy={dotPoint.y}
                r={10}
                fill="#facc15"
                opacity={0.2}
              />
              <Circle
                cx={dotPoint.x}
                cy={dotPoint.y}
                r={6}
                fill="#facc15"
                opacity={1}
              />
            </>
          )}

          {/* Start marker when idle */}
          {status === "idle" && pathSamples[0] && (
            <Circle
              cx={pathSamples[0].x}
              cy={pathSamples[0].y}
              r={5}
              fill="#facc15"
              opacity={0.5}
            />
          )}
        </Svg>

        {/* Countdown overlay */}
        {status === "countdown" && (
          <View style={styles.overlay}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        )}
      </View>

      {/* ── Result / placeholder ── */}
      {status === "done" && result && label ? (
        <View style={styles.resultBox}>
          <Text style={styles.resultEmoji}>{label.emoji}</Text>
          <Text style={[styles.resultVerdict, { color: colors.text }]}>{label.text}</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{result.accuracy}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{result.avgOffsetPx}</Text>
              <Text style={styles.statLabel}>Avg offset</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{result.totalTracingPoints}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
          </View>
        </View>
      ) : (
        // Fixed height placeholder — prevents CTA from jumping when result appears
        <View style={styles.resultPlaceholder} />
      )}

      {status !== "tracing" && status !== "countdown" && (
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Pressable
            style={({ pressed }) => [styles.cta, styles.ctaSecondary, pressed && styles.ctaPressed]}
            onPress={handleStart}
          >
            <Text style={[styles.ctaText, { color: "#f1f5f9" }]}>
              {status === "idle" ? "START" : "TRY AGAIN"}
            </Text>
          </Pressable>
          {status === "done" && result && onDone && (
            <Pressable
              style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
              onPress={() => onDone(result.accuracy)}
            >
              <Text style={styles.ctaText}>SAVE</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 56,
  },
  header: { alignItems: "center", gap: 4, paddingHorizontal: 24 },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 4,
    color: "#475569",
  },
  title: { fontSize: 30, fontWeight: "800", color: "#f1f5f9" },
  subtitle: { fontSize: 13, color: "#64748b", textAlign: "center" },

  canvas: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.6)",
  },
  countdownText: { fontSize: 96, fontWeight: "900", color: "#facc15" },

  resultBox: { alignItems: "center", gap: 6, paddingHorizontal: 24 },
  resultPlaceholder: { height: 90 },
  resultEmoji: { fontSize: 28 },
  resultVerdict: { fontSize: 18, fontWeight: "700", color: "#f1f5f9" },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 4,
  },
  stat: { alignItems: "center", gap: 2 },
  statValue: { fontSize: 20, fontWeight: "800", color: "#facc15" },
  statLabel: { fontSize: 10, color: "#64748b", letterSpacing: 0.5 },
  statDivider: { width: 1, height: 28, backgroundColor: "#334155" },

  cta: {
    backgroundColor: "#facc15",
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 50,
  },
  ctaSecondary: { backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#334155" },
  ctaPressed: { opacity: 0.8, transform: [{ scale: 0.97 }] },
  ctaText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: 2,
  },
});
