import useGetUserAvatar from "@/hooks/user/useGetUserAvatar";
import { useAppTheme } from "@/hooks/useAppTheme";
import * as Battery from "expo-battery";
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { borderRadius, spacing } from "../theme";
import NotificationBell from "./NotificationBell";

function BatteryIndicator({
  level,
  state,
}: {
  level: number | null;
  state: Battery.BatteryState;
}) {
  const pct = level !== null ? Math.round(level * 100) : null;
  const isCharging = state === Battery.BatteryState.CHARGING;

  const color =
    pct === null ? "#9CA3AF"
    : pct <= 20 ? "#EF4444"
    : pct <= 50 ? "#F59E0B"
    : "#22C55E";

  const fillHeight = pct !== null ? `${pct}%` : "0%";

  return (
    <View style={batteryStyles.wrapper}>
      <View style={[batteryStyles.tip, { backgroundColor: color }]} />
      <View style={[batteryStyles.body, { borderColor: color }]}>
        <View style={[batteryStyles.fill, { height: fillHeight as any, backgroundColor: color }]} />
        {isCharging && (
          <Text style={[batteryStyles.bolt, { color: "#fff" }]}>⚡</Text>
        )}
      </View>
    </View>
  );
}

const batteryStyles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
  },
  tip: {
    width: 6,
    height: 3,
    borderRadius: 1,
    marginBottom: -1,
  },
  body: {
    width: 12,
    height: 22,
    borderRadius: 3,
    borderWidth: 1.5,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  fill: {
    width: "100%",
    borderRadius: 1.5,
  },
  bolt: {
    position: "absolute",
    fontSize: 9,
    alignSelf: "center",
    top: 4,
  },
});

interface HeaderProps {
  userName?: string;
}

const Header: React.FC<HeaderProps> = ({ userName = "User" }) => {
  const { colors } = useAppTheme();
  const [greeting, setGreeting] = useState("Good morning");
  const avatar = useGetUserAvatar();
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [batteryState, setBatteryState] = useState<Battery.BatteryState>(Battery.BatteryState.UNKNOWN);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 18) {
      setGreeting("Good afternoon");
    } else if (hour >= 18) {
      setGreeting("Good evening");
    } else {
      setGreeting("Good morning");
    }
  }, []);

  useEffect(() => {
    Battery.getBatteryLevelAsync().then(setBatteryLevel);
    Battery.getBatteryStateAsync().then(setBatteryState);
    const lvlSub = Battery.addBatteryLevelListener(({ batteryLevel: l }) => setBatteryLevel(l));
    const stateSub = Battery.addBatteryStateListener(({ batteryState: s }) => setBatteryState(s));
    return () => { lvlSub.remove(); stateSub.remove(); };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.leftGroup}>
          <View style={styles.greetingContainer}>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>{greeting}</Text>
            <Text style={[styles.userName, { color: colors.text }]}>{userName}</Text>
          </View>
        </View>

        <View style={styles.avatarGroup}>
          <NotificationBell />
          <BatteryIndicator level={batteryLevel} state={batteryState} />
          {/* User Avatar - Link to Settings */}
          <Link href="../../setting" asChild>
            <Pressable style={styles.avatarButton}>
              <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
                {avatar ? (
                  <Image
                    source={avatar}
                    style={{ width: 48, height: 48, borderRadius: 24 }}
                  />
                ) : (
                  <Text style={styles.avatarText}>☺️</Text>
                )}
              </View>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 0,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftGroup: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  greetingContainer: {},
  greeting: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: spacing.xs,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  avatarGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  teamAvatarButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  teamAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#6C63FF",
    overflow: "hidden",
  },
  teamAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  teamAvatarText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#6C63FF",
  },
  avatarButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#000",
  },
  avatarText: {
    fontSize: 24,
  },
});

export default Header;
