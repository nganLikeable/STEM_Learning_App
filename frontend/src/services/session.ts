import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firestore";

// for activity that requires user's own designs
export interface SessionDesignInput {
  id: number;
  title: string;
}

export interface SessionDoc {
  id: string;
  teamId: string;
  activityId?: number;
  prediction: number | null;
  currentPhase: number;
  completed: boolean;
  designs?: SessionDesignInput[];
}

// create a new session when starting a path
export const createSession = async (
  teamId: string,
  activityId: number,
  prediction: number | null,
) => {
  try {
    const docRef = await addDoc(collection(db, "sessions"), {
      teamId,
      activityId,
      prediction,
      currentPhase: 1,
      completed: false,
      designs: [],
      createdAt: serverTimestamp(),
    });
    return docRef.id; // sessionId
  } catch (e) {
    console.error("Error creating session", e);
    throw e;
  }
};

// get active (incomplete) session for a team and activity
export const getActiveSessionByActivity = async (
  teamId: string,
  activityId: number,
): Promise<SessionDoc | null> => {
  try {
    const q = query(collection(db, "sessions"), where("teamId", "==", teamId));
    const snap = await getDocs(q);

    const candidates = snap.docs
      .map((sessionDoc) => {
        const data = sessionDoc.data();
        return {
          id: sessionDoc.id,
          teamId: String(data.teamId ?? ""),
          activityId:
            typeof data.activityId === "number"
              ? data.activityId
              : Number(data.activityId),
          prediction:
            typeof data.prediction === "number" ? data.prediction : null,
          currentPhase:
            typeof data.currentPhase === "number" ? data.currentPhase : 1,
          completed: Boolean(data.completed),
          designs: Array.isArray(data.designs)
            ? data.designs
                .map((design: any) => ({
                  id: Number(design.id),
                  title: String(design.title ?? ""),
                }))
                .filter(
                  (design: SessionDesignInput) => !Number.isNaN(design.id),
                )
            : [],
          createdAtMillis:
            typeof data.createdAt?.toMillis === "function"
              ? data.createdAt.toMillis()
              : 0,
        };
      })
      .filter(
        (item) =>
          item.activityId === activityId &&
          item.completed === false &&
          item.teamId === teamId,
      )
      .sort((a, b) => b.createdAtMillis - a.createdAtMillis);

    if (candidates.length === 0) return null;

    const active = candidates[0];
    return {
      id: active.id,
      teamId: active.teamId,
      activityId: active.activityId,
      prediction: active.prediction,
      currentPhase: active.currentPhase,
      completed: active.completed,
      designs: active.designs,
    };
  } catch (e) {
    console.error("Error fetching active session", e);
    throw e;
  }
};

export const updateSessionDesigns = async (
  sessionId: string,
  designs: SessionDesignInput[],
) => {
  try {
    await updateDoc(doc(db, "sessions", sessionId), { designs });
  } catch (e) {
    console.error("Error updating session designs", e);
    throw e;
  }
};

// update prediction and/or phase for an existing session
export const updateSession = async (
  sessionId: string,
  prediction: number | null,
  currentPhase: number,
) => {
  try {
    updateDoc(doc(db, "sessions", sessionId), { prediction, currentPhase });
  } catch (e) {
    console.error("Error updating session", e);
    throw e;
  }
};

// update session phase progress without overriding prediction
export const updateSessionPhase = async (
  sessionId: string,
  currentPhase: number,
  completed = false,
) => {
  try {
    updateDoc(doc(db, "sessions", sessionId), { currentPhase, completed });
  } catch (e) {
    console.error("Error updating session phase", e);
    throw e;
  }
};

// advance the active session only after the activity data has been saved
export const advanceActiveSession = async (
  teamId: string,
  activityId: number,
  totalPhases = 3,
) => {
  const activeSession = await getActiveSessionByActivity(teamId, activityId);
  if (!activeSession) return null;

  const nextPhase =
    activeSession.currentPhase >= totalPhases
      ? totalPhases + 1
      : activeSession.currentPhase + 1;
  const completed = activeSession.currentPhase >= totalPhases;

  await updateSessionPhase(activeSession.id, nextPhase, completed);
  return { ...activeSession, currentPhase: nextPhase, completed };
};
