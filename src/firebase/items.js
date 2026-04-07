import {
  collection, addDoc, getDocs, getDoc, doc,
  deleteDoc, updateDoc, query, where, orderBy,
  serverTimestamp, limit, startAfter,
} from "firebase/firestore";
import { db } from "./config";

const ITEMS = "items";

/** Fetch items with optional filters */
export const fetchItems = async ({ type, category, status, pageSize = 12, lastDoc = null } = {}) => {
  let q = query(collection(db, ITEMS), orderBy("createdAt", "desc"));

  if (type     && type !== "all")  q = query(q, where("type",     "==", type));
  if (category && category !== "All") q = query(q, where("category", "==", category));
  if (status)                      q = query(q, where("status",   "==", status));
  q = query(q, limit(pageSize));
  if (lastDoc) q = query(q, startAfter(lastDoc));

  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const lastVisible = snap.docs[snap.docs.length - 1] || null;
  return { items, lastVisible };
};

/** Get single item */
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
  });
  return ref.id;
};

/** Delete item (admin) */
export const deleteItem = async (id) => deleteDoc(doc(db, ITEMS, id));

/** Update item status */
export const updateItemStatus = async (id, status) =>
  updateDoc(doc(db, ITEMS, id), { status });

/** Get stats */
export const fetchStats = async () => {
  const snap = await getDocs(collection(db, ITEMS));
  const all  = snap.docs.map((d) => d.data());
  return {
    total:    all.length,
    found:    all.filter((i) => i.type === "found").length,
    lost:     all.filter((i) => i.type === "lost").length,
    resolved: all.filter((i) => i.status === "resolved").length,
  };
};
