import {
  collection, addDoc, getDocs, getDoc,
  doc, deleteDoc, updateDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

const COL = "items";

const toMs = (ts) => {
  if (!ts) return 0;
  if (ts.seconds) return ts.seconds * 1000; // Firestore Timestamp
  if (typeof ts === "number") return ts;
  return new Date(ts).getTime() || 0;
};

const newestFirst = (a, b) =>
  toMs(b.createdAt || b.createdAtMs) - toMs(a.createdAt || a.createdAtMs);

/* ─────────────────────────────────────────────────────────────────────────
   PUBLIC FEED
   Shows: open, claim_approved, AND items with no status field (legacy)
   Hides: only explicitly "resolved" items
───────────────────────────────────────────────────────────────────────── */
export const fetchItems = async () => {
  try {
    const snap = await getDocs(collection(db, COL));
    const all  = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // ✅ Only exclude items explicitly marked as "resolved"
    // Items with undefined/null/missing status are shown (treated as open)
    const visible = all.filter((i) => i.status !== "resolved");

    return visible.sort(newestFirst);
  } catch (e) {
    console.error("fetchItems error:", e);
    return [];
  }
};

/* ─────────────────────────────────────────────────────────────────────────
   ADMIN FEED — all items including resolved
───────────────────────────────────────────────────────────────────────── */
export const fetchAllItems = async () => {
  try {
    const snap = await getDocs(collection(db, COL));
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort(newestFirst);
  } catch (e) {
    console.error("fetchAllItems error:", e);
    return [];
  }
};

/* ─────────────────────────────────────────────────────────────────────────
   SINGLE ITEM
───────────────────────────────────────────────────────────────────────── */
export const fetchItem = async (id) => {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) throw new Error("Item not found.");
  return { id: snap.id, ...snap.data() };
};

/* ─────────────────────────────────────────────────────────────────────────
   CREATE — always writes status: "open"
───────────────────────────────────────────────────────────────────────── */
export const createItem = async (data) => {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    status:      "open",
    createdAt:    serverTimestamp(),
    createdAtMs:  Date.now(), // fallback for instant sort before serverTimestamp resolves
  });
  return ref.id;
};

/* ─────────────────────────────────────────────────────────────────────────
   DELETE
───────────────────────────────────────────────────────────────────────── */
export const deleteItem = async (id) => deleteDoc(doc(db, COL, id));

/* ─────────────────────────────────────────────────────────────────────────
   UPDATE STATUS
───────────────────────────────────────────────────────────────────────── */
export const updateItemStatus = async (id, status) =>
  updateDoc(doc(db, COL, id), { status, updatedAt: serverTimestamp() });

/* ─────────────────────────────────────────────────────────────────────────
   STATS
───────────────────────────────────────────────────────────────────────── */
export const fetchStats = async () => {
  try {
    const snap = await getDocs(collection(db, COL));
    const all  = snap.docs.map((d) => d.data());
    return {
      total:          all.length,
      found:          all.filter((i) => i.type === "found").length,
      lost:           all.filter((i) => i.type === "lost").length,
      claim_approved: all.filter((i) => i.status === "claim_approved").length,
      resolved:       all.filter((i) => i.status === "resolved").length,
    };
  } catch (e) {
    console.error("fetchStats error:", e);
    return { total: 0, found: 0, lost: 0, claim_approved: 0, resolved: 0 };
  }
};