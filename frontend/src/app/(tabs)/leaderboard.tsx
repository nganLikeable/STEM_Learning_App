import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";
import { getAllTeams } from "../../services/firestore";
import { useTeamStore } from "../../store/team-store";
import { borderRadius, shadows, spacing } from "../../theme";
import { getAvatarSource } from "../constants/avatars";

type Team = {
  id: string;
  name: string;
  points: number;
  rank: number;
  avatarId?: string | null;
};

const RANK_COLOR: Record<number, string> = {
  1: "#f8df00",
  2: "#616161b6",
  3: "#be752b",
};

const TOP3_CARD_BACKGROUND: Record<number, string> = {
  1: "#f5d969",
  2: "#c4c4c4",
  3: "#fdc8a2d7",
};

const USER_TEAM_CARD_BACKGROUND = "#b2aaf3";

// ─── List row ─────────────────────────────────────────────────────────────────

const RankRow: React.FC<{ team: Team; userTeamId: string | null }> = ({
  team,
  userTeamId,
}) => {
  const rankColor = RANK_COLOR[team.rank] ?? "#9CA3AF";
  const isTop3 = team.rank <= 3;
  const isUserTeam = userTeamId !== null && userTeamId === team.id;
  const rowBgColor = isUserTeam
    ? USER_TEAM_CARD_BACKGROUND
    : (TOP3_CARD_BACKGROUND[team.rank] ?? "#fff");

  return (
    <View
      style={[
        s.row,
        isTop3 && s.rowTop3,
        isUserTeam && s.userTeamRow,
        { backgroundColor: rowBgColor },
      ]}
    >
      <Text style={s.rankNum}>{String(team.rank).padStart(2, "0")}</Text>

      <View
        style={[
          s.avatarCircle,
          isTop3 && { borderColor: rankColor, borderWidth: 2 },
        ]}
      >
        {team.avatarId ? (
          (() => {
            const src = getAvatarSource(team.avatarId!);
            return src ? (
              <Image source={src} style={s.avatarImage} />
            ) : (
              <Text style={s.avatarLetter}>
                {team.name.charAt(0).toUpperCase()}
              </Text>
            );
          })()
        ) : (
          <Text style={s.avatarLetter}>
            {team.name.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={s.rowName} numberOfLines={1}>
          {team.name}
        </Text>
        <View style={s.ptsRow}>
          <MaterialCommunityIcons
            name="star-circle"
            size={13}
            color="#F39C12"
          />
          <Text style={s.rowPts}>{team.points} pts</Text>
        </View>
      </View>
    </View>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

const Leaderboard: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTeamVisible, setUserTeamVisible] = useState(true);
  const { teamId } = useTeamStore();

  const userTeam = teams.find((team) => team.id === teamId) ?? null;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 });

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      if (!teamId) {
        return;
      }

      const visibleIds = viewableItems.map((item) => item.item.id);
      setUserTeamVisible(visibleIds.includes(teamId));
    },
  ).current;

  useEffect(() => {
    getAllTeams()
      .then(
        (
          raw: Array<{
            id: string;
            name?: string;
            points?: number;
            avatarId?: string | null;
          }>,
        ) => {
          const sorted = raw
            .sort((a, b) => (b.points ?? 0) - (a.points ?? 0))
            .map((t, i) => ({
              id: t.id,
              name: t.name ?? "Unknown",
              points: t.points ?? 0,
              rank: i + 1,
              avatarId: t.avatarId ?? null,
            }));
          setTeams(sorted);
        },
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View
        style={[s.screen, { justifyContent: "center", alignItems: "center" }]}
      >
        <ActivityIndicator size="large" color="#9333EA" />
      </View>
    );
  }

  return (
    <View style={s.screen}>
      {/* ── Header ── */}
      <LinearGradient
        colors={["#c8afe0", "#5B21B6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.header}
      >
        <View style={s.headerText}>
          <Text style={s.title}>Leader Board</Text>
          <Text style={s.subtitle}>{teams.length} teams competing </Text>
        </View>

        <Image
          source={require("../../../assets/images/mascot/fewww.png")}
          style={s.mascot}
          resizeMode="contain"
        />
      </LinearGradient>

      {/* ── Full ranked list ── */}
      <View style={s.sheet}>
        <FlatList
          data={teams}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RankRow team={item} userTeamId={teamId} />}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          contentContainerStyle={{
            padding: spacing.lg,
            paddingTop: spacing.md,
          }}
          showsVerticalScrollIndicator={false}
          viewabilityConfig={viewabilityConfig.current}
          onViewableItemsChanged={onViewableItemsChanged}
        />
        {userTeam && !userTeamVisible && (
          <View style={s.userTeamPopup} pointerEvents="box-none">
            <RankRow team={userTeam} userTeamId={teamId} />
          </View>
        )}
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F5F5" },

  header: {
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  headerText: {
    flex: 1,
    paddingBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    color: "rgb(217, 255, 0)",
    marginTop: 2,
    fontWeight: "800",
  },
  mascot: {
    width: 110,
    height: 110,
    marginBottom: -10,
  },

  sheet: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    position: "relative",
  },

  userTeamPopup: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    zIndex: 20,
  },

  userTeamLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3866c9",
    marginBottom: 6,
    marginLeft: 8,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: borderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
    ...shadows.light,
  },
  rowTop3: {},
  userTeamRow: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: USER_TEAM_CARD_BACKGROUND,
    ...shadows.medium,
  },

  rankNum: {
    fontSize: 15,
    fontWeight: "900",
    width: 26,
    textAlign: "center",
    color: "#000",
  },

  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: "#EDE9FE",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarLetter: { fontSize: 18, fontWeight: "700", color: "#7C3AED" },

  rowName: { fontSize: 14, fontWeight: "800", color: "#1A1A1A" },
  ptsRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  rowPts: { fontSize: 12, color: "#000000", fontWeight: "600" },
});

export default Leaderboard;
