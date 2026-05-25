  import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Line } from 'react-native-svg';
import { useVideoPlayer, VideoView } from 'expo-video';

interface Props {
  videoUri: string;
  onRetake: () => void;
}

interface Point { x: number; y: number }

// Which action the next tap on the video will perform
type PendingMode = 'A' | 'B' | 'C' | 'CAL_1' | 'CAL_2' | null;

const CROSS = 18;     // half-arm length for measurement crosshairs
const CROSS_CAL = 13; // half-arm length for calibration crosshairs

// ─── Inline crosshair component ──────────────────────────────────────────────

function Crosshair({ pt, label, color, size }: {
  pt: Point; label: string; color: string; size: number;
}) {
  return (
    <View
      pointerEvents="none"
      style={[styles.crossWrap, { left: pt.x - size, top: pt.y - size, width: size * 2, height: size * 2 }]}
    >
      <View style={[styles.crossH, { width: size * 2, backgroundColor: color }]} />
      <View style={[styles.crossV, { height: size * 2, backgroundColor: color }]} />
      <Text style={[styles.crossLabel, { color, left: size + 4 }]}>{label}</Text>
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function HandFanVideoPreview({ videoUri, onRetake }: Props) {
  // Measurement points
  const [ptA, setPtA] = useState<Point | null>(null);
  const [ptB, setPtB] = useState<Point | null>(null);
  const [ptC, setPtC] = useState<Point | null>(null);

  // Which button was last pressed — determines what the next tap does
  const [pending, setPending] = useState<PendingMode>(null);

  // Playback
  const [isPlaying, setIsPlaying] = useState(true);

  // Calibration
  const [calPt1, setCalPt1] = useState<Point | null>(null);
  const [calPt2, setCalPt2] = useState<Point | null>(null);
  const [pxPerCm, setPxPerCm] = useState<number | null>(null);
  const [showCalModal, setShowCalModal] = useState(false);
  const [calInput, setCalInput] = useState('');

  const player = useVideoPlayer(videoUri, p => {
    p.loop = true;
    p.play();
  });

  // ── Play / pause ────────────────────────────────────────────────────────────
  function togglePlayPause() {
    if (isPlaying) player.pause(); else player.play();
    setIsPlaying(v => !v);
  }

  // ── Distance ────────────────────────────────────────────────────────────────
  const rawAB = ptA && ptB
    ? Math.sqrt((ptB.x - ptA.x) ** 2 + (ptB.y - ptA.y) ** 2)
    : null;

  const rawBC = ptB && ptC
    ? Math.sqrt((ptC.x - ptB.x) ** 2 + (ptC.y - ptB.y) ** 2)
    : null;

  function fmtDist(px: number | null) {
    if (px === null) return null;
    return pxPerCm ? `${(px / pxPerCm).toFixed(2)} cm` : `${px.toFixed(1)} px`;
  }

  const distABText = fmtDist(rawAB);
  const distBCText = fmtDist(rawBC);

  // ── HUD instruction ─────────────────────────────────────────────────────────
  const hudText =
    pending === 'A'     ? 'Tap video to place A' :
    pending === 'B'     ? 'Tap video to place B' :
    pending === 'C'     ? 'Tap video to place C' :
    pending === 'CAL_1' ? 'Tap calibration point 1' :
    pending === 'CAL_2' ? 'Tap calibration point 2' :
    distABText          ? `A→B: ${distABText}${distBCText ? `   B→C: ${distBCText}` : ''}` :
    'Press Set A / Set B / Set C to begin';

  // ── Calibration apply ───────────────────────────────────────────────────────
  function applyCalibration() {
    const cm = parseFloat(calInput);
    if (!cm || cm <= 0 || !calPt1 || !calPt2) return;
    const d = Math.sqrt((calPt2.x - calPt1.x) ** 2 + (calPt2.y - calPt1.y) ** 2);
    setPxPerCm(d / cm);
    setShowCalModal(false);
    setCalInput('');
  }

  // ── Tap gesture ─────────────────────────────────────────────────────────────
  const tapGesture = Gesture.Tap().runOnJS(true).onEnd((e) => {
    const pt = { x: e.x, y: e.y };
    switch (pending) {
      case 'A':     setPtA(pt);      setPending(null);    break;
      case 'B':     setPtB(pt);      setPending(null);    break;
      case 'C':     setPtC(pt);      setPending(null);    break;
      case 'CAL_1': setCalPt1(pt);   setCalPt2(null);  setPending('CAL_2'); break;
      case 'CAL_2': setCalPt2(pt);   setPending(null);   setShowCalModal(true); break;
    }
  });

  const isCalPending = pending === 'CAL_1' || pending === 'CAL_2';

  return (
    <View style={styles.screen}>

      {/* ── Video ── */}
      <VideoView player={player} style={styles.video} contentFit="contain" />

      {/* ── SVG: dashed yellow line between A and B, green between B and C ── */}
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        {ptA && ptB && (
          <Line
            x1={ptA.x} y1={ptA.y} x2={ptB.x} y2={ptB.y}
            stroke="#facc15" strokeWidth={2} strokeDasharray="6,4"
          />
        )}
        {ptB && ptC && (
          <Line
            x1={ptB.x} y1={ptB.y} x2={ptC.x} y2={ptC.y}
            stroke="#4ade80" strokeWidth={2} strokeDasharray="6,4"
          />
        )}
      </Svg>

      {/* ── SVG: dashed cyan line between calibration points ── */}
      {calPt1 && calPt2 && (
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          <Line
            x1={calPt1.x} y1={calPt1.y} x2={calPt2.x} y2={calPt2.y}
            stroke="#22d3ee" strokeWidth={1.5} strokeDasharray="4,4"
          />
        </Svg>
      )}

      {/* ── Crosshair markers ── */}
      {ptA    && <Crosshair pt={ptA}    label="A"  color="#ef4444" size={CROSS}     />}
      {ptB    && <Crosshair pt={ptB}    label="B"  color="#ef4444" size={CROSS}     />}
      {ptC    && <Crosshair pt={ptC}    label="C"  color="#4ade80" size={CROSS}     />}
      {calPt1 && <Crosshair pt={calPt1} label="C1" color="#22d3ee" size={CROSS_CAL} />}
      {calPt2 && <Crosshair pt={calPt2} label="C2" color="#22d3ee" size={CROSS_CAL} />}

      {/* ── Tap-capture overlay (under buttons) ── */}
      <GestureDetector gesture={tapGesture}>
        <View style={StyleSheet.absoluteFill} />
      </GestureDetector>

      {/* ── HUD (top center) ── */}
      <View style={styles.hud} pointerEvents="none">
        <Text style={styles.hudText}>{hudText}</Text>
        {pxPerCm && (
          <Text style={styles.calBadge}>✓ calibrated</Text>
        )}
      </View>

      {/* ── Right-side buttons: Set A / Set B / Cal ── */}
      <View style={styles.rightBar}>
        <TouchableOpacity
          style={[styles.sideBtn, pending === 'A' && styles.sideBtnA]}
          onPress={() => setPending(p => p === 'A' ? null : 'A')}
        >
          <Text style={styles.sideBtnText}>Set A</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sideBtn, pending === 'B' && styles.sideBtnB]}
          onPress={() => setPending(p => p === 'B' ? null : 'B')}
        >
          <Text style={styles.sideBtnText}>Set B</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sideBtn, pending === 'C' && styles.sideBtnC]}
          onPress={() => setPending(p => p === 'C' ? null : 'C')}
        >
          <Text style={styles.sideBtnText}>Set C</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sideBtn, isCalPending && styles.sideBtnCal]}
          onPress={() => {
            setCalPt1(null);
            setCalPt2(null);
            setPxPerCm(null);
            setPending(isCalPending ? null : 'CAL_1');
          }}
        >
          <Text style={styles.sideBtnText}>{pxPerCm ? 'Re-Cal' : 'Cal'}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Bottom bar: pause / clear / retake ── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.btnIcon} onPress={togglePlayPause}>
          <Text style={styles.btnIconText}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => { setPtA(null); setPtB(null); setPtC(null); setPending(null); }}
        >
          <Text style={styles.btnSecondaryText}>Clear</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnDanger} onPress={onRetake}>
          <Text style={styles.btnDangerText}>Retake</Text>
        </TouchableOpacity>
      </View>

      {/* ── Calibration modal ── */}
      <Modal
        transparent
        animationType="fade"
        visible={showCalModal}
        onRequestClose={() => setShowCalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Set calibration scale</Text>
            <Text style={styles.modalSub}>
              How far apart are the two cyan points in real life?
            </Text>

            <View style={styles.modalInputRow}>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                placeholder="e.g. 10"
                placeholderTextColor="#94a3b8"
                value={calInput}
                onChangeText={setCalInput}
              />
              <Text style={styles.modalUnit}>cm</Text>
            </View>

            <TouchableOpacity style={styles.modalBtn} onPress={applyCalibration}>
              <Text style={styles.modalBtnText}>Apply calibration</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowCalModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  video:  { flex: 1 },

  // Crosshair
  crossWrap: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  crossH: { position: 'absolute', height: 2 },
  crossV: { position: 'absolute', width: 2 },
  crossLabel: {
    position: 'absolute',
    top: -18,
    fontSize: 11,
    fontWeight: '800',
  },

  // HUD
  hud: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 2,
  },
  hudText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  calBadge: { color: '#22d3ee', fontSize: 10, fontWeight: '700' },

  // Right-side buttons
  rightBar: {
    position: 'absolute',
    right: 12,
    top: '30%',
    gap: 10,
  },
  sideBtn: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  sideBtnA:   { backgroundColor: '#ef4444', borderColor: '#ef4444' },
  sideBtnB:   { backgroundColor: '#ef4444', borderColor: '#ef4444' },
  sideBtnC:   { backgroundColor: '#16a34a', borderColor: '#4ade80' },
  sideBtnCal: { backgroundColor: '#0891b2', borderColor: '#22d3ee' },
  sideBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 24,
  },
  btnIcon: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  btnIconText: { fontSize: 22 },
  btnSecondary: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  btnSecondaryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  btnDanger: {
    backgroundColor: '#ef4444',
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  btnDangerText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  // Calibration modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
  },
  modalSub: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  modalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    width: 100,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalUnit: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600',
  },
  modalBtn: {
    backgroundColor: '#22d3ee',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  modalBtnText: { color: '#0f172a', fontSize: 15, fontWeight: '800' },
  modalCancel: { marginTop: 12, paddingVertical: 6 },
  modalCancelText: { color: '#64748b', fontSize: 13 },
});
