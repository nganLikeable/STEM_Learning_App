import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import app from "./firebase";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
export const db = getFirestore(app);

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
  await setDoc(doc(db, "teams", teamId), { points: 0, ...data });
  return teamId;
};

// team avatar
export const updateTeamAvatar = (teamId, avatarId) =>
  setDoc(doc(db, "teams", teamId), { avatarId }, { merge: true });

export const getTeamAvatar = async (teamId) => {
  const snap = await getDoc(doc(db, "teams", teamId));
  return snap.data()?.avatarId ?? null;
};

export const getAllTeams = async () => {
  const snap = await getDocs(collection(db, "teams"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addTeamPoints = (teamId, pts) =>
  updateDoc(doc(db, "teams", teamId), { points: increment(pts) });

export const getTeam = (teamId) => getDoc(doc(db, "teams", teamId));

export const getTeamMembers = async (teamId) => {
  const snap = await getDocs(
    query(collection(db, "users"), where("teamId", "==", teamId)),
  );
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
};

export const markTodayAttendance = (uid) => {
  const today = new Date().toISOString().slice(0, 10);
  return setDoc(
    doc(db, "users", uid),
    { attendanceDates: arrayUnion(today) },
    { merge: true },
  );
};

export const updateUserAvatar = (uid, avatarId) =>
  setDoc(doc(db, "users", uid), { avatarId }, { merge: true });

export const getUserAvatar = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.data()?.avatarId ?? null;
};

// ── Notifications ─────────────────────────────────────────────────────────────

export const addNotification = (uid, data) =>
  addDoc(collection(db, "users", uid, "notifications"), {
    ...data,
    createdAt: serverTimestamp(),
  });

/** @param {string | null} [excludeUid] */
export const addTeamNotification = async (teamId, data, excludeUid = null) => {
  const members = await getTeamMembers(teamId);
  await Promise.all(
    members
      .filter((m) => m.uid !== excludeUid)
      .map((m) => addNotification(m.uid, data)),
  );
};

export const markAllNotificationsSeen = async (uid) => {
  const snap = await getDocs(
    query(
      collection(db, "users", uid, "notifications"),
      where("seen", "==", false),
    ),
  );
  if (snap.empty) return;
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.update(d.ref, { seen: true }));
  await batch.commit();
};

export { serverTimestamp };
