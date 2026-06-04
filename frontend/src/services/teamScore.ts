import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "./firestore";

export interface TeamScoreDoc {
  teamId: string;
  scores: Partial<Record<1 | 2 | 3 | 4 | 5 | 6 | 7, number>>; // best score per activity
  totalScore: number;
  updatedAt: ReturnType<typeof serverTimestamp>;
}

const ACTIVITY_NOS = [1, 2, 3, 4, 5, 6, 7] as const;

// fetch the best totalPoints for a team across all completed sessions for each activityNo
async function getBestScoreForActivity(
  teamId: string,
  activityNo: 1 | 2 | 3 | 4 | 5 | 6 | 7,
): Promise<number> {
  const q = query(
    collection(db, "sessions"),
    where("teamId", "==", teamId),
    where("activityNo", "==", activityNo),
    where("completed", "==", true),
  );
  const snap = await getDocs(q);
  if (snap.empty) return 0;
  return snap.docs.reduce((best, d) => {
    const pts = d.data().totalPoints ?? 0;
    return pts > best ? pts : best;
  }, 0);
}

// recalculate and persist team scores — call this after any activity completes
export const updateTeamScore = async (
  teamId: string,
): Promise<TeamScoreDoc> => {
  const scores: Partial<Record<1 | 2 | 3 | 4 | 5 | 6 | 7, number>> = {};

  await Promise.all(
    ACTIVITY_NOS.map(async (activityNo) => {
      const best = await getBestScoreForActivity(teamId, activityNo);
      if (best > 0) scores[activityNo] = best;
    }),
  );

  const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0);

  const teamScoreDoc: Omit<TeamScoreDoc, "updatedAt"> & { updatedAt: any } = {
    teamId,
    scores,
    totalScore,
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, "teamScores", teamId), teamScoreDoc);

  return { ...teamScoreDoc };
};

// Get the current stored team score doc (does not recalculate)
export const getTeamScore = async (
  teamId: string,
): Promise<TeamScoreDoc | null> => {
  const snap = await getDoc(doc(db, "teamScores", teamId));
  if (!snap.exists()) return null;
  return snap.data() as TeamScoreDoc;
};

// Get scores for all teams (for leaderboard)
export const getAllTeamScores = async (): Promise<TeamScoreDoc[]> => {
  const snap = await getDocs(collection(db, "teamScores"));
  return snap.docs.map((d) => d.data() as TeamScoreDoc);
};

// Real-time listener for all team scores — returns unsubscribe function
export const subscribeToTeamScores = (
  onChange: (scores: TeamScoreDoc[]) => void,
): (() => void) => {
  return onSnapshot(collection(db, "teamScores"), (snap) => {
    onChange(snap.docs.map((d) => d.data() as TeamScoreDoc));
  });
};
