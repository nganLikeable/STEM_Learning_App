import { create } from "zustand";

export type NotificationType = "rank_overtaken" | "activity_score" | "teammate_joined";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  seen: boolean;
  createdAt: any;
};

type NotificationState = {
  notifications: Notification[];
  unseenCount: number;
  setNotifications: (notifs: Notification[]) => void;
  markAllSeen: () => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unseenCount: 0,
  setNotifications: (notifs) =>
    set({
      notifications: notifs,
      unseenCount: notifs.filter((n) => !n.seen).length,
    }),
  markAllSeen: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, seen: true })),
      unseenCount: 0,
    })),
}));
