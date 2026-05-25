/**
 * JourneyComponent — Duolingo-style learning path screen.
 * Background theme: "SciTrail" (soft sage-green, nature-science palette).
 *
 * Nodes 1–3: unlocked — tap to see description popup, then navigate via pathID.
 * Nodes 4–10: locked — greyed out, not interactive.
 */

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
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
import { useSessionStore } from "../store/session-store";
import { useTeamStore } from "../store/team-store";
// ─────────────────────────────────────────────
// TYPES & NODE DATA
// ─────────────────────────────────────────────

export interface JourneyNodeData {
  id: string;
  title: string;
  locked: boolean;
  /** Short description shown in the popup (unlocked nodes only). */
  description?: string;
  /** Expo Router pathname to push when the user taps "Start". */
  pathID?: string;
}

function buildNodes(
  titles: string[],
  descriptions: string[],
  pathIDs: string[],
): JourneyNodeData[] {
  return Array.from({ length: 10 }, (_, i) => {
    const unlocked = i < titles.length;
    return {
      id: String(i + 1),
      title: unlocked ? titles[i] : `Phase ${i + 1}`,
      locked: !unlocked,
      description: unlocked ? descriptions[i] : undefined,
      pathID: unlocked ? pathIDs[i] : undefined,
    };
  });
}

// ─────────────────────────────────────────────
// LAYOUT CONSTANTS
// ─────────────────────────────────────────────

const NODE_SIZE = 72;
const SLOT_W = 96;
const SIDE_PAD = 32;
const CONNECTOR_H = 90;
const DOT_COUNT = 7;
const DOT_SIZE = 9;

type Position = "left" | "center" | "right";
const ZIGZAG: Position[] = ["left", "center", "right", "center"];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function nodeCenterX(pos: Position, screenWidth: number): number {
  if (pos === "left") return SIDE_PAD + SLOT_W / 2;
  if (pos === "right") return screenWidth - SIDE_PAD - SLOT_W / 2;
  return screenWidth / 2;
}

// ─────────────────────────────────────────────
// CONNECTOR — dotted path between nodes
// ─────────────────────────────────────────────

interface ConnectorProps {
  from: Position;
  to: Position;
  unlocked: boolean;
  screenWidth: number;
}

const Connector: React.FC<ConnectorProps> = ({
  from,
  to,
  unlocked,
  screenWidth,
}) => {
  const sx = nodeCenterX(from, screenWidth);
  const ex = nodeCenterX(to, screenWidth);
  const color = unlocked ? "#8DCB7A" : "#C4D9C4";

  const dots = Array.from({ length: DOT_COUNT }, (_, i) => {
    const t = i / (DOT_COUNT - 1);
    return {
      left: sx + (ex - sx) * t - DOT_SIZE / 2,
      top: t * (CONNECTOR_H - DOT_SIZE),
    };
  });

  return (
    <View style={{ height: CONNECTOR_H, width: screenWidth }}>
      {dots.map((d, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            { left: d.left, top: d.top, backgroundColor: color },
          ]}
        />
      ))}
    </View>
  );
};

// ─────────────────────────────────────────────
// NODE BUTTON — animated circle
// ─────────────────────────────────────────────

interface NodeButtonProps {
  node: JourneyNodeData;
  index: number;
  onPress: (node: JourneyNodeData) => void;
}

const NodeButton: React.FC<NodeButtonProps> = ({ node, index, onPress }) => {
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
    if (node.locked) return;
    pressScale.value = withSequence(
      withTiming(0.88, { duration: 70 }),
      withSpring(1, { damping: 10, stiffness: 200 }),
    );
    onPress(node);
  };

  const bg = node.locked ? "#C0D4C0" : "#58CC02";
  const border = node.locked ? "#A4BCA4" : "#46A400";

  return (
    <Animated.View style={[{ width: SLOT_W, alignItems: "center" }, animStyle]}>
      <Pressable
        onPress={handlePress}
        disabled={node.locked}
        style={[
          styles.nodeCircle,
          {
            backgroundColor: bg,
            borderColor: border,
            opacity: node.locked ? 0.68 : 1,
            shadowOpacity: node.locked ? 0.06 : 0.16,
          },
        ]}
      >
        <Text style={styles.nodeIcon}>{node.id}</Text>
        {node.locked && (
          <View style={styles.lockBadge}>
            <Text style={styles.lockEmoji}>🔒</Text>
          </View>
        )}
      </Pressable>

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
// DESCRIPTION POPUP — appears on node tap
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
          <Text style={styles.popupDesc}>{node.description}</Text>

          <TouchableOpacity
            onPress={() => onStart(node)}
            style={styles.startBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.startBtnText}>Start →</Text>
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
  // get teamId
  const { teamId } = useTeamStore();

  // get sessionId
  const { sessionId, setSessionId } = useSessionStore();

  const { journeyData } = useLocalSearchParams<{ journeyData: string }>();
  const {
    titles = [],
    descriptions = [],
    pathIDs = [],
  } = journeyData
    ? (JSON.parse(journeyData as string) as {
        titles: string[];
        descriptions: string[];
        pathIDs: string[];
      })
    : {};

  const nodes = buildNodes(titles, descriptions, pathIDs);

  const handleStart = (node: JourneyNodeData) => {
    setActiveNode(null);
    console.log(node.pathID);
    if (!node.pathID) return;
    if (!teamId) {
      console.log("No teamId found");
      return;
    }
    router.push(node.pathID as any);
  };

  return (
    // Background: "SciTrail" — sage green nature-science palette
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {nodes.map((node, i) => {
          const pos = ZIGZAG[i % ZIGZAG.length];
          const nextPos = ZIGZAG[(i + 1) % ZIGZAG.length];
          const isLast = i === nodes.length - 1;

          const justify =
            pos === "left"
              ? "flex-start"
              : pos === "right"
                ? "flex-end"
                : "center";

          return (
            <React.Fragment key={node.id}>
              <View
                style={[
                  styles.nodeRow,
                  {
                    justifyContent: justify,
                    paddingLeft: pos === "left" ? SIDE_PAD : 0,
                    paddingRight: pos === "right" ? SIDE_PAD : 0,
                  },
                ]}
              >
                <NodeButton node={node} index={i} onPress={setActiveNode} />
              </View>

              {!isLast && (
                <Connector
                  from={pos}
                  to={nextPos}
                  unlocked={!node.locked}
                  screenWidth={width}
                />
              )}
            </React.Fragment>
          );
        })}
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
    backgroundColor: "#EAF4EA", // SciTrail background
  },
  scrollContent: {
    paddingTop: 28,
    paddingBottom: 64,
  },

  // Connector dot
  dot: {
    position: "absolute",
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },

  // Node
  nodeRow: {
    flexDirection: "row",
    width: "100%",
  },
  nodeCircle: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  nodeIcon: {
    fontSize: 28,
  },
  lockBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
  },
  lockEmoji: {
    fontSize: 14,
  },
  nodeLabel: {
    marginTop: 7,
    fontSize: 11,
    fontWeight: "600",
    color: "#1A3A1A",
    textAlign: "center",
    width: SLOT_W,
    lineHeight: 15,
  },
  nodeLabelLocked: {
    color: "#7A917A",
  },

  // Popup modal
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
  popupIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A3A1A",
    textAlign: "center",
    marginBottom: 10,
  },
  popupDesc: {
    fontSize: 13,
    color: "#4A6A4A",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  startBtn: {
    width: "100%",
    backgroundColor: "#58CC02",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#46A400",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
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
    color: "#8A9E8A",
    fontSize: 13,
  },
});
