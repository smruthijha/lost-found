import {
  collection, addDoc, getDocs, getDoc, doc,
  deleteDoc, updateDoc, query, where, orderBy,
  serverTimestamp, limit,
} from "firebase/firestore";
import { db } from "./config";

const ITEMS = "items";

/**
 * Item status flow:
 *   "open"           → item posted, awaiting claims
 *   "claim_approved" → admin approved a claim, owner notified, awaiting collection
 *   "resolved"       → owner confirmed item collected
 */

/** Fetch items with optional filters — hide "resolved" from public by default */
export const fetchItems = async ({ type, category, status, pageSize = 20 } = {}) => {
  let constraints = [orderBy("createdAt", "desc"), limit(pageSize)];

  if (type     && type !== "all")  constraints.push(where("type",     "==", type));
  if (category && category !== "All") constraints.push(where("category", "==", category));

  // Only show resolved items if explicitly requested (admin view)
  if (status) {
    constraints.push(where("status", "==", status));
  } else {
    // Public view: only show open + claim_approved items
    constraints.push(where("status", "in", ["open", "claim_approved"]));
  }

  const q    = query(collection(db, ITEMS), ...constraints);
  const snap = await getDocs(q);
  return { items: snap.docs.map((d) => ({ id: d.id, ...d.data() })) };
};

/** Fetch ALL items including resolved — for admin dashboard */
export const fetchAllItems = async () => {
  const snap = await getDocs(
    query(collection(db, ITEMS), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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

/** Delete item */
export const deleteItem = async (id) => deleteDoc(doc(db, ITEMS, id));

/** Update item status */
export const updateItemStatus = async (id, status) =>
  updateDoc(doc(db, ITEMS, id), { status, updatedAt: serverTimestamp() });

/** Get stats — counts all statuses */
export const fetchStats = async () => {
  const snap = await getDocs(collection(db, ITEMS));
  const all  = snap.docs.map((d) => d.data());
  return {
    total:          all.length,
    found:          all.filter((i) => i.type === "found").length,
    lost:           all.filter((i) => i.type === "lost").length,
    claim_approved: all.filter((i) => i.status === "claim_approved").length,
    resolved:       all.filter((i) => i.status === "resolved").length,
  };
};