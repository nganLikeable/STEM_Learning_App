import { useNotificationStore } from "@/src/store/notification-store";
import { useAppTheme } from "@/hooks/useAppTheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import NotificationPanel from "./NotificationPanel";

const NotificationBell: React.FC = () => {
  const { colors } = useAppTheme();
  const unseenCount = useNotificationStore((s) => s.unseenCount);
  const [panelVisible, setPanelVisible] = useState(false);

  const badgeLabel = unseenCount > 9 ? "9+" : String(unseenCount);

  return (
    <>
      <Pressable
        style={styles.button}
        onPress={() => setPanelVisible(true)}
        hitSlop={8}
      >
        <MaterialCommunityIcons
          name={unseenCount > 0 ? "bell-badge" : "bell-outline"}
          size={26}
          color={colors.text}
        />
        {unseenCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeLabel}</Text>
          </View>
        )}
      </Pressable>

      <NotificationPanel
        visible={panelVisible}
        onClose={() => setPanelVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 4,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
    lineHeight: 12,
  },
});

export default NotificationBell;
