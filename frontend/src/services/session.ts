import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firestore";

// create a new session when starting a path
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
      createdAt: serverTimestamp(),
    });
    return docRef.id; // sessionId
  } catch (e) {
    console.error("Error creating session", e);
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
