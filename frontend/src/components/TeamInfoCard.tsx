import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../theme';

interface TeamInfoCardProps {
  teamName?: string;
  teamId?: string;
  members?: string[];
  grade?: string;
  points?: number;
  rank?: number;
}

const TeamInfoCard: React.FC<TeamInfoCardProps> = ({ teamName, teamId, members, grade, points, rank}) => {
  return (
    <View style={[styles.container, shadows.medium]}>
      {/* Team Name Header */}
      <View style={styles.header}>
        <Text style={styles.teamName}>{teamName}</Text>
        {teamId ? <Text style={styles.teamId}>ID: {teamId}</Text> : null}
      </View>

      {/* Members */}
      <View style={styles.infoRow}>
        <Text style={styles.label}>Members:</Text>
        <Text style={styles.value}>{members.join(', ')}</Text>
      </View>

      {/* Grade */}
      <View style={styles.infoRow}>
        <Text style={styles.label}>Grade:</Text>
        <Text style={styles.value}>{grade}</Text>
      </View>

      {/* Points and Rank Row */}
      <View style={styles.footer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{points} pts</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>#{rank}</Text>
          <Text style={styles.statLabel}>Rank</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  teamId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1897ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.accent,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
});

export default TeamInfoCard;
