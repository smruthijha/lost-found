import { createContext, useContext, useState, useCallback } from "react";
import {
  fetchItems    as fbFetchItems,
  fetchAllItems as fbFetchAllItems,
  fetchStats    as fbFetchStats,
  createItem    as fbCreateItem,
  deleteItem    as fbDeleteItem,
} from "../firebase/items";
import {
  submitClaim          as fbSubmitClaim,
  reviewClaim          as fbReviewClaim,
  fetchClaims          as fbFetchClaims,
  fetchApprovedClaim   as fbFetchApproved,
  fetchAllPendingClaims,
  markItemCollected    as fbMarkCollected,
} from "../firebase/claims";
import { uploadImage } from "../firebase/storage";

const ItemsCtx = createContext(null);

export function ItemsProvider({ children }) {
  const [items,          setItems]          = useState([]);
  const [stats,          setStats]          = useState({ total: 0, found: 0, lost: 0, claim_approved: 0, resolved: 0 });
  const [pendingClaims,  setPendingClaims]  = useState([]);
  const [loadingItems,   setLoadingItems]   = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError,    setUploadError]    = useState(null);

  // ── Public feed (hides resolved) ──────────────────────────────────────
  const loadItems = useCallback(async (filters = {}) => {
    setLoadingItems(true);
    try {
      const { items: list } = await fbFetchItems(filters);
      setItems(list);
    } catch (err) {
      console.error("loadItems failed:", err);
      setItems([]);
    } finally {
      setLoadingItems(false);
    }
  }, []); // ✅ stable — no dependencies that change

  // ── Admin feed (includes resolved) ────────────────────────────────────
  const loadAllItems = useCallback(async () => {
    setLoadingItems(true);
    try {
      const list = await fbFetchAllItems();
      setItems(list);
    } catch (err) {
      console.error("loadAllItems failed:", err);
      setItems([]);
    } finally {
      setLoadingItems(false);
    }
  }, []);

  // ── Stats ─────────────────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    try {
      const s = await fbFetchStats();
      setStats(s);
    } catch (err) {
      console.error("loadStats failed:", err);
    }
  }, []);

  // ── Pending claims (admin) ────────────────────────────────────────────
  const loadPending = useCallback(async () => {
    try {
      const p = await fetchAllPendingClaims();
      setPendingClaims(p);
    } catch (err) {
      console.error("loadPending failed:", err);
      setPendingClaims([]);
    }
  }, []);

  // ── Add item with optional image upload ───────────────────────────────
  const addItem = async (formData, imageFile) => {
    let imageUrl = null;
    setUploadError(null);

    if (imageFile) {
      setUploadProgress(1);
      try {
        imageUrl = await uploadImage(imageFile, setUploadProgress);
      } catch (err) {
        setUploadProgress(0);
        setUploadError(err.message);
        throw err;
      }
      setUploadProgress(100);
      await new Promise((r) => setTimeout(r, 600));
      setUploadProgress(0);
    }

    try {
      const id = await fbCreateItem({ ...formData, image: imageUrl });
      // ✅ Reload full list so newly posted item appears immediately
      await loadItems();
      await loadStats();
      return id;
    } catch (err) {
      console.error("addItem failed:", err);
      throw err;
    }
  };

  // ── Remove item ───────────────────────────────────────────────────────
  const removeItem = async (id) => {
    await fbDeleteItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    await loadStats();
  };

  // ── Claims ────────────────────────────────────────────────────────────
  const submitClaim = async (itemId, data) => fbSubmitClaim(itemId, data);

  const getClaims   = async (itemId) => fbFetchClaims(itemId);

  const getApproved = async (itemId) => fbFetchApproved(itemId);

  const reviewClaim = async (itemId, claimId, action) => {
    await fbReviewClaim(itemId, claimId, action);
    await loadPending();
    await loadStats();
    if (action === "approved") {
      setItems((prev) =>
        prev.map((i) => i.id === itemId ? { ...i, status: "claim_approved" } : i)
      );
    }
  };

  const markCollected = async (itemId, claimId) => {
    await fbMarkCollected(itemId, claimId);
    setItems((prev) =>
      prev.map((i) => i.id === itemId ? { ...i, status: "resolved" } : i)
    );
    await loadStats();
  };

  return (
    <ItemsCtx.Provider value={{
      items, stats, pendingClaims,
      loadingItems, uploadProgress, uploadError,
      loadItems, loadAllItems, loadStats, loadPending,
      addItem, removeItem,
      submitClaim, getClaims, getApproved,
      reviewClaim, markCollected,
    }}>
      {children}
    </ItemsCtx.Provider>
  );
}

export const useItems = () => useContext(ItemsCtx);