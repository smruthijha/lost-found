import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "./config";

export const seedAdmin = async () => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("You must be logged in first.");
  await updateDoc(doc(db, "users", uid), { role: "admin" });
  console.log("✅ Admin role granted to", auth.currentUser.email);
};