import useGetUserAvatar from "@/hooks/user/useGetUserAvatar";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { borderRadius, spacing } from "../theme";
import NotificationBell from "./NotificationBell";

const heyjoImg = require("../../assets/images/mascot/goodJobMan.png");

interface HeaderProps {
  userName?: string;
}

const Header: React.FC<HeaderProps> = ({ userName = "User" }) => {
  const { colors } = useAppTheme();
  const [greeting, setGreeting] = useState("Good morning");
  const avatar = useGetUserAvatar();

  useEffect(() => {
    // Determine greeting based on time of day
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 18) {
      setGreeting("Good afternoon");
    } else if (hour >= 18) {
      setGreeting("Good evening");
    } else {
      setGreeting("Good morning");
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.leftGroup}>
          <View style={styles.greetingContainer}>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>{greeting}</Text>
            <Text style={[styles.userName, { color: colors.text }]}>{userName}</Text>
          </View>
          <Image source={heyjoImg} style={styles.mascot} resizeMode="contain" />
        </View>

        <View style={styles.avatarGroup}>
          <NotificationBell />
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
  mascot: {
    width: 52,
    height: 52,
    marginLeft: spacing.sm,
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
