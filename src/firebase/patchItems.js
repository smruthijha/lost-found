/**
 * ONE-TIME PATCH SCRIPT
 * Run this once from browser console to fix existing Firestore items
 * that are missing the `status` field.
 *
 * How to run:
 * 1. Open your app in browser
 * 2. Open DevTools → Console
 * 3. Paste and run:
 *
 *    import("/src/firebase/patchItems.js").then(m => m.patchMissingStatus())
 *
 * OR import and call it temporarily from App.jsx on first load.
 */

import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "./config";

export const patchMissingStatus = async () => {
  console.log("🔧 Patching items with missing status field...");
  const snap = await getDocs(collection(db, "items"));

  let patched = 0;
  await Promise.all(
    snap.docs.map(async (d) => {
      const data = d.data();
      if (!data.status) {
        await updateDoc(doc(db, "items", d.id), { status: "open" });
        console.log(`✅ Patched item: ${data.title || d.id}`);
        patched++;
      }
    })
  );

  console.log(`✅ Done. Patched ${patched} item(s).`);
};