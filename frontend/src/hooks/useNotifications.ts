import { db } from "@/src/services/firestore";
import {
  Notification,
  useNotificationStore,
} from "@/src/store/notification-store";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect } from "react";

export const useNotifications = (uid: string | null) => {
  const setNotifications = useNotificationStore((s) => s.setNotifications);

  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, "users", uid, "notifications"),
      orderBy("createdAt", "desc"),
      limit(50),
    );

    const unsub = onSnapshot(q, (snap) => {
      const notifs: Notification[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Notification, "id">),
      }));
      setNotifications(notifs);
    });

    return unsub;
  }, [uid]);
};
