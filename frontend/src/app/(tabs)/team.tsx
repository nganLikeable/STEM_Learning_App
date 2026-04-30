import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserProfile, getTeam, getTeamMembers } from '../../services/firestore';

export default function TeamScreen() {
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

        const profileSnap = await getUserProfile(user.uid);
        if (!profileSnap.exists()) {
          setError('Profile not found.');
          return;
        }

        const { teamId } = profileSnap.data();
        if (!teamId) {
          setError('You are not in a team yet.');
          return;
        }

        const [teamSnap, teamMembers] = await Promise.all([
          getTeam(teamId),
          getTeamMembers(teamId),
        ]);

        if (!teamSnap.exists()) {
          setError('Team not found.');
          return;
        }

        setTeam({ id: teamSnap.id, ...teamSnap.data() });
        setMembers(teamMembers);
      } catch (e: any) {
        setError(e.message ?? 'Failed to load team.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={s.centered}>
        <ActivityIndicator size="large" color="#3977fd" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={s.centered}>
        <MaterialCommunityIcons name="alert-circle-outline" size={40} color="#9CA3AF" />
        <Text style={s.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={s.pageTitle}>Team</Text>

        {/* ── Team info card ── */}
        <View style={s.teamCard}>
          <View style={s.teamIconBox}>
            <MaterialCommunityIcons name="account-group" size={28} color="#3977fd" />
          </View>
          <View style={s.teamInfo}>
            <Text style={s.teamName}>{team.name}</Text>
            <Text style={s.teamId}>ID: {team.id}</Text>
          </View>
        </View>

        {/* ── Members section ── */}
        <Text style={s.sectionTitle}>Members ({members.length})</Text>

        {members.length === 0 ? (
          <Text style={s.emptyText}>No members found.</Text>
        ) : (
          members.map((m) => (
            <View key={m.uid} style={s.memberCard}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>{m.name?.[0]?.toUpperCase() ?? '?'}</Text>
              </View>
              <View style={s.memberInfo}>
                <Text style={s.memberName}>{m.name}</Text>
                <Text style={s.memberMeta}>Grade {m.grade} · {m.email}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F4EF',
    padding: 20,
  },

  centered: {
    flex: 1,
    backgroundColor: '#F8F4EF',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },

  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 20,
  },

  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    gap: 14,
  },

  teamIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  teamInfo: {
    flex: 1,
  },

  teamName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },

  teamId: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#3977fd',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },

  memberInfo: {
    flex: 1,
  },

  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },

  memberMeta: {
    fontSize: 13,
    color: '#6B7280',
  },

  errorText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 20,
  },
});
