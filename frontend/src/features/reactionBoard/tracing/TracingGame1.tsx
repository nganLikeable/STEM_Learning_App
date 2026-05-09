// TracingGame.tsx
import { useEffect, useRef, useState } from "react";
import { Dimensions, PanResponder, StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Polyline,
  Stop,
} from "react-native-svg";

// ── Types ─────────────────────────────────────────────────────────────────────

type Point = { x: number; y: number };

type GameStatus = "idle" | "countdown" | "tracing" | "done";

type TracingResult = {
  accuracyPercent: number;
  avgDelayPx: number;
  totalPoints: number;
};

// ── Star path (5-pointed, centered at 150,150, fits in 300×300 viewBox) ───────

const VIEWBOX_SIZE = 300;
const CENTER = 150;
const OUTER_R = 110;
const INNER_R = 45;
const TOTAL_DURATION_MS = 6000; // how long the dot takes to complete the star

function buildStarPoints(): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const r = i % 2 === 0 ? OUTER_R : INNER_R;
    pts.push({
      x: CENTER + r * Math.cos(angle),
      y: CENTER + r * Math.sin(angle),
    });
  }
  return pts;
}

/** Convert star vertex list → SVG path string (closed) */
function buildStarPathD(pts: Point[]): string {
  return (
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z"
  );
}

/**
 * Pre-sample the star outline into N evenly-spaced points.
 * We do this by walking each edge and interpolating.
 */
function sampleStarPath(samples = 300): Point[] {
  const vertices = buildStarPoints();
  // Close the loop
  const closed = [...vertices, vertices[0]];

  // Compute total perimeter
  const edgeLengths = closed
    .slice(0, -1)
    .map((p, i) => Math.hypot(closed[i + 1].x - p.x, closed[i + 1].y - p.y));
  const totalLen = edgeLengths.reduce((a, b) => a + b, 0);

  const result: Point[] = [];
  let edgeIdx = 0;
  let consumed = 0;

  for (let s = 0; s < samples; s++) {
    const target = (s / samples) * totalLen;
    while (
      edgeIdx < edgeLengths.length - 1 &&
      consumed + edgeLengths[edgeIdx] < target
    ) {
      consumed += edgeLengths[edgeIdx];
      edgeIdx++;
    }
    const t = (target - consumed) / edgeLengths[edgeIdx];
    const a = closed[edgeIdx];
    const b = closed[edgeIdx + 1];
    result.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  }
  return result;
}

// ── Accuracy helpers ──────────────────────────────────────────────────────────

function nearestPathDistance(finger: Point, pathSamples: Point[]): number {
  let min = Infinity;
  for (const p of pathSamples) {
    const d = Math.hypot(p.x - finger.x, p.y - finger.y);
    if (d < min) min = d;
  }
  return min;
}

const ACCURACY_THRESHOLD_PX = 24; // within this = "on path"

function computeResult(
  fingerTrail: Point[],
  pathSamples: Point[],
): TracingResult {
  if (fingerTrail.length === 0)
    return { accuracyPercent: 0, avgDelayPx: 0, totalPoints: 0 };

  let onPath = 0;
  let totalDist = 0;

  for (const fp of fingerTrail) {
    const d = nearestPathDistance(fp, pathSamples);
    totalDist += d;
    if (d <= ACCURACY_THRESHOLD_PX) onPath++;
  }

  return {
    accuracyPercent: Math.round((onPath / fingerTrail.length) * 100),
    avgDelayPx: Math.round(totalDist / fingerTrail.length),
    totalPoints: fingerTrail.length,
  };
}

// ── SVG coordinate conversion ─────────────────────────────────────────────────

