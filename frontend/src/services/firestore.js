import { getFirestore, doc, setDoc, getDoc, collection, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import app from "./firebase";

const db = getFirestore(app);

export const saveUserProfile = (uid, data) =>
  setDoc(doc(db, 'users', uid), data);

export const getUserProfile = (uid) =>
  getDoc(doc(db, 'users', uid));

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const generateTeamId = () =>
  Array.from({ length: 5 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');

export const createTeam = async (data) => {
  // Retry until we find an ID not already taken (collision is extremely rare but handled)
  let teamId;
  let exists = true;
  while (exists) {
    teamId = generateTeamId();
    const snap = await getDoc(doc(db, 'teams', teamId));
    exists = snap.exists();
  }
  await setDoc(doc(db, 'teams', teamId), data);
  return teamId;
};

export const getTeam = (teamId) =>
  getDoc(doc(db, 'teams', teamId));

export const getTeamMembers = async (teamId) => {
  const snap = await getDocs(
    query(collection(db, 'users'), where('teamId', '==', teamId))
  );
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
};

export { serverTimestamp };
