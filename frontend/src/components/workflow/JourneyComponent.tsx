/**
 * JourneyComponent — Duolingo-style learning path screen.
 * SVG road path + completed state + Firestore session loading.
 */

import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { getActiveSession } from "../../services/session";
import { useSessionStore } from "../../store/session-store";
import { useTeamStore } from "../../store/team-store";

// ─────────────────────────────────────────────
// TYPES & NODE DATA
// ─────────────────────────────────────────────

export interface JourneyNodeData {
  id: string;
  title: string;
  locked: boolean;
  completed: boolean;
  pathID?: string;
}

function buildNodes(
  titles: string[],
  pathIDs: string[],
  completedUpTo: number,
): JourneyNodeData[] {
  return Array.from({ length: 10 }, (_, i) => {
    const hasPhase = i < titles.length;
    return {
      id: String(i + 1),
      title: hasPhase ? titles[i] : `Phase ${i + 1}`,
      locked: i >= titles.length || i > completedUpTo,
      completed: hasPhase && i < completedUpTo,
      pathID: hasPhase ? pathIDs[i] : undefined,
    };
  });
}

// ─────────────────────────────────────────────
// LAYOUT CONSTANTS  — SVG road layout from HEAD
// ─────────────────────────────────────────────

const ROW_H = 200;
const PAD_TOP = 110;
const PAD_BOT = 120;
const NODE_R = 34;
const ACTIVE_R = 42;

const ZIGZAG = ["right", "left",  "right" , "left" ] as const;
type Col = (typeof ZIGZAG)[number];

function colX(col: Col, w: number): number {
  if (col === "left") return w * 0.22;
  if (col === "right") return w * 0.75;
  return w * 0.5;
}

function getNodePos(index: number, w: number) {
  return {
    x: colX(ZIGZAG[index % 4], w),
    y: PAD_TOP + index * ROW_H,
  };
}

// ─────────────────────────────────────────────
// SVG HELPERS
// ─────────────────────────────────────────────

function segmentD(
  a: { x: number; y: number },
  b: { x: number; y: number },
): string {
  const dy = (b.y - a.y) * 1.11  ; // Pull distance for the curve handle
  return `M${a.x},${a.y} 
  C${a.x},${a.y + dy} 
  ${b.x},${b.y - dy} 
  ${b.x},${b.y}`;
}

// ─────────────────────────────────────────────
// NODE BUTTON
// ─────────────────────────────────────────────

interface NodeButtonProps {
  node: JourneyNodeData;
  index: number;
  isActive: boolean;
  x: number;
  y: number;
  onPress: (node: JourneyNodeData) => void;
}

const NodeButton: React.FC<NodeButtonProps> = ({
  node,
  index,
  isActive,
  x,
  y,
  onPress,
}) => {
  // Entry + press animations from firestore branch
  const entryScale = useSharedValue(0);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    entryScale.value = withDelay(
      Math.min(index * 60, 400),
      withSpring(1, { damping: 12, stiffness: 150 }),
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: entryScale.value * pressScale.value }],
  }));

  const handlePress = () => {
    if (node.locked || node.completed) return;
    pressScale.value = withSequence(
      withTiming(0.88, { duration: 70 }),
      withSpring(1, { damping: 10, stiffness: 200 }),
    );
    onPress(node);
  };

  const r = isActive ? ACTIVE_R : NODE_R;

  return (
    <Animated.View
      style={[
        styles.nodeWrap,
        { left: x - r, top: y - r },
        animStyle,
      ]}
    >
      {isActive ? (
        <Pressable
          onPress={handlePress}
          style={[
            styles.nodeCircle,
            styles.nodeActive,
            { width: r * 2, height: r * 2, borderRadius: r },
          ]}
        >
          <Text style={[styles.nodeIcon, styles.nodeIconActive]}>
            {node.id}
          </Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={handlePress}
          disabled={node.locked || node.completed}
          style={[
            styles.nodeCircle,
            { width: r * 2, height: r * 2, borderRadius: r },
            node.locked
              ? styles.nodeLocked
              : node.completed
                ? styles.nodeCompleted // completed = deep green
                : styles.nodeUnlocked, // unlocked  = purple
          ]}
        >
          {node.locked ? (
            <Image
              source={require("../../../assets/images/mascot/thinking.png")}
              style={styles.lockIcon}
            />
          ) : node.completed ? (
            <Image
              source={require("../../../assets/images/mascot/heyjo.png")}
              style={styles.lockIcon}
            />
          ) : (
            <Text style={styles.nodeIcon}>{node.id}</Text>
          )}
        </Pressable>
      )}

      <Text
        numberOfLines={2}
        style={[styles.nodeLabel, node.locked && styles.nodeLabelLocked]}
      >
        {node.title}
      </Text>
    </Animated.View>
  );
};

