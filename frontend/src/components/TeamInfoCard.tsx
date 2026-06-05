import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, shadows, spacing } from '../theme';

interface TeamInfoCardProps {
  teamName?: string;
  teamId?: string;
  members?: string[];
  points?: number;
  rank?: number;
}

const TeamInfoCard: React.FC<TeamInfoCardProps> = ({ teamName, teamId, members, points, rank }) => {
  return (
    <LinearGradient
      colors={['#6b76ee', '#99a1f4']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, shadows.medium]}
    >
      {/* Header: team name + ID badge */}
      <View style={styles.header}>
        <Text style={styles.teamName} numberOfLines={1}>{teamName || 'No Team'}</Text>
        {teamId ? (
          <View style={styles.idBadge}>
            <Text style={styles.teamId}>ID: {teamId}</Text>
          </View>
        ) : null}
      </View>

      {/* Members row */}
      <View style={styles.membersRow}>
        <MaterialCommunityIcons name="account-group" size={15} color="rgba(255,255,255,0.7)" />
        <Text style={styles.membersText} numberOfLines={1}>
          {members && members.length > 0 ? members.join(', ') : '—'}
        </Text>
      </View>

      {/* Separator */}
      <View style={styles.separator} />

      {/* Stats */}
      <View style={styles.footer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{points != null ? Math.round(points) : '—'} pts</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>#{rank ?? '—'}</Text>
          <Text style={styles.statLabel}>Rank</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  teamName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
    marginRight: spacing.sm,
  },
  idBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  teamId: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  membersText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginHorizontal: spacing.md,
  },
});

export default TeamInfoCard;