function screenToSvg(
  screenX: number,
  screenY: number,
  svgLayout: { x: number; y: number; width: number },
): Point {
  const scale = VIEWBOX_SIZE / svgLayout.width;
  return {
    x: (screenX - svgLayout.x) * scale,
    y: (screenY - svgLayout.y) * scale,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

const STAR_VERTICES = buildStarPoints();
const STAR_PATH_D = buildStarPathD(STAR_VERTICES);
const STAR_SAMPLES = sampleStarPath(300);
const SCREEN_W = Dimensions.get("window").width;
const SVG_SIZE = Math.min(SCREEN_W - 48, 340);

export default function TracingGame() {
  const [status, setStatus] = useState<GameStatus>("idle");
  const [countdown, setCountdown] = useState(3);
  const [fingerTrail, setFingerTrail] = useState<Point[]>([]);
  const [dotProgress, setDotProgress] = useState(0); // 0–1 along path
  const [result, setResult] = useState<TracingResult | null>(null);

  // Refs for animation loop (avoids stale closures)
  const statusRef = useRef<GameStatus>("idle");
  const fingerTrailRef = useRef<Point[]>([]);
  const startTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);
  const svgLayout = useRef({ x: 0, y: 0, width: SVG_SIZE });

  statusRef.current = status;

  // ── Countdown then start ────────────────────────────────────────────────

  const startCountdown = () => {
    setStatus("countdown");
    setCountdown(3);
    setFingerTrail([]);
    fingerTrailRef.current = [];
    setResult(null);
    setDotProgress(0);

    let c = 3;
    const tick = setInterval(() => {
      c--;
      if (c <= 0) {
        clearInterval(tick);
        beginTracing();
      } else {
        setCountdown(c);
      }
    }, 1000);
  };

  const beginTracing = () => {
    setStatus("tracing");
    startTimeRef.current = Date.now();
    animFrameRef.current = requestAnimationFrame(animateDot);
  };

  // ── Animate moving dot ──────────────────────────────────────────────────

  const animateDot = () => {
    const elapsed = Date.now() - startTimeRef.current;
    const progress = Math.min(elapsed / TOTAL_DURATION_MS, 1);
    setDotProgress(progress);

    if (progress < 1) {
      animFrameRef.current = requestAnimationFrame(animateDot);
    } else {
      // Time's up
      const res = computeResult(fingerTrailRef.current, STAR_SAMPLES);
      setResult(res);
      setStatus("done");
    }
  };

  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  // ── Moving dot position ────────────────────────────────────────────────

  const dotPoint =
    STAR_SAMPLES[Math.floor(dotProgress * (STAR_SAMPLES.length - 1))];

  // ── Pan responder ──────────────────────────────────────────────────────

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => statusRef.current === "tracing",
      onMoveShouldSetPanResponder: () => statusRef.current === "tracing",
      onPanResponderGrant: (e) => {
        const pt = screenToSvg(
          e.nativeEvent.pageX,
          e.nativeEvent.pageY,
          svgLayout.current,
        );
        fingerTrailRef.current = [pt];
        setFingerTrail([pt]);
      },
      onPanResponderMove: (e) => {
        const pt = screenToSvg(
          e.nativeEvent.pageX,
          e.nativeEvent.pageY,
          svgLayout.current,
        );
        fingerTrailRef.current = [...fingerTrailRef.current, pt];
        // Throttle setState to every 3 points to avoid render thrash
        if (fingerTrailRef.current.length % 3 === 0) {
          setFingerTrail([...fingerTrailRef.current]);
        }
      },
    }),
  ).current;

  // ── Finger trail as polyline points string ────────────────────────────

  const trailPoints = fingerTrail.map((p) => `${p.x},${p.y}`).join(" ");

  // ── Result label helpers ──────────────────────────────────────────────

  const accuracyLabel = (pct: number) => {
    if (pct >= 85) return { emoji: "⭐", text: "Perfect trace!" };
    if (pct >= 65) return { emoji: "🟢", text: "Great job" };
    if (pct >= 45) return { emoji: "🟡", text: "Getting there" };
    return { emoji: "🔴", text: "Keep practicing" };
  };

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>PHASE 3</Text>
        <Text style={styles.title}>Trace the Star</Text>
        <Text style={styles.subtitle}>
          {status === "idle"
            ? "Follow the moving dot with your finger"
            : status === "countdown"
              ? "Get ready..."
              : status === "tracing"
                ? "Keep tracing!"
                : "Here's how you did"}
        </Text>
      </View>

      {/* SVG canvas */}
      <View
        style={[styles.canvas, { width: SVG_SIZE, height: SVG_SIZE }]}
        onLayout={(e) => {
          const { x, y, width } = e.nativeEvent.layout;
          // pageX/Y needed for pan — measure from screen root
        }}
        ref={(ref) => {
          if (ref) {
            ref.measure((_fx, _fy, _w, _h, px, py) => {
              svgLayout.current = { x: px, y: py, width: SVG_SIZE };
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
              <Stop offset="0%" stopColor="#facc15" stopOpacity="0.9" />
              <Stop offset="100%" stopColor="#f97316" stopOpacity="0.6" />
            </LinearGradient>
          </Defs>

          {/* Ghost star outline */}
          <Path
            d={STAR_PATH_D}
            fill="none"
            stroke="#334155"
            strokeWidth={3}
            strokeLinejoin="round"
          />

          {/* Finger trail */}
          {fingerTrail.length > 1 && (
            <Polyline
              points={trailPoints}
              fill="none"
              stroke="url(#trailGrad)"
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.85}
            />
          )}

          {/* Moving dot */}
          {(status === "tracing" || status === "countdown") && dotPoint && (
            <Circle
              cx={dotPoint.x}
              cy={dotPoint.y}
              r={14}
              fill="#facc15"
              opacity={0.95}
            />
          )}

          {/* Start indicator */}
          {status === "idle" && (
            <Circle
              cx={STAR_VERTICES[0].x}
              cy={STAR_VERTICES[0].y}
              r={10}
              fill="#facc15"
              opacity={0.6}
            />
          )}
        </Svg>

        {/* Countdown overlay */}
        {status === "countdown" && (
          <View style={styles.countdownOverlay}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        )}
      </View>

      {/* Result */}
      {status === "done" &&
        result &&
        (() => {
          const { emoji, text } = accuracyLabel(result.accuracyPercent);
          return (
            <View style={styles.resultBox}>
              <Text style={styles.resultEmoji}>{emoji}</Text>
              <Text style={styles.resultVerdict}>{text}</Text>
              <View style={styles.resultStats}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>
                    {result.accuracyPercent}%
                  </Text>
                  <Text style={styles.statLabel}>Accuracy</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{result.avgDelayPx}px</Text>
                  <Text style={styles.statLabel}>Avg offset</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{result.totalPoints}</Text>
                  <Text style={styles.statLabel}>Points traced</Text>
                </View>
              </View>
            </View>
          );
        })()}

      {/* CTA */}
      {status !== "tracing" && status !== "countdown" && (
        <View style={styles.cta} onTouchEnd={startCountdown}>
          <Text style={styles.ctaText}>
            {status === "idle" ? "START" : "TRY AGAIN"}
          </Text>
        </View>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 56,
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
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },

  // ── Canvas ──────────────────────────────────────────────────────────────
  canvas: {
    borderRadius: 20,
    backgroundColor: "#1e293b",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#334155",
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.55)",
  },
  countdownText: {
    fontSize: 96,
    fontWeight: "900",
    color: "#facc15",
  },

  // ── Result ──────────────────────────────────────────────────────────────
  resultBox: {
    alignItems: "center",
    gap: 8,
  },
  resultEmoji: { fontSize: 32 },
  resultVerdict: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f1f5f9",
  },
  resultStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 4,
  },
  stat: { alignItems: "center", gap: 2 },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#facc15",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#334155",
  },

  // ── CTA ─────────────────────────────────────────────────────────────────
  cta: {
    backgroundColor: "#facc15",
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 50,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: 2,
  },
});
