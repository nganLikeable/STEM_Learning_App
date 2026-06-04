import { calculateFinalPoints1 } from "@/src/services/activity";
import { db } from "@/src/services/firestore";
import { SessionDoc, getSessionById } from "@/src/services/session";
import { updateTeamScore } from "@/src/services/teamScore";
import { useSessionStore } from "@/src/store/session-store";
import { useTeamStore } from "@/src/store/team-store";
import { useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NAVY = "#1A2F5A";
const BLUE = "#3977fd";
const GREEN = "#16a34a";
const SLATE = "#64748B";
const BG = "#F4F6F9";

export default function PickBestDesignScreen() {
  const router = useRouter();
  const { sessionId } = useSessionStore();
  const { teamId } = useTeamStore();

  const [videoUrls, setVideoUrls] = useState<(string | null)[]>([
    null,
    null,
    null,
  ]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [sessionData, setSessionData] = useState<SessionDoc | null>(null);

  useEffect(() => {
    async function load() {
      if (!sessionId) return;
      try {
        const session = await getSessionById(sessionId);
        if (!session) return;

        setSessionData(session);

        const activities = session.activitiesCompleted ?? [];
        const urls = await Promise.all(
          activities.map(async ({ activityId }) => {
            const snap = await getDoc(doc(db, "activities", activityId));
            return (snap.data()?.videoUrl as string) ?? null;
          }),
        );

        setVideoUrls([urls[0] ?? null, urls[1] ?? null, urls[2] ?? null]);
      } catch (e) {
        console.error("Failed to load activity videos", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sessionId]);

  async function handleConfirm() {
    if (selected === null || !sessionId || !sessionData) return;

    setSaving(true);
    try {
      // inject bestDesign into the local session snapshot so calculateFinalPoints1 can compare it
      const sessionWithBest: SessionDoc = { ...sessionData, bestDesign: selected };
      const finalPoints = calculateFinalPoints1(sessionWithBest);

      await updateDoc(doc(db, "sessions", sessionId), {
        bestDesign: selected,
        totalPoints: finalPoints,
      });
      if (teamId) await updateTeamScore(teamId);
      router.replace("/screens/parachute/ReflectionScreen");
    } catch (e) {
      console.error("Failed to save best design", e);
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={BLUE} />
        <Text style={styles.loadingText}>Loading your designs...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.pageHeader}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>FINAL STEP</Text>
          </View>
          <Text style={styles.pageEmoji}>🏆</Text>
          <Text style={styles.pageHeading}>Pick the Best Design</Text>
          <Text style={styles.pageSub}>
            Watch each drop and choose the slowest, safest landing within the
            target area.
          </Text>
        </View>

        {videoUrls.map((url, i) => (
          <VideoCard
            key={i}
            designNumber={i + 1}
            videoUrl={url}
            isSelected={selected === i + 1}
            onSelect={() => setSelected(i + 1)}
          />
        ))}

        <Pressable
          style={[
            styles.confirmBtn,
            (selected === null || saving) && styles.confirmBtnDisabled,
          ]}
          onPress={handleConfirm}
          disabled={selected === null || saving}
        >
          <Text style={styles.confirmBtnText}>
            {saving
              ? "Saving..."
              : selected !== null
                ? `Confirm Design ${selected}  →`
                : "Select a Design First"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function VideoCard({
  designNumber,
  videoUrl,
  isSelected,
  onSelect,
}: {
  designNumber: number;
  videoUrl: string | null;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <View style={[styles.card, isSelected && styles.cardSelected]}>
      <View style={styles.cardHeader}>
        <View
          style={[styles.designBadge, isSelected && styles.designBadgeSelected]}
        >
          <Text
            style={[
              styles.designBadgeText,
              isSelected && styles.designBadgeTextSelected,
            ]}
          >
            Design {designNumber}
          </Text>
        </View>
        {isSelected && (
          <View style={styles.selectedTag}>
            <Text style={styles.selectedTagText}>YOUR PICK</Text>
          </View>
        )}
      </View>

      {videoUrl ? (
        <InlineVideoPlayer videoUrl={videoUrl} />
      ) : (
        <View style={styles.noVideoBox}>
          <Text style={styles.noVideoIcon}>🎥</Text>
          <Text style={styles.noVideoText}>
            No video recorded for this design
          </Text>
        </View>
      )}

      <Pressable
        style={[styles.selectBtn, isSelected && styles.selectBtnActive]}
        onPress={onSelect}
      >
        <Text
          style={[
            styles.selectBtnText,
            isSelected && styles.selectBtnTextActive,
          ]}
        >
          {isSelected ? "✓  Selected as Best" : "Select This Design"}
        </Text>
      </Pressable>
    </View>
  );
}

function InlineVideoPlayer({ videoUrl }: { videoUrl: string }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = true;
  });

  const togglePlay = () => {
    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  };

  return (
    <View style={styles.videoContainer}>
      <VideoView
        style={styles.videoView}
        player={player}
        allowsPictureInPicture={false}
        contentFit="contain"
        nativeControls={false}
      />
      <Pressable style={styles.playOverlay} onPress={togglePlay}>
        <View style={styles.playCircle}>
          <Text style={styles.playIcon}>{isPlaying ? "⏸" : "▶"}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 48, gap: 16 },

  centered: {
    flex: 1,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { color: SLATE, fontSize: 15 },

  pageHeader: {
    backgroundColor: NAVY,
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  stepBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  stepBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
  },
  pageEmoji: { fontSize: 44, marginBottom: 8 },
  pageHeading: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
  },
  pageSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
    marginTop: 6,
    textAlign: "center",
    lineHeight: 19,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  cardSelected: {
    borderColor: GREEN,
    backgroundColor: "#F0FDF4",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  designBadge: {
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  designBadgeSelected: {
    backgroundColor: "#DCFCE7",
    borderColor: "#86EFAC",
  },
  designBadgeText: {
    color: BLUE,
    fontSize: 13,
    fontWeight: "700",
  },
  designBadgeTextSelected: {
    color: GREEN,
  },
  selectedTag: {
    backgroundColor: GREEN,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  selectedTagText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },

  videoContainer: {
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#000",
    height: 220,
    position: "relative",
  },
  videoView: {
    flex: 1,
  },
  playOverlay: {
    position: "absolute",
    bottom: 10,
    right: 10,
  },
  playCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
  },
  playIcon: {
    color: "#FFFFFF",
    fontSize: 16,
  },

  noVideoBox: {
    height: 140,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  noVideoIcon: { fontSize: 32 },
  noVideoText: { color: SLATE, fontSize: 13 },

  selectBtn: {
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#BFDBFE",
  },
  selectBtnActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  selectBtnText: {
    color: BLUE,
    fontWeight: "700",
    fontSize: 14,
  },
  selectBtnTextActive: {
    color: "#FFFFFF",
  },

  confirmBtn: {
    backgroundColor: BLUE,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
  },
  confirmBtnDisabled: {
    backgroundColor: "#CBD5E1",
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
