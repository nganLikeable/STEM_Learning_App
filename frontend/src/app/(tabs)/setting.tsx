import useGetUserAvatar from "@/hooks/user/useGetUserAvatar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { getAuth, signOut } from "firebase/auth";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserProfile } from "../../services/firestore";

function SettingOption({
  option,
  onPress,
}: {
  option: string;
  onPress?: () => void;
}) {
  return (
    <View>
      <Pressable
        style={({ pressed }) => [s.row, pressed && { opacity: 0.7 }]}
        onPress={onPress}
      >
        <Text style={s.rowLabel}>{option}</Text>
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
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

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
    router.push("/changeProfile");
  };

  // change preferences - sound and such
  const handlePreferences = () => {};

  return (
    <SafeAreaView style={s.screen}>
      {/* ── Page title ── */}
      <Text style={s.pageTitle}>Settings</Text>

      {/* ── User profile card ── */}
      {profileLoading ? (
        <ActivityIndicator style={{ marginBottom: 20 }} color="#3977fd" />
      ) : profile ? (
        <View style={s.profileCard}>
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
            <Text style={s.profileName}>{profile.name}</Text>
            <Text style={s.profileMeta}>
              Grade {profile.grade} · {profile.email}
            </Text>
            <Text style={s.profileTeam}>Team ID: {profile.teamId}</Text>
          </View>
        </View>
      ) : null}

      {/* ── Account section ── */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Account</Text>
        <SettingOption option="Profile" onPress={handleChangeAvatar} />
        <SettingOption option="Preferences" onPress={handlePreferences} />
      </View>

      {/* Support section*/}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Support</Text>
        {/* placeholders - undefined functions */}
        <SettingOption option="Help Center" />
        <SettingOption option="Feedback" />
      </View>

      {/* ── Sign Out section (bottom) ── */}
      <View style={[s.section, s.bottomSection, s.signOutSection]}>
        <Pressable
          style={({ pressed }) => [
            s.row,
            s.signOutRow,
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
        <View style={s.row}>
          <Text style={s.rowLabel}>Terms</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color="#9CA3AF"
          />
        </View>

        <View style={s.row}>
          <Text style={s.rowLabel}>Privacy Policy</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color="#9CA3AF"
          />
        </View>

        <View style={[s.row, { borderTopWidth: 1 }]}>
          <Text style={s.rowLabel}>Acknowledgements</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color="#9CA3AF"
          />
        </View>
      </View>
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
});
