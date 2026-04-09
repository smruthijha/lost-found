import {
  collection, addDoc, getDocs,
  doc, updateDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import { updateItemStatus } from "./items";

/* ─────────────────────────────────────────────────────────────────────────
   SUBMIT CLAIM
   Anyone (logged-in or not) can submit a claim.
   We store their contact info here — it stays hidden until admin approves.
───────────────────────────────────────────────────────────────────────── */
export const submitClaim = async (itemId, { name, email, phone, description }) => {
  try {
    await addDoc(collection(db, "items", itemId, "claims"), {
      name, email, phone, description,
      status:    "pending",
      collected: false,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("submitClaim:", e);
    throw e;
  }
};

/* ─────────────────────────────────────────────────────────────────────────
   FETCH ALL CLAIMS FOR AN ITEM  (admin use)
───────────────────────────────────────────────────────────────────────── */
export const fetchClaims = async (itemId) => {
  try {
    const snap = await getDocs(collection(db, "items", itemId, "claims"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error("fetchClaims:", e);
    return [];
  }
};

/* ─────────────────────────────────────────────────────────────────────────
   FETCH THE APPROVED CLAIM  (used to show contact info to both parties)
   Returns the single approved claim doc, or null.
───────────────────────────────────────────────────────────────────────── */
export const fetchApprovedClaim = async (itemId) => {
  try {
    const snap = await getDocs(collection(db, "items", itemId, "claims"));
    const all  = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return all.find((c) => c.status === "approved") ?? null;
  } catch (e) {
    console.error("fetchApprovedClaim:", e);
    return null;
  }
};

/* ─────────────────────────────────────────────────────────────────────────
   ADMIN: APPROVE OR REJECT A CLAIM
   approve → item status becomes "claim_approved"
             both poster & claimer can now see each other's contact info
   reject  → item stays "open", others can still claim
───────────────────────────────────────────────────────────────────────── */
export const reviewClaim = async (itemId, claimId, action) => {
  try {
    await updateDoc(doc(db, "items", itemId, "claims", claimId), {
      status:     action,   // "approved" | "rejected"
      reviewedAt: serverTimestamp(),
    });
    if (action === "approved") {
      await updateItemStatus(itemId, "claim_approved");
    }
  } catch (e) {
    console.error("reviewClaim:", e);
    throw e;
  }
};

/* ─────────────────────────────────────────────────────────────────────────
   MARK ITEM COLLECTED
   Called by the OWNER (poster on a "lost" item, or claimer on a "found" item)
   after physically receiving the item.
   → claim gets collected:true
   → item status becomes "resolved"
   → item disappears from public dashboard
   → only admin can see it
───────────────────────────────────────────────────────────────────────── */
export const markItemCollected = async (itemId, claimId) => {
  try {
    await updateDoc(doc(db, "items", itemId, "claims", claimId), {
      collected:   true,
      collectedAt: serverTimestamp(),
    });
    await updateItemStatus(itemId, "resolved");
  } catch (e) {
    console.error("markItemCollected:", e);
    throw e;
  }
};

/* ─────────────────────────────────────────────────────────────────────────
   FETCH ALL PENDING CLAIMS  (admin dashboard)
───────────────────────────────────────────────────────────────────────── */
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
            if (c.data().status === "pending") {
              pending.push({
                id:     c.id,
                itemId: itemDoc.id,
                item:   { id: itemDoc.id, ...itemDoc.data() },
                ...c.data(),
              });
            }
          });
        } catch { /* skip items whose claims can't be read */ }
      })
    );

    return pending;
  } catch (e) {
    console.error("fetchAllPendingClaims:", e);
    return [];
  }
};