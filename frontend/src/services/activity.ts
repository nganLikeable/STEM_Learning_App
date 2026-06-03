import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firestore";
import { SessionDoc } from "./session";

interface CompletedActivity {
  activityId: string;
  score: number;
}

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

// calculate final poitns for activity - for those with one metric compared against each other
export function calculateFinalPoints(
  session: SessionDoc,
  bonusAwardAmount: number = 100,
): number {
  const activities = session.activitiesCompleted ?? [];
  const prediction = session.prediction;
  let finalPoints = session.totalPoints ?? 0;

  if (activities.length === 0) return finalPoints;

  // find index of highest score
  const bestIndex = activities.reduce((maxIdx, current, currentIdx, arr) => {
    return current.score > arr[maxIdx].score ? currentIdx : maxIdx;
  }, 0);

  // part of final score = their highest (best) design'result
  const bestScore = activities[bestIndex]?.score ?? 0;
  finalPoints += bestScore;

  const bestDesignNumber = bestIndex + 1; // array frm 0 -2 =>  1, 2,3

  // scoring rules
  if (prediction === bestDesignNumber) {
    finalPoints += bonusAwardAmount;
  }

  return finalPoints;
}
