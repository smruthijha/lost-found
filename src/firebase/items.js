import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  updateDoc,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

const ITEMS = "items";

/**
 * Status flow:
 *  "open"           → posted, awaiting claims
 *  "claim_approved" → admin approved a claim
 *  "resolved"       → owner collected item
 */

/**
 * Public feed — now using query + orderBy
 */
export const fetchItems = async ({ type, category } = {}) => {
  try {
    let q = query(
      collection(db, ITEMS),
      orderBy("createdAt", "desc") // ✅ using orderBy
    );

    const snap = await getDocs(q);

    let results = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    // Hide resolved items
    results = results.filter(
      (i) => i.status === "open" || i.status === "claim_approved"
    );

    // Optional filters (client-side to avoid index issues)
    if (type && type !== "all") {
      results = results.filter((i) => i.type === type);
    }

    if (category && category !== "All") {
      results = results.filter((i) => i.category === category);
    }

    return { items: results };
  } catch (err) {
    console.error("fetchItems error:", err);
    return { items: [] };
  }
};

/**
 * Admin feed — all items sorted from Firestore
 */
export const fetchAllItems = async () => {
  try {
    const q = query(
      collection(db, ITEMS),
      orderBy("createdAt", "desc") // ✅ used here too
    );

    const snap = await getDocs(q);

    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
  } catch (err) {
    console.error("fetchAllItems error:", err);
    return [];
  }
};

/** Get a single item */
export const fetchItem = async (id) => {
  const snap = await getDoc(doc(db, ITEMS, id));
  if (!snap.exists()) throw new Error("Item not found.");
  return { id: snap.id, ...snap.data() };
};

/** Create item */
export const createItem = async (data) => {
  const ref = await addDoc(collection(db, ITEMS), {
    ...data,
    status: "open",
    createdAt: serverTimestamp(),
    createdAtMs: Date.now(),
  });
  return ref.id;
};

/** Delete item */
export const deleteItem = async (id) =>
  deleteDoc(doc(db, ITEMS, id));

/** Update status */
export const updateItemStatus = async (id, status) =>
  updateDoc(doc(db, ITEMS, id), {
    status,
    updatedAt: serverTimestamp(),
  });

/**
 * Stats (kept simple — no query needed)
 */
export const fetchStats = async () => {
  try {
    const snap = await getDocs(collection(db, ITEMS));
    const all = snap.docs.map((d) => d.data());

    return {
      total: all.length,
      found: all.filter((i) => i.type === "found").length,
      lost: all.filter((i) => i.type === "lost").length,
      claim_approved: all.filter((i) => i.status === "claim_approved").length,
      resolved: all.filter((i) => i.status === "resolved").length,
    };
  } catch (err) {
    console.error("fetchStats error:", err);
    return {
      total: 0,
      found: 0,
      lost: 0,
      claim_approved: 0,
      resolved: 0,
    };
  }
};