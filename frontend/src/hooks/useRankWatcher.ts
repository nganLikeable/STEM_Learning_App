import { addNotification, db } from "@/src/services/firestore";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useRef } from "react";

type RankedTeam = { id: string; name: string; points: number; rank: number };

const toRanked = (docs: any[]): RankedTeam[] =>
  docs
    .map((d) => ({ id: d.id, name: d.data().name ?? "Unknown", points: d.data().points ?? 0 }))
    .sort((a, b) => b.points - a.points)
    .map((t, i) => ({ ...t, rank: i + 1 }));

export const useRankWatcher = (uid: string | null, teamId: string | null) => {
  const prevRef = useRef<RankedTeam[] | null>(null);

  useEffect(() => {
    if (!uid || !teamId) return;

    const unsub = onSnapshot(collection(db, "teams"), (snap) => {
      const newRanked = toRanked(snap.docs);
      const prev = prevRef.current;

      if (prev !== null) {
        const prevUserTeam = prev.find((t) => t.id === teamId);
        const newUserTeam = newRanked.find((t) => t.id === teamId);

        if (prevUserTeam && newUserTeam && newUserTeam.rank > prevUserTeam.rank) {
          const overtakingTeam = newRanked.find((t) => t.rank === prevUserTeam.rank);
          if (overtakingTeam) {
            addNotification(uid, {
              type: "rank_overtaken",
              title: "You've been overtaken!",
              body: `${overtakingTeam.name} just passed your team in the rankings.`,
              seen: false,
            });
          }
        }
      }

      prevRef.current = newRanked;
    });

    return unsub;
  }, [uid, teamId]);
};
