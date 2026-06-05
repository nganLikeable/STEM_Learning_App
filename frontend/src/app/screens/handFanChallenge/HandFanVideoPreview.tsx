import { calculateFinalPoints257, setActivity3 } from '@/src/services/activity';
import { advanceSessionById, getActiveSession } from '@/src/services/session';
import { updateTeamScore } from '@/src/services/teamScore';
import { useSessionStore } from '@/src/store/session-store';
import { useTeamStore } from '@/src/store/team-store';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Line } from 'react-native-svg';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/src/services/firestore';

interface Props {
  videoUri: string;
  onRetake: () => void;
  design: number;
  journeyData?: string;
}

interface Point { x: number; y: number }

type PendingMode = 'A' | 'B' | 'C' | null;

const CROSS = 18;
const TOTAL_PHASES = 3;

// ─── Crosshair ───────────────────────────────────────────────────────────────

function Crosshair({ pt, label, color }: { pt: Point; label: string; color: string }) {
  return (
    <View
      pointerEvents="none"
      style={[styles.crossWrap, { left: pt.x - CROSS, top: pt.y - CROSS, width: CROSS * 2, height: CROSS * 2 }]}
    >
      <View style={[styles.crossH, { width: CROSS * 2, backgroundColor: color }]} />
      <View style={[styles.crossV, { height: CROSS * 2, backgroundColor: color }]} />
      <Text style={[styles.crossLabel, { color, left: CROSS + 4 }]}>{label}</Text>
    </View>
  );
}

// ─── Angle label floating at vertex C ────────────────────────────────────────

function AngleLabel({ pt, angle }: { pt: Point; angle: number }) {
  return (
    <View
      pointerEvents="none"
      style={[styles.angleLabel, { left: pt.x - 56, top: pt.y + CROSS + 6 }]}
    >
      <Text style={styles.angleLabelText}>∠ACB = {angle.toFixed(1)}°</Text>
    </View>
  );
}

// ─── Angle ACB at vertex C using atan2(|cross|, dot) ─────────────────────────

