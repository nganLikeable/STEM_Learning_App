import useGetUserAvatar from "@/hooks/user/useGetUserAvatar";
import { useAppTheme } from "@/hooks/useAppTheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { getAuth, signOut } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db, getUserProfile } from "../../services/firestore";

function FeedbackModal({
  visible,
  onClose,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  colors: any;
}) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      const user = getAuth().currentUser;

      let gps: { latitude: number; longitude: number } | null = null;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        gps = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      }

      await addDoc(collection(db, "feedback"), {
        userId: user?.uid ?? null,
        message: message.trim(),
        gps,
        createdAt: serverTimestamp(),
      });
      setMessage("");
      onClose();
      Alert.alert("Thank you!", "Your feedback has been sent.");
    } catch {
      Alert.alert("Error", "Failed to send feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={s.feedbackOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableOpacity style={s.feedbackOverlay} activeOpacity={1} onPress={onClose} />
        <View style={[s.feedbackCard, { backgroundColor: colors.surface }]}>
          <Text style={[s.feedbackTitle, { color: colors.text }]}>Send Feedback</Text>
          <Text style={[s.feedbackSubtitle, { color: colors.textSecondary }]}>
            Help us improve by sharing your thoughts.
          </Text>
          <TextInput
            style={[s.feedbackInput, { color: colors.text, borderColor: colors.border }]}
            placeholder="Write your feedback here..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={5}
            value={message}
            onChangeText={setMessage}
            textAlignVertical="top"
          />
          <View style={s.feedbackLocationNote}>
            <MaterialCommunityIcons name="map-marker-outline" size={13} color="#9CA3AF" />
            <Text style={s.feedbackLocationText}>
              Sending feedback may prompt you to share your location.
            </Text>
          </View>
          <View style={s.feedbackActions}>
            <Pressable
              style={({ pressed }) => [s.feedbackCancelBtn, pressed && { opacity: 0.7 }]}
              onPress={onClose}
            >
              <Text style={[s.feedbackCancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                s.feedbackSubmitBtn,
                !message.trim() && s.feedbackSubmitDisabled,
                pressed && { opacity: 0.8 },
              ]}
              onPress={handleSubmit}
              disabled={submitting || !message.trim()}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={s.feedbackSubmitText}>Send</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function SettingOption({
  option,
  onPress,
  colors,
}: {
  option: string;
  onPress?: () => void;
  colors?: { text: string; border: string };
}) {
  return (
    <View>
      <Pressable
        style={({ pressed }) => [
          s.row,
          colors && { borderTopColor: colors.border },
          pressed && { opacity: 0.7 },
        ]}
        onPress={onPress}
      >
        <Text style={[s.rowLabel, colors && { color: colors.text }]}>{option}</Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color="#9CA3AF"
        />
      </Pressable>
    </View>
  );
}

export default function SettingScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  // get user avatar
  const avatar = useGetUserAvatar();

  const loadProfile = useCallback(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);

    getUserProfile(user.uid)
      .then((snap) => {
        if (snap.exists()) {
          setProfile(snap.data());
        }
      })
      .finally(() => setProfileLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  /**
   * handleLogout — signs the user out of Firebase Auth.
   * Shows a confirmation alert first, then calls signOut().
   * On success the _layout auth guard redirects to /login automatically.
   */
  const handleLogout = () => {
    // Ask the user to confirm before signing out
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            // Sign out from Firebase — triggers onAuthStateChanged(null) in _layout
            await signOut(getAuth());
            // _layout's auth guard will automatically redirect to /login
            router.replace("/login");
          } catch {
            Alert.alert("Error", "Failed to sign out. Please try again.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  // open profile editor
  const handleChangeAvatar = () => {
    router.push("/screens/profile/ChangeProfileScreen");
  };

  const handlePreferences = () => {
    router.push("/screens/settings/PreferencesScreen");
  };

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: colors.primary }]}>
      {/* ── Page title ── */}
      <Text style={[s.pageTitle, { color: colors.text }]}>Settings</Text>

      {/* ── User profile card ── */}
      {profileLoading ? (
        <ActivityIndicator style={{ marginBottom: 20 }} color="#3977fd" />
      ) : profile ? (
        <View style={[s.profileCard, { backgroundColor: colors.surface }]}>
          <View style={s.avatar}>
            {avatar ? (
              <Image source={avatar} style={s.avatarImage} />
            ) : (
              <Text style={s.avatarText}>
                {profile.name?.[0]?.toUpperCase() ?? "?"}
              </Text>
            )}
          </View>
          <View style={s.profileInfo}>
            <Text style={[s.profileName, { color: colors.text }]}>{profile.name}</Text>
            <Text style={[s.profileMeta, { color: colors.textSecondary }]}>
              Grade {profile.grade} · {profile.email}
            </Text>
            <Text style={[s.profileTeam, { color: colors.textSecondary }]}>Team ID: {profile.teamId}</Text>
          </View>
        </View>
      ) : null}

      {/* ── Account section ── */}
      <View style={[s.section, { backgroundColor: colors.surface }]}>
        <Text style={s.sectionTitle}>Account</Text>
        <SettingOption option="Profile" onPress={handleChangeAvatar} colors={colors} />
        <SettingOption option="Preferences" onPress={handlePreferences} colors={colors} />
      </View>

      {/* Support section*/}
      <View style={[s.section, { backgroundColor: colors.surface }]}>
        <Text style={s.sectionTitle}>Support</Text>
        {/* placeholders - undefined functions */}
        <SettingOption option="Help Center" colors={colors} />
        <SettingOption option="Feedback" onPress={() => setFeedbackVisible(true)} colors={colors} />
      </View>

      {/* ── Sign Out section (bottom) ── */}
      <View style={[s.section, s.bottomSection, s.signOutSection, { backgroundColor: colors.surface }]}>
        <Pressable
          style={({ pressed }) => [
            s.row,
            s.signOutRow,
            { borderTopColor: colors.border },
            pressed && { opacity: 0.7 },
          ]}
          onPress={handleLogout}
          disabled={loading}
        >
          <View style={s.signOutIconBox}>
            <MaterialCommunityIcons name="logout" size={20} color="#fff" />
          </View>

          <Text style={s.signOutLabel}>SIGN OUT</Text>

          {/* Show spinner while sign-out is in progress */}
          {loading && <ActivityIndicator size="small" color="#9CA3AF" />}
        </Pressable>
      </View>

      {/* Small legal links below sign-out (not part of the card) */}
      <View style={s.legalContainer}>
        <View style={[s.row, { borderTopColor: colors.border }]}>
          <Text style={[s.rowLabel, { color: colors.text }]}>Terms</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color="#9CA3AF"
          />
        </View>

        <View style={[s.row, { borderTopColor: colors.border }]}>
          <Text style={[s.rowLabel, { color: colors.text }]}>Privacy Policy</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color="#9CA3AF"
          />
        </View>

        <View style={[s.row, { borderTopWidth: 1, borderTopColor: colors.border }]}>
          <Text style={[s.rowLabel, { color: colors.text }]}>Acknowledgements</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color="#9CA3AF"
          />
        </View>
      </View>
      <FeedbackModal
        visible={feedbackVisible}
        onClose={() => setFeedbackVisible(false)}
        colors={colors}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8F4EF",
    padding: 20,
  },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    gap: 14,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#fde039",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  avatarText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
  },
  avatarImage: {
    width: 50,
    height: 48,
    borderRadius: 24,
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },

  profileMeta: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 2,
  },

  profileTeam: {
    fontSize: 12,
    color: "#9CA3AF",
  },

  // Top-level heading
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 28,
  },

  // Card-like container grouping related rows
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },

  // Label above the section card
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 8,
  },

  // Single tappable setting row
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },

  // Row label text
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },

  // Bottom section styling
  bottomSection: {
    marginTop: "auto",
    marginBottom: 12,
  },

  // Slightly smaller sign-out card to match other rows
  signOutSection: {
    paddingVertical: 6,
  },

  // Sign out row styling
  signOutRow: {
    borderTopWidth: 0,
    paddingVertical: 10,
  },

  // Sign out icon box
  signOutIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#E74C3C",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  // Sign out label text
  signOutLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#E74C3C",
    textAlign: "center",
  },

  // Legal / small links below sign out (rendered as regular rows)
  legalContainer: {
    marginTop: 12,
    paddingHorizontal: 16,
  },

  feedbackOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  feedbackCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 4,
  },
  feedbackSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 16,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    minHeight: 120,
    marginBottom: 16,
  },
  feedbackActions: {
    flexDirection: "row",
    gap: 10,
  },
  feedbackCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  feedbackCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  feedbackSubmitBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#6C63FF",
    alignItems: "center",
  },
  feedbackSubmitDisabled: {
    backgroundColor: "#C4C0F0",
  },
  feedbackSubmitText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  feedbackLocationNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 14,
  },
  feedbackLocationText: {
    fontSize: 11,
    color: "#9CA3AF",
    flex: 1,
  },
});
