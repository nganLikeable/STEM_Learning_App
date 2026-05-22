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

// update phase
export const updateSession = async (
  sessionId: string,
  currentPhase: number,
) => {
  try {
    updateDoc(doc(db, "sessions", sessionId), { currentPhase });
  } catch (e) {
    console.error("Error updating session", e);
    throw e;
  }
};
