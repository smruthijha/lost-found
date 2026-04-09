import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./config";

/** Register new user */
export const registerUser = async ({ name, email, phone, password }) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid  = cred.user.uid;
  await setDoc(doc(db, "users", uid), {
    uid, name, email, phone, role: "user",
    createdAt: new Date().toISOString(),
  });
  return { uid, name, email, phone, role: "user" };
};

/** Login */
export const loginUser = async (email, password) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return getUserProfile(cred.user.uid);
};

/** Logout */
export const logoutUser = () => signOut(auth);

/** Get profile from Firestore */
export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) throw new Error("User profile not found.");
  return snap.data();
};

/** Update name and phone in Firestore */
export const updateUserProfile = async (uid, { name, phone }) => {
  await updateDoc(doc(db, "users", uid), { name, phone });
  return { name, phone };
};

/** Change password — requires re-auth with current password */
export const changeUserPassword = async (currentPassword, newPassword) => {
  const user       = auth.currentUser;
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential); // verify current password
  await updatePassword(user, newPassword);
};

/** Subscribe to auth state */
export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);