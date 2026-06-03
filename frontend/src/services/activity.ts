import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firestore";

// save data for activity 1 - parachute
export const setActivity1 = async (
  teamId: string,
  sessionId: string,
  data: any,
  userAnswers: any,
  validation: any,
  score: number,
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "activities"), {
      teamId,
      sessionId,
      experimentData: data,
      userAnswers: userAnswers,
      validation,
      totalScore: score,
      createdAt: serverTimestamp(),
      completedAt: serverTimestamp(),
    });
    console.log("Saved activity 1 successfully", docRef.id);

    return docRef.id;
  } catch (e) {
    console.error("Error saving activity 1 to Firestore", e);
    throw e;
  }
};

// activity 2 - sound
export const setActivity2 = async (
  teamId: string,
  sessionId: string,
  peakSound: number,
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "activities"), {
      teamId,
      sessionId,
      peakSound,
      createdAt: serverTimestamp(),
      completedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (e) {
    console.error("Error saving activity 2 to firestore", e);
    throw e;
  }
};

// activity 4 - earthquake
export const setActivity4 = async (
  teamId: string,
  sessionId: string,
  //   designNumber: number,
  stabilityScore: number,
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "activities"), {
      teamId,
      sessionId,
      stabilityScore,
      createdAt: serverTimestamp(),
      completedAt: serverTimestamp(),
    });
    console.log("Saved successfully a4", docRef.id);

    return docRef.id;
  } catch (e) {
    console.error("Error saving activity 4 to Firestore", e);
    throw e;
  }
};
