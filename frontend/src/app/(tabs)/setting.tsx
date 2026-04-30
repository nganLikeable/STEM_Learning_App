import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth, signOut } from 'firebase/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserProfile } from '../../services/firestore';

export default function SettingScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    getUserProfile(user.uid).then((snap) => {
      if (snap.exists()) setProfile(snap.data());
    }).finally(() => setProfileLoading(false));
  }, []);

  /**
   * handleLogout — signs the user out of Firebase Auth.
   * Shows a confirmation alert first, then calls signOut().
   * On success the _layout auth guard redirects to /login automatically.
   */
  const handleLogout = () => {
    // Ask the user to confirm before signing out
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // Sign out from Firebase — triggers onAuthStateChanged(null) in _layout
              await signOut(getAuth());
              // _layout's auth guard will automatically redirect to /login
              router.replace('/login');
            } catch {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

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
            <Text style={s.avatarText}>{profile.name?.[0]?.toUpperCase() ?? '?'}</Text>
          </View>
          <View style={s.profileInfo}>
            <Text style={s.profileName}>{profile.name}</Text>
            <Text style={s.profileMeta}>Grade {profile.grade} · {profile.email}</Text>
            <Text style={s.profileTeam}>Team ID: {profile.teamId}</Text>
          </View>
        </View>
      ) : null}

      {/* ── Account section ── */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Account</Text>

        {/* Sign out row */}
        <Pressable
          style={({ pressed }) => [s.row, pressed && { opacity: 0.7 }]}
          onPress={handleLogout}
          disabled={loading}
        >
          {/* Red icon to signal a destructive action */}
          <View style={s.iconBox}>
            <MaterialCommunityIcons name="logout" size={20} color="#E74C3C" />
          </View>

          <Text style={s.rowLabel}>Sign Out</Text>

          {/* Show spinner while sign-out is in progress */}
          {loading
            ? <ActivityIndicator size="small" color="#9CA3AF" />
            : <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
          }
        </Pressable>
      </View>

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F4EF',
    padding: 20,
  },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
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
    backgroundColor: '#3977fd',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },

  profileMeta: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },

  profileTeam: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  // Top-level heading
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 28,
  },

  // Card-like container grouping related rows
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },

  // Label above the section card
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 8,
  },

  // Single tappable setting row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },

  // Coloured circle behind the row icon
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#FDECEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  // Row label text
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#E74C3C',
  },
});
