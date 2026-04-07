import {
  collection, addDoc, getDocs, doc, updateDoc,
  serverTimestamp, query, where,
} from "firebase/firestore";
import { db } from "./config";
import { updateItemStatus } from "./items";

/** Submit a claim on an item */
export const submitClaim = async (itemId, claimData) => {
  await addDoc(collection(db, "items", itemId, "claims"), {
    ...claimData,
    status: "pending",
    createdAt: serverTimestamp(),
  });
};

/** Get all claims for an item (admin) */
export const fetchClaims = async (itemId) => {
  const snap = await getDocs(collection(db, "items", itemId, "claims"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/** Admin: approve or reject a claim */
export const reviewClaim = async (itemId, claimId, action) => {
  await updateDoc(doc(db, "items", itemId, "claims", claimId), { status: action });
  if (action === "approved") await updateItemStatus(itemId, "resolved");
};

/** Get ALL pending claims across all items (admin dashboard) */
export const fetchAllPendingClaims = async () => {
  const itemsSnap = await getDocs(collection(db, "items"));
  const pending   = [];

  await Promise.all(
    itemsSnap.docs.map(async (itemDoc) => {
      const claimsSnap = await getDocs(
        query(collection(db, "items", itemDoc.id, "claims"), where("status", "==", "pending"))
      );
      claimsSnap.docs.forEach((c) => {
        pending.push({
          id:     c.id,
          itemId: itemDoc.id,
          item:   { id: itemDoc.id, ...itemDoc.data() },
          ...c.data(),
        });
      });
    })
  );

  return pending;
};