function calcAngleACB(a: Point, c: Point, b: Point): number {
  const cax = a.x - c.x, cay = a.y - c.y;
  const cbx = b.x - c.x, cby = b.y - c.y;
  const dot   = cax * cbx + cay * cby;
  const cross = Math.abs(cax * cby - cay * cbx);
  return Math.atan2(cross, dot) * (180 / Math.PI);
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function HandFanVideoPreview({ videoUri, onRetake, design, journeyData }: Props) {
  const router = useRouter();
  const { teamId } = useTeamStore();
  const { sessionId } = useSessionStore();

  const [ptA, setPtA] = useState<Point | null>(null);
  const [ptB, setPtB] = useState<Point | null>(null);
  const [ptC, setPtC] = useState<Point | null>(null);
  const [pending, setPending] = useState<PendingMode>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [saving, setSaving] = useState(false);

  const player = useVideoPlayer(videoUri, p => { p.loop = true; p.play(); });

  function togglePlayPause() {
    if (isPlaying) player.pause(); else player.play();
    setIsPlaying(v => !v);
  }

  // ── Angle ────────────────────────────────────────────────────────────────────
  const angle = ptA && ptB && ptC ? calcAngleACB(ptA, ptC, ptB) : null;

  // ── HUD instruction (only shown when no angle yet) ───────────────────────────
  const hudText =
    pending === 'A' ? 'Tap video to place A' :
    pending === 'B' ? 'Tap video to place B' :
    pending === 'C' ? 'Tap video to place C (vertex)' :
    angle !== null  ? null :
    'Set A, B and C to measure the angle';

  // ── Tap gesture ──────────────────────────────────────────────────────────────
  const tapGesture = Gesture.Tap().runOnJS(true).onEnd((e) => {
    const pt = { x: e.x, y: e.y };
    switch (pending) {
      case 'A': setPtA(pt); setPending(null); break;
      case 'B': setPtB(pt); setPending(null); break;
      case 'C': setPtC(pt); setPending(null); break;
    }
  });

  // ── Finish: save → advance → navigate ────────────────────────────────────────
  // Score = raw angle in degrees so calculateFinalPoints257 can compare designs.
  // Points are only awarded if the prediction matches the design with highest angle.
  async function handleFinish() {
    if (angle === null || !teamId) return;

    // Fall back to Firestore lookup if the store lost the session (e.g. nav reset)
    const targetSessionId = sessionId ?? (await getActiveSession(teamId, 3))?.id;
    if (!targetSessionId) return;
    setSaving(true);
    try {
      const activityDocId = await setActivity3(teamId, targetSessionId, design, angle);
      const score = Math.round(angle);
      const updatedSession = await advanceSessionById(
        targetSessionId, activityDocId, score, TOTAL_PHASES,
        { angleACB: angle, designNo: design },
      );

      if (updatedSession?.completed) {
        const finalPoints = calculateFinalPoints257(updatedSession);
        await updateDoc(doc(db, 'sessions', targetSessionId), { totalPoints: finalPoints });
        await updateTeamScore(teamId);
        router.replace('/screens/handFanChallenge/ReflectionScreen');
        return;
      }

      if (journeyData) {
        router.replace({ pathname: '/journey', params: { journeyData } } as any);
        return;
      }

      router.replace('/screens/handFanChallenge/InstructionScreen');
    } catch (e) {
      console.error('Failed to save hand fan result', e);
      setSaving(false);
    }
  }

  return (
    <View style={styles.screen}>

      {/* ── Video ── */}
      <VideoView player={player} style={styles.video} contentFit="contain" />

      {/* ── SVG lines: A–C yellow, C–B green ── */}
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        {ptA && ptC && (
          <Line x1={ptA.x} y1={ptA.y} x2={ptC.x} y2={ptC.y}
            stroke="#facc15" strokeWidth={2} strokeDasharray="6,4" />
        )}
        {ptC && ptB && (
          <Line x1={ptC.x} y1={ptC.y} x2={ptB.x} y2={ptB.y}
            stroke="#4ade80" strokeWidth={2} strokeDasharray="6,4" />
        )}
      </Svg>

      {/* ── Crosshairs ── */}
      {ptA && <Crosshair pt={ptA} label="A" color="#facc15" />}
      {ptB && <Crosshair pt={ptB} label="B" color="#4ade80" />}
      {ptC && <Crosshair pt={ptC} label="C" color="#ef4444" />}

      {/* ── Angle label at vertex C ── */}
      {ptC && angle !== null && <AngleLabel pt={ptC} angle={angle} />}

      {/* ── Tap overlay ── */}
      <GestureDetector gesture={tapGesture}>
        <View style={StyleSheet.absoluteFill} />
      </GestureDetector>

      {/* ── HUD — only shown while placing points ── */}
      {hudText !== null && (
        <View style={styles.hud} pointerEvents="none">
          <Text style={styles.hudText}>{hudText}</Text>
        </View>
      )}

      {/* ── Design badge ── */}
      <View style={styles.designBadge} pointerEvents="none">
        <Text style={styles.designBadgeText}>Design {design}</Text>
      </View>

      {/* ── Right buttons: Set A / B / C ── */}
      <View style={styles.rightBar}>
        <TouchableOpacity
          style={[styles.sideBtn, pending === 'A' && styles.sideBtnActive]}
          onPress={() => setPending(p => p === 'A' ? null : 'A')}
        >
          <Text style={styles.sideBtnText}>Set A</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sideBtn, pending === 'B' && styles.sideBtnActive]}
          onPress={() => setPending(p => p === 'B' ? null : 'B')}
        >
          <Text style={styles.sideBtnText}>Set B</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sideBtn, pending === 'C' && styles.sideBtnC]}
          onPress={() => setPending(p => p === 'C' ? null : 'C')}
        >
          <Text style={styles.sideBtnText}>Set C</Text>
          <Text style={styles.sideBtnSub}>vertex</Text>
        </TouchableOpacity>
      </View>

      {/* ── Bottom bar ── */}
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

      {/* ── Finish — appears once angle is measured ── */}
      {angle !== null && (
        <TouchableOpacity
          style={[styles.finishBtn, saving && styles.finishBtnDisabled]}
          onPress={handleFinish}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.finishBtnText}>Finish  →</Text>
          }
        </TouchableOpacity>
      )}

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  video:  { flex: 1 },

  crossWrap: { position: 'absolute', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' },
  crossH:    { position: 'absolute', height: 2 },
  crossV:    { position: 'absolute', width: 2 },
  crossLabel: { position: 'absolute', top: -18, fontSize: 11, fontWeight: '800' },

  // Angle label pinned below vertex C
  angleLabel: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ef4444',
    width: 112,
    alignItems: 'center',
  },
  angleLabelText: { color: '#facc15', fontSize: 13, fontWeight: '800' },

  // HUD — instruction only, hidden once angle is set
  hud: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  hudText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  designBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(108,99,255,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  designBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  rightBar: { position: 'absolute', right: 12, top: '30%', gap: 10 },
  sideBtn: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  sideBtnActive: { backgroundColor: '#ef4444', borderColor: '#ef4444' },
  sideBtnC:      { backgroundColor: '#16a34a', borderColor: '#4ade80' },
  sideBtnText:   { color: '#fff', fontSize: 13, fontWeight: '700' },
  sideBtnSub:    { color: 'rgba(255,255,255,0.6)', fontSize: 9, marginTop: 2 },

  bottomBar: {
    position: 'absolute',
    bottom: 100,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 24,
  },
  btnIcon: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    width: 52, height: 52,
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

  finishBtn: {
    position: 'absolute',
    bottom: 36,
    alignSelf: 'center',
    backgroundColor: '#6C63FF',
    paddingVertical: 15,
    paddingHorizontal: 48,
    borderRadius: 14,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  finishBtnDisabled: { backgroundColor: '#4b4680', opacity: 0.7 },
  finishBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
});