// ─────────────────────────────────────────────
// DESCRIPTION POPUP
// ─────────────────────────────────────────────

interface DescriptionPopupProps {
  node: JourneyNodeData | null;
  onClose: () => void;
  onStart: (node: JourneyNodeData) => void;
}

const DescriptionPopup: React.FC<DescriptionPopupProps> = ({
  node,
  onClose,
  onStart,
}) => (
  <Modal
    transparent
    animationType="fade"
    visible={!!node}
    onRequestClose={onClose}
  >
    <TouchableOpacity
      style={styles.overlay}
      onPress={onClose}
      activeOpacity={1}
    >
      {node && (
        <View style={styles.popupCard}>
          <Text style={styles.popupTitle}>{node.title}</Text>

          {/* Completed state from firestore branch */}
          <TouchableOpacity
            onPress={() => {
              if (!node.completed) onStart(node);
            }}
            style={[styles.startBtn, node.completed && styles.startBtnDisabled]}
            disabled={node.completed}
            activeOpacity={0.85}
          >
            <Text style={styles.startBtnText}>
              {node.completed ? "Completed ✓" : "Start →"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.notNowBtn}>
            <Text style={styles.notNowText}>Not now</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  </Modal>
);

// ─────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────

export default function JourneyComponent() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const [activeNode, setActiveNode] = useState<JourneyNodeData | null>(null);
  const [completedUpTo, setCompletedUpTo] = useState(0);

  const { teamId } = useTeamStore();
  const { setSessionId } = useSessionStore();

  const { journeyData } = useLocalSearchParams<{ journeyData: string }>();
  const {
    titles = [],
    pathIDs = [],
    activityId,
  } = journeyData
    ? (JSON.parse(journeyData as string) as {
        titles: string[];
        pathIDs: string[];
        activityId?: number;
      })
    : {};

  // ── Firestore session loading ──────────────────────────────────────────────

  const loadActiveSession = React.useCallback(async () => {
    if (!teamId || !activityId) return;
    try {
      const activeSession = await getActiveSession(teamId, activityId as 1 | 2 | 3 | 4 | 5 | 6 | 7 | undefined);
      if (!activeSession) {
        setCompletedUpTo(0);
        return;
      }
      setSessionId(activeSession.id);
      setCompletedUpTo(Math.max((activeSession.currentPhase ?? 1) - 1, 0));
    } catch (e) {
      console.error(e);
    }
  }, [teamId, activityId, setSessionId]);

  useEffect(() => {
    loadActiveSession();
  }, [loadActiveSession]);

  // Reload when returning from a phase screen
  useFocusEffect(
    React.useCallback(() => {
      loadActiveSession();
      return undefined;
    }, [loadActiveSession]),
  );

  // ── Build nodes + SVG layout ───────────────────────────────────────────────

  const nodes = buildNodes(titles, pathIDs, completedUpTo);

  // Active = the current phase; completed phases stay green but locked against redo
  const activeIndex = completedUpTo < titles.length ? completedUpTo : -1;

  const totalH = PAD_TOP + (nodes.length - 1) * ROW_H + PAD_BOT;
  const positions = nodes.map((_, i) => getNodePos(i, width));

  const segments = nodes.slice(0, -1).map((_, i) => ({
    d: segmentD(positions[i], positions[i + 1]),
    done: i < completedUpTo,
  }));

  // ── Navigation ─────────────────────────────────────────────────────────────

  const handleStart = (node: JourneyNodeData) => {
    setActiveNode(null);
    if (!node.pathID) return;
    if (!teamId) {
      console.log("No teamId found");
      return;
    }

    if (!journeyData) {
      router.push(node.pathID as any);
      return;
    }

    const separator = node.pathID.includes("?") ? "&" : "?";
    router.push(
      `${node.pathID}${separator}journeyData=${encodeURIComponent(
        journeyData,
      )}` as any,
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ width, height: totalH }}>
          {/* SVG road — absolute, non-interactive */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg width={width} height={totalH}>
              {segments.map((seg, i) => (
                <React.Fragment key={i}>
                  {/* Road border / shadow */}
                  <Path
                    d={seg.d}
                    stroke={seg.done ? "#2D6A1F" : "#A89EC8"}
                    strokeWidth={54}
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Road surface */}
                  <Path
                    d={seg.d}
                    stroke={seg.done ? "#5AD446" : "#C8BEDC"}
                    strokeWidth={44}
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Broken centre line */}
                  <Path
                    d={seg.d}
                    stroke="rgba(255,255,255,0.75)"
                    strokeWidth={5}
                    strokeLinecap="round"
                    strokeDasharray="14 18"
                    fill="none"
                  />
                </React.Fragment>
              ))}
            </Svg>
          </View>

          {nodes.map((node, i) => (
            <NodeButton
              key={node.id}
              node={node}
              index={i}
              isActive={i === activeIndex && !node.locked}
              x={positions[i].x}
              y={positions[i].y}
              onPress={setActiveNode}
            />
          ))}
        </View>
      </ScrollView>

      <DescriptionPopup
        node={activeNode}
        onClose={() => setActiveNode(null)}
        onStart={handleStart}
      />
    </View>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#EEE8F8",
  },

  nodeWrap: {
    position: "absolute",
    alignItems: "center",
  },
  nodeCircle: {
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  nodeActive: {
    backgroundColor: "#8d7a26",
    borderColor: "#E8A800",
    shadowColor: "#FFD000",
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  nodeLocked: {
    backgroundColor: "#C0BCCE",
    borderColor: "#A8A4B8",
    shadowColor: "#000",
  },
  nodeUnlocked: {
    backgroundColor: "#6C63FF",
    borderColor: "#4A3FD8",
    shadowColor: "#6C63FF",
  },
  nodeCompleted: {
    backgroundColor: "#2FA84F",
    borderColor: "#1F7A37",
    shadowColor: "#2FA84F",
  },
  nodeIcon: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
  },
  nodeIconActive: {
    fontSize: 24,
    color: "#7A4F00",
  },
  lockIcon: {
    width: 56,
    height: 56,
    resizeMode: "contain",
  },
  nodeLabel: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: "600",
    color: "#3D2C6A",
    textAlign: "center",
    width: 90,
    lineHeight: 14,
  },
  nodeLabelLocked: {
    color: "#A8A4B8",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  popupCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 26,
    width: "78%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1240",
    textAlign: "center",
    marginBottom: 10,
  },
  startBtn: {
    width: "100%",
    backgroundColor: "#6C63FF",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  startBtnDisabled: {
    backgroundColor: "#A4BCA4",
    shadowOpacity: 0,
    elevation: 0,
  },
  startBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  notNowBtn: {
    marginTop: 13,
    paddingVertical: 4,
  },
  notNowText: {
    color: "#9890B8",
    fontSize: 13,
  },
});
