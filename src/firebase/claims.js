import {
  collection, addDoc, getDocs,
  doc, updateDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import { updateItemStatus } from "./items";

/* ─── Submit a new claim ─────────────────────────────────────────────────── */
export const submitClaim = async (itemId, { name, email, phone, description }) => {
  try {
    await addDoc(collection(db, "items", itemId, "claims"), {
      name, email, phone, description,
      status:    "pending",
      collected: false,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("submitClaim error:", e);
    throw e;
  }
};

/* ─── Fetch ALL claims for one item ──────────────────────────────────────── */
export const fetchClaims = async (itemId) => {
  try {
    const snap = await getDocs(collection(db, "items", itemId, "claims"));
    const claims = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    console.log(`fetchClaims(${itemId}) →`, claims); // debug
    return claims;
  } catch (e) {
    console.error("fetchClaims error:", e);
    return [];
  }
};

/* ─── Fetch the single APPROVED claim ────────────────────────────────────── */
export const fetchApprovedClaim = async (itemId) => {
  try {
    const snap = await getDocs(collection(db, "items", itemId, "claims"));
    const all  = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    console.log(`fetchApprovedClaim(${itemId}) all claims:`, all); // debug

    const approved = all.find((c) => c.status === "approved");
    console.log(`fetchApprovedClaim(${itemId}) found approved:`, approved); // debug
    return approved || null;
  } catch (e) {
    console.error("fetchApprovedClaim error:", e);
    return null;
  }
};

/* ─── Admin: approve or reject ───────────────────────────────────────────── */
export const reviewClaim = async (itemId, claimId, action) => {
  try {
    // 1. Update the claim status
    await updateDoc(doc(db, "items", itemId, "claims", claimId), {
      status:     action,
      reviewedAt: serverTimestamp(),
    });
    console.log(`reviewClaim: item=${itemId} claim=${claimId} action=${action}`);

    // 2. Update item status if approved
    if (action === "approved") {
      await updateItemStatus(itemId, "claim_approved");
      console.log(`reviewClaim: item ${itemId} status → claim_approved`);
    }
  } catch (e) {
    console.error("reviewClaim error:", e);
    throw e;
  }
};

/* ─── Owner marks item collected → fully resolved ────────────────────────── */
export const markItemCollected = async (itemId, claimId) => {
  try {
    await updateDoc(doc(db, "items", itemId, "claims", claimId), {
      collected:   true,
      collectedAt: serverTimestamp(),
    });
    await updateItemStatus(itemId, "resolved");
    console.log(`markItemCollected: item ${itemId} → resolved`);
  } catch (e) {
    console.error("markItemCollected error:", e);
    throw e;
  }
};

/* ─── Admin dashboard: all pending claims across all items ───────────────── */
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
        } catch { /* skip */ }
      })
    );

    return pending;
  } catch (e) {
    console.error("fetchAllPendingClaims error:", e);
    return [];
  }
};