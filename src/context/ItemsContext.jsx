import { createContext, useContext, useState, useCallback } from "react";
import {
  fetchItems        as fbFetchItems,
  fetchAllItems     as fbFetchAllItems,
  fetchStats        as fbFetchStats,
  createItem        as fbCreateItem,
  deleteItem        as fbDeleteItem,
} from "../firebase/items";
import {
  submitClaim        as fbSubmitClaim,
  reviewClaim        as fbReviewClaim,
  fetchClaims        as fbFetchClaims,
  fetchApprovedClaim as fbFetchApproved,
  fetchAllPendingClaims,
  markItemCollected  as fbMarkCollected,
} from "../firebase/claims";
import { uploadImage } from "../firebase/storage";

const ItemsCtx = createContext(null);

export function ItemsProvider({ children }) {
  const [items,          setItems]          = useState([]);
  const [stats,          setStats]          = useState({ total:0, found:0, lost:0, claim_approved:0, resolved:0 });
  const [pendingClaims,  setPendingClaims]  = useState([]);
  const [loadingItems,   setLoadingItems]   = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError,    setUploadError]    = useState(null);

  /* ── Public feed ──────────────────────────────────────────────────────── */
  const loadItems = useCallback(async () => {
    setLoadingItems(true);
    try {
      // ✅ fetchItems now returns a plain array (not {items})
      const list = await fbFetchItems();
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("loadItems:", e);
      setItems([]);
    } finally {
      setLoadingItems(false);
    }
  }, []);

  /* ── Admin feed ───────────────────────────────────────────────────────── */
  const loadAllItems = useCallback(async () => {
    setLoadingItems(true);
    try {
      const list = await fbFetchAllItems();
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("loadAllItems:", e);
      setItems([]);
    } finally {
      setLoadingItems(false);
    }
  }, []);

  /* ── Stats ────────────────────────────────────────────────────────────── */
  const loadStats = useCallback(async () => {
    try {
      const s = await fbFetchStats();
      setStats(s ?? { total:0, found:0, lost:0, claim_approved:0, resolved:0 });
    } catch (e) {
      console.error("loadStats:", e);
    }
  }, []);

  /* ── Pending claims ───────────────────────────────────────────────────── */
  const loadPending = useCallback(async () => {
    try {
      const p = await fetchAllPendingClaims();
      setPendingClaims(Array.isArray(p) ? p : []);
    } catch (e) {
      console.error("loadPending:", e);
      setPendingClaims([]);
    }
  }, []);

  /* ── Add item ─────────────────────────────────────────────────────────── */
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

    const id = await fbCreateItem({ ...formData, image: imageUrl });
    await loadItems(); // ✅ refresh public feed after posting
    await loadStats();
    return id;
  };

  /* ── Remove item ──────────────────────────────────────────────────────── */
  const removeItem = async (id) => {
    await fbDeleteItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    await loadStats();
  };

  /* ── Claims ───────────────────────────────────────────────────────────── */
  const submitClaim = (itemId, data) => fbSubmitClaim(itemId, data);
  const getClaims   = (itemId)       => fbFetchClaims(itemId);
  const getApproved = (itemId)       => fbFetchApproved(itemId);

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

  /* ── Mark collected — removes from public feed immediately ───────────── */
  const markCollected = async (itemId, claimId) => {
    await fbMarkCollected(itemId, claimId);
    // Remove from local list right away (it's now resolved = hidden from public)
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    await loadStats();
  };

  return (
    <ItemsCtx.Provider value={{
      items,
      stats,
      pendingClaims,
      loadingItems,
      uploadProgress,
      uploadError,
      loadItems,
      loadAllItems,
      loadStats,
      loadPending,
      addItem,
      removeItem,
      submitClaim,
      getClaims,
      getApproved,
      reviewClaim,
      markCollected,
    }}>
      {children}
    </ItemsCtx.Provider>
  );
}

export const useItems = () => useContext(ItemsCtx);