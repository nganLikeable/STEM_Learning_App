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

export interface SessionActivityResult {
  activityId: string; // The docRef.id generated from the activities collection
  score: number;
}

export interface SessionDoc {
  id: string;
  teamId: string;
  prediction: number | null;
  currentPhase: number; // 1, 2, 3
  completed: boolean;
  designs?: SessionDesignInput[];
  activitiesCompleted: SessionActivityResult[];
  totalPoints?: number;
}

// create a new session when starting a path (multi-activity path)
export const createSession = async (
  teamId: string,
  prediction: number | null,
) => {
  try {
    const docRef = await addDoc(collection(db, "sessions"), {
      teamId,
      prediction,
      currentPhase: 1,
      completed: false,
      designs: [],
      activitiesCompleted: [],
      createdAt: serverTimestamp(),
    });
    return docRef.id; // sessionId
  } catch (e) {
    console.error("Error creating session", e);
    throw e;
  }
};

// get active (incomplete) session for a team
export const getActiveSession = async (
  teamId: string,
): Promise<SessionDoc | null> => {
  try {
    const q = query(
      collection(db, "sessions"),
      where("teamId", "==", teamId),
      where("completed", "==", false),
    );
    const snap = await getDocs(q);

    if (snap.empty) return null;

    const sessionDoc = snap.docs[0];
    const data = sessionDoc.data();

    return {
      id: sessionDoc.id,
      teamId: String(data.teamId ?? ""),
      prediction: typeof data.prediction === "number" ? data.prediction : null,
      currentPhase:
        typeof data.currentPhase === "number" ? data.currentPhase : 1,
      completed: Boolean(data.completed),
      designs: Array.isArray(data.designs) ? data.designs : [],
      activitiesCompleted: Array.isArray(data.activitiesCompleted)
        ? data.activitiesCompleted
        : [],
      totalPoints: data.totalPoints ?? undefined,
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
    await updateDoc(doc(db, "sessions", sessionId), {
      prediction,
      currentPhase,
    });
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
    await updateDoc(doc(db, "sessions", sessionId), {
      currentPhase,
      completed,
    });
  } catch (e) {
    console.error("Error updating session phase", e);
    throw e;
  }
};

// advance the active session only after the activity data has been saved
export const advanceActiveSession = async (
  teamId: string,
  activityDocId: string, // docRef.id from activities collection
  score: number,
  totalPhases = 3,
): Promise<SessionDoc | null> => {
  const activeSession = await getActiveSession(teamId);

  if (!activeSession) return null;

  const updatedActivities = [
    ...(activeSession.activitiesCompleted || []),
    { activityId: activityDocId, score },
  ];

  const isLastPhase = activeSession.currentPhase >= totalPhases;
  const nextPhase = activeSession.currentPhase + 1;
  const completed = isLastPhase;

  const updatePayload: Record<string, any> = {
    activitiesCompleted: updatedActivities,
    currentPhase: nextPhase,
    completed,
  };

  // If all activities are finished, aggregate total points to check against original prediction
  if (completed) {
    const totalPoints = updatedActivities.reduce(
      (sum, act) => sum + act.score,
      0,
    );
    updatePayload.totalPoints = totalPoints;
  }

  await updateDoc(doc(db, "sessions", activeSession.id), updatePayload);

  return {
    ...activeSession,
    activitiesCompleted: updatedActivities,
    currentPhase: completed ? totalPhases : nextPhase,
    completed,
    totalPoints: updatePayload.totalPoints,
  };
};
