import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { spacing, borderRadius, shadows } from '../../theme';
import { getAllTeams } from '../../services/firestore';

type Team = {
  id: string;
  name: string;
  points: number;
  rank: number;
  avatar?: string;
};

// ─── Podium column ────────────────────────────────────────────────────────────

const PodiumAvatar: React.FC<{ team: Team; position: 1 | 2 | 3 }> = ({ team, position }) => {
  const AVATAR        = position === 1 ? 68 : 56;
  const PEDESTAL_H    = position === 1 ? 100 : position === 2 ? 72 : 56;
  const pedestalColor = position === 1 ? '#3977fd' : position === 2 ? '#7a86f3f5' : '#56bae2e3';
  const borderCol     = position === 1 ? '#FFD166' : position === 2 ? '#C0C0C0' : '#CD7F32';

  return (
    <View style={s.podiumCol}>
      <View style={[s.avatarRing, { borderColor: borderCol }]}>
        {team.avatar ? (
          <Image source={{ uri: team.avatar }} style={{ width: AVATAR, height: AVATAR, borderRadius: 999 }} />
        ) : (
          <View style={[s.avatarFallback, { width: AVATAR, height: AVATAR }]}>
            <Text style={s.avatarLetter}>{team.name.charAt(5).toUpperCase()}</Text>
          </View>
        )}
      </View>
      <Text style={s.podiumName} numberOfLines={1}>{team.name}</Text>
      <Text style={s.podiumPts}>{team.points} pts</Text>
      <View style={[s.pedestal, { height: PEDESTAL_H, backgroundColor: pedestalColor }]}>
        <Text style={s.pedestalRank}>{position}</Text>
      </View>
    </View>
  );
};

// ─── List row ─────────────────────────────────────────────────────────────────

const RankRow: React.FC<{ team: Team; highlighted?: boolean }> = ({ team, highlighted }) => {
  const rank2d = String(team.rank).padStart(2, '0');

  return (
    <Pressable style={({ pressed }) => [s.row, highlighted && s.rowHighlight, pressed && { opacity: 0.75 }]}>
      <View style={[s.rankBox, highlighted && s.rankBoxHL]}>
        <Text style={[s.rankNum, highlighted && s.rankNumHL]}>{rank2d}</Text>
      </View>

      <View style={s.listAvatar}>
        {team.avatar ? (
          <Image source={{ uri: team.avatar }} style={{ width: 44, height: 44, borderRadius: 999 }} />
        ) : (
          <View style={s.listAvatarFallback}>
            <Text style={s.listAvatarLetter}>{team.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={s.rowName} numberOfLines={1}>{team.name}</Text>
        <View style={s.ptsRow}>
          <MaterialCommunityIcons name="star-circle" size={13} color="#F39C12" />
          <Text style={s.rowPts}>{team.points} pts</Text>
        </View>
      </View>
    </Pressable>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

const Leaderboard: React.FC = () => {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllTeams()
      .then((raw: Array<{ id: string; name?: string; points?: number }>) => {
        const sorted = raw
          .sort((a, b) => (b.points ?? 0) - (a.points ?? 0))
          .map((t, i) => ({ id: t.id, name: t.name ?? 'Unknown', points: t.points ?? 0, rank: i + 1 }));
        setTeams(sorted);
      })
      .finally(() => setLoading(false));
  }, []);

  const top3 = teams.slice(0, 3);
  const rest = teams.slice(3);

  if (loading) {
    return (
      <View style={[s.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3977fd" />
      </View>
    );
  }

  return (
    <View style={s.screen}>
      {/* ── HERO: background image + podium ── */}
      <View>
        <Image
          source={require('../../../assets/images/sky.jpg')}
          style={s.heroBg}
          resizeMode="cover"
        />
        <View style={s.heroOverlay} />

        {/* back button */}
        <Pressable style={s.backBtn} onPress={() => router.back()} hitSlop={12}>
          <Text style={s.backText}>{'<'}</Text>
        </Pressable>

        <Text style={s.title}>Leader Board</Text>

        {/* podium: 2nd | 1st | 3rd */}
        <View style={s.podiumRow}>
          <PodiumAvatar team={top3[1]} position={2} />
          <PodiumAvatar team={top3[0]} position={1} />
          <PodiumAvatar team={top3[2]} position={3} />
        </View>
      </View>

      {/* ── BOTTOM SHEET ── */}
      <View style={s.sheet}>
        <FlatList
          data={rest}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <RankRow team={item} highlighted={index === 2} />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          contentContainerStyle={{ padding: spacing.lg }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8F4EF' },

  hero: {
    height: 320,
    paddingTop: 52,
    paddingBottom: 0,
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },

  backBtn: {
    position: 'absolute',
    top: 52,
    left: 20,
    zIndex: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  backText: {
    fontSize: 33,
    fontWeight: '700',
    color: '#ffffffe7',
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2C3E25',
    letterSpacing: 0.5,
    marginBottom: 24,
    textAlign: 'center',
  },

  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 12,
  },
  podiumCol: {
    alignItems: 'center',
    width: 106,
  },
  avatarRing: {
    borderWidth: 3,
    borderRadius: 999,
    padding: 2,
    marginBottom: 6,
  },
  avatarFallback: {
    borderRadius: 999,
    backgroundColor: '#A8C88A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: { fontSize: 26, fontWeight: '700', color: '#fff' },
  podiumName: {
    fontSize: 12,
    fontWeight: '900',
    color: '#2C3E25',
    textAlign: 'center',
    maxWidth: 96,
    marginBottom: 2,
  },
  podiumPts: { fontSize: 10, fontWeight : '900', color: '#5A7A4A', marginBottom: 6 },
  pedestal: {
    width: 96,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  pedestalRank: { fontSize: 22, fontWeight: '900', color: '#fff' },

  sheet: {
    flex: 1,
    borderTopLeftRadius: 24,
    backgroundColor : '#c2e5eee8',
    borderTopRightRadius: 24,
    overflow: 'hidden',
    ...shadows.medium,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F4EF',
    borderRadius: borderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  rowHighlight: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#C8A86B',
    ...shadows.light,
  },
  rankBox: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.sm,
    backgroundColor: '#E8E0D5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankBoxHL: { backgroundColor: '#C8A86B' },
  rankNum:   { fontSize: 14, fontWeight: '800', color: '#7A6A55' },
  rankNumHL: { color: '#fff' },

  listAvatar: { marginLeft: 2 },
  listAvatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: '#A8C88A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listAvatarLetter: { fontSize: 18, fontWeight: '700', color: '#fff' },

  rowName: { fontSize: 14, fontWeight: '900', color: '#1A1A1A' },
  ptsRow:  { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  rowPts:  { fontSize: 12, color: '#888', fontWeight: '800' },

  deltaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  deltaText: { fontSize: 12, fontWeight: '700' },
});

export default Leaderboard;
