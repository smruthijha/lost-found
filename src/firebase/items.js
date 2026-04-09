import {
  collection, addDoc, getDocs, getDoc,
  doc, deleteDoc, updateDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

const COL = "items";

/* ── helpers ─────────────────────────────────────────────────────────────── */
const toMs = (ts) => ts?.seconds ? ts.seconds * 1000 : (ts ?? 0);
const newestFirst = (a, b) => toMs(b.createdAt) - toMs(a.createdAt);

/* ── public feed (open + claim_approved only) ────────────────────────────── */
export const fetchItems = async () => {
  try {
    const snap = await getDocs(collection(db, COL));
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((i) => i.status === "open" || i.status === "claim_approved")
      .sort(newestFirst);
  } catch (e) {
    console.error("fetchItems:", e);
    return [];
  }
};

/* ── admin feed (all statuses) ───────────────────────────────────────────── */
export const fetchAllItems = async () => {
  try {
    const snap = await getDocs(collection(db, COL));
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort(newestFirst);
  } catch (e) {
    console.error("fetchAllItems:", e);
    return [];
  }
};

/* ── single item ─────────────────────────────────────────────────────────── */
export const fetchItem = async (id) => {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) throw new Error("Item not found.");
  return { id: snap.id, ...snap.data() };
};

/* ── create ──────────────────────────────────────────────────────────────── */
export const createItem = async (data) => {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    status: "open",
    createdAt: serverTimestamp(),
    createdAtMs: Date.now(),
  });
  return ref.id;
};

/* ── delete ──────────────────────────────────────────────────────────────── */
export const deleteItem = async (id) => deleteDoc(doc(db, COL, id));

/* ── update status ───────────────────────────────────────────────────────── */
export const updateItemStatus = async (id, status) =>
  updateDoc(doc(db, COL, id), { status, updatedAt: serverTimestamp() });

/* ── stats ───────────────────────────────────────────────────────────────── */
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
    console.error("fetchStats:", e);
    return { total: 0, found: 0, lost: 0, claim_approved: 0, resolved: 0 };
  }
};