import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import app from "./firebase";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const db = getFirestore(app);

export const saveUserProfile = (uid, data) =>
  setDoc(doc(db, "users", uid), data, { merge: true });

export const getUserProfile = (uid) => getDoc(doc(db, "users", uid));

const generateTeamId = () =>
  Array.from(
    { length: 5 },
    () => CHARS[Math.floor(Math.random() * CHARS.length)],
  ).join("");

export const createTeam = async (data) => {
  // Retry until we find an ID not already taken (collision is extremely rare but handled)
  let teamId;
  let exists = true;
  while (exists) {
    teamId = generateTeamId();
    const snap = await getDoc(doc(db, "teams", teamId));
    exists = snap.exists();
  }
  await setDoc(doc(db, "teams", teamId), data);
  return teamId;
};

export const getTeam = (teamId) => getDoc(doc(db, "teams", teamId));

export const getTeamMembers = async (teamId) => {
  const snap = await getDocs(
    query(collection(db, "users"), where("teamId", "==", teamId)),
  );
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
};

//  save data for activity 1 - parachute
export const setActivity1 = async (
  teamId,
  data,
  userAnswers,
  validation,
  score,
) => {
  try {
    const docRef = await addDoc(collection(db, "activities"), {
      teamId: teamId,
      experiementData: data,
      userAnswers: userAnswers,
      validation,
      totalScore: score,
      createdAt: serverTimestamp(),
      completedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (e) {
    console.error("Error saving activity 1 to Firestore", e);
    throw e;
  }
};

// activity 4 - earthquake
export const setActivity4 = async (teamId, designNumber, result) => {
  try {
    const docRef = await addDoc(collection(db, "activities"), {
      teamId: teamId,
      designNumber: designNumber,
      label: result.label,
      description: result.label,
      peakRotationRateDeg: result.peakRotationRateDeg,
      totalRotationDeg: result.totalRotationDeg,
      maxAcceleration: result.maxAcceleration,
      stabilityScore: result.stabilityScore,
      createdAt: serverTimestamp(),
      completedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (e) {
    console.error("Error saving activity 4 to Firestore", e);
    throw e;
  }
};

export const updateUserAvatar = (uid, avatarId) =>
  setDoc(doc(db, "users", uid), { avatarId }, { merge: true });

export const getUserAvatar = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.data()?.avatarId ?? null;
};

export { serverTimestamp };
