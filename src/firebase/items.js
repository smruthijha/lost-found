import {
  collection, addDoc, getDocs, getDoc, doc,
  deleteDoc, updateDoc, orderBy, query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

const ITEMS = "items";

/**
 * Status flow:
 *  "open"           → posted, awaiting claims
 *  "claim_approved" → admin approved a claim, awaiting owner collection
 *  "resolved"       → owner confirmed item collected
 */

/**
 * Public feed — fetch all items, filter client-side.
 * No compound index needed. Resolved items hidden unless requested.
 */
export const fetchItems = async ({ type, category } = {}) => {
  try {
    // ✅ No orderBy to avoid index issues — sort client-side instead
    const snap = await getDocs(collection(db, ITEMS));

    let results = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Hide resolved from public feed
    results = results.filter(
      (i) => i.status === "open" || i.status === "claim_approved"
    );

    if (type     && type !== "all")   results = results.filter((i) => i.type     === type);
    if (category && category !== "All") results = results.filter((i) => i.category === category);

    // Sort newest first client-side — handles serverTimestamp null on first write
    results.sort((a, b) => {
      const aTime = a.createdAt?.seconds ?? a.createdAt ?? 0;
      const bTime = b.createdAt?.seconds ?? b.createdAt ?? 0;
      return bTime - aTime;
    });

    return { items: results };
  } catch (err) {
    console.error("fetchItems error:", err);
    return { items: [] };
  }
};

/**
 * Admin feed — fetch ALL items including resolved.
 */
export const fetchAllItems = async () => {
  try {
    const snap = await getDocs(collection(db, ITEMS));
    const results = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    results.sort((a, b) => {
      const aTime = a.createdAt?.seconds ?? a.createdAt ?? 0;
      const bTime = b.createdAt?.seconds ?? b.createdAt ?? 0;
      return bTime - aTime;
    });
    return results;
  } catch (err) {
    console.error("fetchAllItems error:", err);
    return [];
  }
};

/** Get a single item by ID */
export const fetchItem = async (id) => {
  const snap = await getDoc(doc(db, ITEMS, id));
  if (!snap.exists()) throw new Error("Item not found.");
  return { id: snap.id, ...snap.data() };
};

/** Create a new item */
export const createItem = async (data) => {
  // Use Date.now() as fallback so sorting works immediately
  const ref = await addDoc(collection(db, ITEMS), {
    ...data,
    status: "open",
    createdAt: serverTimestamp(),
    createdAtMs: Date.now(), // ✅ fallback for instant sort
  });
  return ref.id;
};

/** Delete an item */
export const deleteItem = async (id) => deleteDoc(doc(db, ITEMS, id));

/** Update item status */
export const updateItemStatus = async (id, status) =>
  updateDoc(doc(db, ITEMS, id), { status, updatedAt: serverTimestamp() });

/** Stats — counts across all statuses */
export const fetchStats = async () => {
  try {
    const snap = await getDocs(collection(db, ITEMS));
    const all  = snap.docs.map((d) => d.data());
    return {
      total:          all.length,
      found:          all.filter((i) => i.type === "found").length,
      lost:           all.filter((i) => i.type === "lost").length,
      claim_approved: all.filter((i) => i.status === "claim_approved").length,
      resolved:       all.filter((i) => i.status === "resolved").length,
    };
  } catch (err) {
    console.error("fetchStats error:", err);
    return { total: 0, found: 0, lost: 0, claim_approved: 0, resolved: 0 };
  }
};