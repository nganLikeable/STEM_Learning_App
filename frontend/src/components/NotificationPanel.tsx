import { markAllNotificationsSeen } from "@/src/services/firestore";
import {
  Notification,
  useNotificationStore,
} from "@/src/store/notification-store";
import { useAppTheme } from "@/hooks/useAppTheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";
import React, { useCallback, useEffect } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PANEL_WIDTH = Math.round(Dimensions.get("window").width * 0.65);

const TYPE_ICON: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  rank_overtaken: "trophy-broken",
  activity_score: "star-circle",
  teammate_joined: "account-plus",
};

const TYPE_COLOR: Record<string, string> = {
  rank_overtaken: "#EF4444",
  activity_score: "#F59E0B",
  teammate_joined: "#10B981",
};

function timeAgo(ts: any): string {
  if (!ts) return "";
  const date: Date = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const NotificationItem: React.FC<{ item: Notification; colors: any }> = ({
  item,
  colors,
}) => {
  const iconName = TYPE_ICON[item.type] ?? "bell";
  const iconColor = TYPE_COLOR[item.type] ?? "#6C63FF";

  return (
    <View
      style={[
        styles.item,
        { backgroundColor: item.seen ? colors.surface : colors.primary },
        !item.seen && styles.itemUnseen,
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: iconColor + "20" }]}>
        <MaterialCommunityIcons name={iconName} size={20} color={iconColor} />
      </View>
      <View style={styles.itemText}>
        <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.itemBody, { color: colors.textSecondary }]}>{item.body}</Text>
        <Text style={[styles.itemTime, { color: colors.textSecondary }]}>{timeAgo(item.createdAt)}</Text>
      </View>
      {!item.seen && <View style={styles.unseenDot} />}
    </View>
  );
};

interface NotificationPanelProps {
  visible: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  visible,
  onClose,
}) => {
  const { colors } = useAppTheme();
  const { notifications, markAllSeen } = useNotificationStore();

  const handleOpen = useCallback(async () => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) return;
    markAllSeen();
    await markAllNotificationsSeen(uid);
  }, []);

  useEffect(() => {
    if (visible) handleOpen();
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.panel, { backgroundColor: colors.surface }]} onPress={() => {}}>
          {/* Header */}
          <View style={styles.panelHeader}>
            <Text style={[styles.panelTitle, { color: colors.text }]}>Notifications</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <MaterialCommunityIcons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* List */}
          {notifications.length === 0 ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="bell-off-outline" size={40} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No notifications yet
              </Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <NotificationItem item={item} colors={colors} />
              )}
              ItemSeparatorComponent={() => (
                <View style={[styles.separator, { backgroundColor: colors.border ?? "#E5E7EB" }]} />
              )}
              showsVerticalScrollIndicator={false}
              style={styles.list}
            />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 90,
    paddingRight: 16,
  },
  panel: {
    width: PANEL_WIDTH,
    maxHeight: 440,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  list: {
    flexGrow: 0,
  },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  itemUnseen: {
    borderLeftWidth: 3,
    borderLeftColor: "#6C63FF",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  itemText: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  itemBody: {
    fontSize: 12,
    lineHeight: 17,
  },
  itemTime: {
    fontSize: 11,
    marginTop: 2,
  },
  unseenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6C63FF",
    marginTop: 4,
    flexShrink: 0,
  },
  separator: {
    height: 1,
    marginHorizontal: 16,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
  },
});

export default NotificationPanel;
