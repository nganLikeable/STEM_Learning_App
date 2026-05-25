import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter, useLocalSearchParams } from 'expo-router';

// ─── Types & data ─────────────────────────────────────────────────────────────

export interface JourneyNodeData {
  id: string;
  title: string;
  locked: boolean;
  description?: string;
  pathID?: string;
}

function buildNodes(titles: string[], descriptions: string[], pathIDs: string[]): JourneyNodeData[] {
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

// ─── Layout constants ─────────────────────────────────────────────────────────

const ROW_H    = 130;
const PAD_TOP  = 80;
const PAD_BOT  = 120;
const NODE_R   = 34;
const ACTIVE_R = 42;
const GLOW_PAD = 16;  // extra radius for active node glow rings

// Right-left alternating creates a dramatic S-curve matching the reference design
const ZIGZAG = ['right', 'left', 'right', 'left'] as const;
type Col = typeof ZIGZAG[number];

function colX(col: Col, w: number): number {
  if (col === 'left')  return w * 0.22;
  if (col === 'right') return w * 0.75;
  return w * 0.5;
}

function getNodePos(index: number, w: number) {
  return {
    x: colX(ZIGZAG[index % 4], w),
    y: PAD_TOP + index * ROW_H,
  };
}

// ─── SVG helpers ─────────────────────────────────────────────────────────────

function segmentD(a: { x: number; y: number }, b: { x: number; y: number }): string {
  const dy = (b.y - a.y) * 0.45;
  return `M${a.x},${a.y} C${a.x},${a.y + dy} ${b.x},${b.y - dy} ${b.x},${b.y}`;
}

// ─── Node button ─────────────────────────────────────────────────────────────

interface NodeButtonProps {
  node: JourneyNodeData;
  isActive: boolean;
  x: number;
  y: number;
  onPress: (node: JourneyNodeData) => void;
}

const NodeButton: React.FC<NodeButtonProps> = ({ node, isActive, x, y, onPress }) => {
  const r = isActive ? ACTIVE_R : NODE_R;
  const totalR = isActive ? r + GLOW_PAD : r;

  return (
    <View style={[styles.nodeWrap, { left: x - totalR, top: y - totalR }]}>
      {isActive ? (
        // Glowing gold active node
        <View style={{ width: totalR * 2, height: totalR * 2, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{
            position: 'absolute',
            width: totalR * 2,
            height: totalR * 2,
            borderRadius: totalR,
            backgroundColor: 'rgba(255, 208, 0, 0.20)',
          }} />
          <View style={{
            position: 'absolute',
            width: (r + 8) * 2,
            height: (r + 8) * 2,
            borderRadius: r + 8,
            backgroundColor: 'rgba(255, 208, 0, 0.38)',
          }} />
          <Pressable
            onPress={() => onPress(node)}
            style={[styles.nodeCircle, styles.nodeActive, { width: r * 2, height: r * 2, borderRadius: r }]}
          >
            <Text style={[styles.nodeIcon, styles.nodeIconActive]}>{node.id}</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={() => !node.locked && onPress(node)}
          disabled={node.locked}
          style={[
            styles.nodeCircle,
            { width: r * 2, height: r * 2, borderRadius: r },
            node.locked ? styles.nodeLocked : styles.nodeUnlocked,
          ]}
        >
          {node.locked ? (
            <Text style={styles.lockIcon}>🔒</Text>
          ) : (
            <Text style={styles.nodeIcon}>{node.id}</Text>
          )}
        </Pressable>
      )}

      <Text numberOfLines={2} style={[styles.nodeLabel, node.locked && styles.nodeLabelLocked]}>
        {node.title}
      </Text>
    </View>
  );
};

// ─── Description popup ────────────────────────────────────────────────────────

interface DescriptionPopupProps {
  node: JourneyNodeData | null;
  onClose: () => void;
  onStart: (node: JourneyNodeData) => void;
}

const DescriptionPopup: React.FC<DescriptionPopupProps> = ({ node, onClose, onStart }) => (
  <Modal transparent animationType="fade" visible={!!node} onRequestClose={onClose}>
    <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
      {node && (
        <View style={styles.popupCard}>
          <Text style={styles.popupTitle}>{node.title}</Text>
          <Text style={styles.popupDesc}>{node.description}</Text>
          <TouchableOpacity onPress={() => onStart(node)} style={styles.startBtn} activeOpacity={0.85}>
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

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function JourneyComponent() {
  const { width } = useWindowDimensions();
  const router    = useRouter();
  const [activeNode, setActiveNode] = useState<JourneyNodeData | null>(null);

  const { journeyData } = useLocalSearchParams<{ journeyData: string }>();
  const { titles = [], descriptions = [], pathIDs = [] } = journeyData
    ? JSON.parse(journeyData as string) as { titles: string[]; descriptions: string[]; pathIDs: string[] }
    : {};

  const nodes = buildNodes(titles, descriptions, pathIDs);
  const activeIndex = titles.length > 0 ? titles.length - 1 : 0;

  const handleStart = (node: JourneyNodeData) => {
    setActiveNode(null);
    if (node.pathID) router.push(node.pathID as never);
  };

  const totalH    = PAD_TOP + (nodes.length - 1) * ROW_H + PAD_BOT;
  const positions = nodes.map((_, i) => getNodePos(i, width));

  const segments = nodes.slice(0, -1).map((_, i) => ({
    d:    segmentD(positions[i], positions[i + 1]),
    done: i < activeIndex,
  }));

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ width, height: totalH }}>

          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg width={width} height={totalH}>
              {segments.map((seg, i) => (
                <React.Fragment key={i}>
                  {/* Road border / shadow layer */}
                  <Path
                    d={seg.d}
                    stroke={seg.done ? '#2D6A1F' : '#A89EC8'}
                    strokeWidth={54}
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Road surface */}
                  <Path
                    d={seg.d}
                    stroke={seg.done ? '#5AD446' : '#C8BEDC'}
                    strokeWidth={44}
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Broken center line */}
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#EEE8F8',
  },

  nodeWrap: {
    position: 'absolute',
    alignItems: 'center',
  },

  nodeCircle: {
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  nodeActive: {
    backgroundColor: '#FFD000',
    borderColor: '#E8A800',
    shadowColor: '#FFD000',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  nodeLocked: {
    backgroundColor: '#C0BCCE',
    borderColor: '#A8A4B8',
    shadowColor: '#000',
  },
  nodeUnlocked: {
    backgroundColor: '#6C63FF',
    borderColor: '#4A3FD8',
    shadowColor: '#6C63FF',
  },

  nodeIcon: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  nodeIconActive: {
    fontSize: 24,
    color: '#7A4F00',
  },
  lockIcon: {
    fontSize: 18,
  },

  nodeLabel: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '600',
    color: '#3D2C6A',
    textAlign: 'center',
    width: 90,
    lineHeight: 14,
  },
  nodeLabelLocked: {
    color: '#A8A4B8',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 26,
    width: '78%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1240',
    textAlign: 'center',
    marginBottom: 10,
  },
  popupDesc: {
    fontSize: 13,
    color: '#5A4E8A',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  startBtn: {
    width: '100%',
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  startBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  notNowBtn: {
    marginTop: 13,
    paddingVertical: 4,
  },
  notNowText: {
    color: '#9890B8',
    fontSize: 13,
  },
});
