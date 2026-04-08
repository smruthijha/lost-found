import {
  collection, addDoc, getDocs, doc, updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import { updateItemStatus } from "./items";

/** Submit a claim on an item (no auth required) */
export const submitClaim = async (itemId, claimData) => {
  try {
    await addDoc(collection(db, "items", itemId, "claims"), {
      ...claimData,
      status: "pending",
      collected: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("submitClaim error:", err);
    throw err;
  }
};

/** Fetch ALL claims for one item */
export const fetchClaims = async (itemId) => {
  try {
    const snap = await getDocs(collection(db, "items", itemId, "claims"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("fetchClaims error:", err);
    return [];
  }
};

/**
 * Fetch the approved claim for an item.
 * Client-side filter avoids needing a Firestore composite index.
 */
export const fetchApprovedClaim = async (itemId) => {
  try {
    const snap = await getDocs(collection(db, "items", itemId, "claims"));
    const all  = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return all.find((c) => c.status === "approved") || null;
  } catch (err) {
    console.error("fetchApprovedClaim error:", err);
    return null;
  }
};

/**
 * Admin: approve or reject a claim.
 * On approve → item status becomes "claim_approved" (not resolved yet).
 */
export const reviewClaim = async (itemId, claimId, action) => {
  try {
    await updateDoc(doc(db, "items", itemId, "claims", claimId), {
      status:     action,
      reviewedAt: serverTimestamp(),
    });
    if (action === "approved") {
      await updateItemStatus(itemId, "claim_approved");
    }
  } catch (err) {
    console.error("reviewClaim error:", err);
    throw err;
  }
};

/**
 * Owner confirms item collected → item becomes "resolved".
 */
export const markItemCollected = async (itemId, claimId) => {
  try {
    await updateDoc(doc(db, "items", itemId, "claims", claimId), {
      collected:   true,
      collectedAt: serverTimestamp(),
    });
    await updateItemStatus(itemId, "resolved");
  } catch (err) {
    console.error("markItemCollected error:", err);
    throw err;
  }
};

/**
 * Admin dashboard: get ALL pending claims across ALL items.
 * Loads every item's claims subcollection and filters client-side.
 */
export const fetchAllPendingClaims = async () => {
  try {
    const itemsSnap = await getDocs(collection(db, "items"));
    const pending   = [];

    await Promise.all(
      itemsSnap.docs.map(async (itemDoc) => {
        try {
          const claimsSnap = await getDocs(
            collection(db, "items", itemDoc.id, "claims")
          );
          claimsSnap.docs.forEach((c) => {
            const data = c.data();
            if (data.status === "pending") {
              pending.push({
                id:     c.id,
                itemId: itemDoc.id,
                item:   { id: itemDoc.id, ...itemDoc.data() },
                ...data,
              });
            }
          });
        } catch (innerErr) {
          console.error(`Error fetching claims for item ${itemDoc.id}:`, innerErr);
        }
      })
    );

    return pending;
  } catch (err) {
    console.error("fetchAllPendingClaims error:", err);
    return [];
  }
};