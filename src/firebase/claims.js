import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where,
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

/** Get all claims for an item */
export const fetchClaims = async (itemId) => {
  const snap = await getDocs(collection(db, "items", itemId, "claims"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Admin: approve or reject a claim.
 * On approve → item status becomes "claim_approved" (NOT resolved yet).
 * Resolved only happens when owner confirms collection.
 */
export const reviewClaim = async (itemId, claimId, action) => {
  await updateDoc(doc(db, "items", itemId, "claims", claimId), {
    status: action,
    reviewedAt: serverTimestamp(),
  });

  if (action === "approved") {
    // item moves to "claim_approved" — not "resolved" yet
    await updateItemStatus(itemId, "claim_approved");
  }
};

/**
 * Owner marks item as collected → status becomes "resolved"
 * Also stamps collectedAt on the claim
 */
export const markItemCollected = async (itemId, claimId) => {
  await updateDoc(doc(db, "items", itemId, "claims", claimId), {
    collected: true,
    collectedAt: serverTimestamp(),
  });

  await updateItemStatus(itemId, "resolved");
};

/** Get ALL pending claims across all items (admin dashboard) */
export const fetchAllPendingClaims = async () => {
  const itemsSnap = await getDocs(collection(db, "items"));
  const pending = [];

  await Promise.all(
    itemsSnap.docs.map(async (itemDoc) => {
      const claimsSnap = await getDocs(
        query(
          collection(db, "items", itemDoc.id, "claims"),
          where("status", "==", "pending")
        )
      );

      claimsSnap.docs.forEach((c) => {
        pending.push({
          id: c.id,
          itemId: itemDoc.id,
          item: { id: itemDoc.id, ...itemDoc.data() },
          ...c.data(),
        });
      });
    })
  );

  return pending;
};

/**
 * Get the approved claim for an item.
 * Fetches ALL claims and filters client-side to avoid
 * needing a Firestore composite index on the subcollection.
 */
export const fetchApprovedClaim = async (itemId) => {
  const snap = await getDocs(collection(db, "items", itemId, "claims"));

  const approved = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .find((c) => c.status === "approved");

  return approved || null;
};