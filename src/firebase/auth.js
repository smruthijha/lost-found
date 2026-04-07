import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./config";

/** Register new user — saves profile to Firestore */
export const registerUser = async ({ name, email, phone, password }) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid  = cred.user.uid;
  await setDoc(doc(db, "users", uid), {
    uid, name, email, phone, role: "user", createdAt: new Date().toISOString(),
  });
  return { uid, name, email, phone, role: "user" };
};

/** Login — returns user profile from Firestore */
export const loginUser = async (email, password) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return getUserProfile(cred.user.uid);
};

/** Logout */
export const logoutUser = () => signOut(auth);

/** Fetch user profile from Firestore */
export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) throw new Error("User profile not found.");
  return snap.data();
};

/** Subscribe to auth state changes */
export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);