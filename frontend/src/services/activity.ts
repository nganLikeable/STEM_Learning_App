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
  activityNo: 1,
  sessionId: string,
  data: any,
  userAnswers: any,
  validation: any,
  score: number,
  videoUrl?: string,
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "activities"), {
      teamId,
      sessionId,
      activityNo,
      experimentData: data,
      userAnswers: userAnswers,
      validation,
      totalScore: score,
      ...(videoUrl ? { videoUrl } : {}),
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
  activityNo: 2,
  peakSound: number,
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "activities"), {
      teamId,
      sessionId,
      activityNo,
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

// activity 3 - hand fan challenge
export const setActivity3 = async (
  teamId: string,
  sessionId: string,
  designNo: number,
  angleACB: number,
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "activities"), {
      teamId,
      sessionId,
      activityNo: 3,
      designNo,
      angleACB,
      createdAt: serverTimestamp(),
      completedAt: serverTimestamp(),
    });
    console.log("Saved activity 3 successfully", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error saving activity 3 to Firestore", e);
    throw e;
  }
};

// activity 4 - earthquake
export const setActivity4 = async (
  teamId: string,
  sessionId: string,
  activityNo: 4,
  //   designNumber: number,
  stabilityScore: number,
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "activities"), {
      teamId,
      sessionId,
      activityNo,
      stabilityScore,
      createdAt: serverTimestamp(),
      completedAt: serverTimestamp(),
    });
    console.log("Saved successfully a4", docRef);

    return docRef.id;
  } catch (e) {
    console.error("Error saving activity 4 to Firestore", e);
    throw e;
  }
};

// save for activity 5 - human performance lab
export const setActivity5 = async (
  teamId: string,
  activityNo: 5,
  sessionId: string,
  improvement: number,
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "activities"), {
      teamId,
      sessionId,
      activityNo,
      improvement,
      createdAt: serverTimestamp(),
      completedAt: serverTimestamp(),
    });
    console.log("saved successfully a5", docRef);
    return docRef.id;
  } catch (e) {
    console.error("Error saving activity 5 to Firestore", e);
    throw e;
  }
};

// save for activity 6 - reaction board challenge
export const setActivity6 = async (
  teamId: string,
  activityNo: 6,
  sessionId: string,
  dominantMs: number,
  nonDominantMs: number,
  tracingAccuracy: number,
  totalScore: number,
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "activities"), {
      teamId,
      activityNo,
      sessionId,
      dominantMs,
      nonDominantMs,
      tracingAccuracy,
      totalScore,
      createdAt: serverTimestamp(),
      completedAt: serverTimestamp(),
    });
    console.log("saved successfully a6", docRef);
    return docRef.id;
  } catch (e) {
    console.error("Error saving activity 6 to Firestore", e);
    throw e;
  }
};

// score reaction time: <300ms=100, 300-400ms=50, >400ms=0
export function scoreReactionTime(ms: number): number {
  if (ms < 300) return 100;
  if (ms <= 400) return 50;
  return 0;
}

// calculate final points for activity 6 (reaction board):
// sum all attempt scores + swap bonus + prediction bonus
export function calculateFinalPoints6(
  session: SessionDoc,
  dominantMs: number,
  nonDominantMs: number,
  bonusAwardAmount: number = 100,
): number {
  const activities = session.activitiesCompleted ?? [];

  // sum all phase scores
  const totalPhaseScore = activities.reduce((sum, a) => sum + (a.score ?? 0), 0);

  // swap bonus: non-dominant within 50% slower than dominant
  const swapBonus = nonDominantMs <= dominantMs * 1.5 ? 50 : 0;

  // prediction bonus: prediction matches the attempt index with highest score
  const bestIndex = activities.length > 0
    ? activities.reduce((maxIdx, cur, idx, arr) =>
        cur.score > arr[maxIdx].score ? idx : maxIdx, 0)
    : -1;
  const predictionBonus =
    bestIndex >= 0 && session.prediction === bestIndex + 1 ? bonusAwardAmount : 0;

  return totalPhaseScore + swapBonus + predictionBonus;
}

// save for activity 7 - breathes per minute
export const setActivity7 = async (
  teamId: string,
  activityNo: 7,
  sessionId: string,
  breathsPerMinute: number,
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "activities"), {
      teamId,
      activityNo,
      sessionId,
      breathsPerMinute,
      createdAt: serverTimestamp(),
      completedAt: serverTimestamp(),
    });
    console.log("saved successfully a7", docRef);
    return docRef.id;
  } catch (e) {
    console.error("Error saving activity 7 to Firestore", e);
    throw e;
  }
};

// calculate final points for activity 1 (parachute):
// adds bonus if user's chosen bestDesign matches their prediction
export function calculateFinalPoints1(
  session: SessionDoc,
  bonusAwardAmount: number = 100,
): number {
  const rawScore = (session.activitiesCompleted ?? []).reduce(
    (sum, a) => sum + (a.score ?? 0),
    0,
  ); // sum points for calculations

  // add bonus if prediction is correct, matching best desgin
  const bonus =
    session.bestDesign !== undefined &&
    session.prediction !== null &&
    session.bestDesign === session.prediction
      ? bonusAwardAmount
      : 0;

  return rawScore + bonus;
}

// activity 4 - earthquake
// calculate final poitns for activity - for those with one metric compared against each other; aggregate points from all attempts
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

// get points for activity5 and 7 , 4- human performace lab; breath tracker, sound
// calculate final points for activity 5 (human performance):
// finds which movement had the highest improvement score => hard to keep sturdy; award points if that matches prediction

// for 7: the highest bpm is the result - same logic
// for 2: same
export function calculateFinalPoints257(
  session: SessionDoc,
  bonusAwardAmount: number = 100,
): number {
  const activities = session.activitiesCompleted ?? [];
  if (activities.length === 0) return 0;

  const bestIndex = activities.reduce(
    (maxIdx, current, currentIdx, arr) =>
      current.score > arr[maxIdx].score ? currentIdx : maxIdx,
    0,
  );
  const bestDesignNumber = bestIndex + 1;

  return session.prediction !== null && session.prediction === bestDesignNumber
    ? bonusAwardAmount
    : 0;
}
