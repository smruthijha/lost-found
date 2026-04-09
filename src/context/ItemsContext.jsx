import { createContext, useContext, useState, useCallback } from "react";
import {
  fetchItems as fbFetchItems, fetchStats as fbFetchStats,
  createItem as fbCreateItem, deleteItem as fbDeleteItem,
} from "../firebase/items";
import {
  submitClaim as fbSubmitClaim, reviewClaim as fbReviewClaim,
  fetchAllPendingClaims, fetchClaims,
} from "../firebase/claims";
import { uploadImage } from "../firebase/storage";

const ItemsCtx = createContext(null);

export function ItemsProvider({ children }) {
  const [items,          setItems]          = useState([]);
  const [stats,          setStats]          = useState({ total:0, found:0, lost:0, resolved:0 });
  const [pendingClaims,  setPendingClaims]  = useState([]);
  const [loadingItems,   setLoadingItems]   = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const loadItems = useCallback(async (filters = {}) => {
    setLoadingItems(true);
    try {
      const { items: list } = await fbFetchItems(filters);
      setItems(list);
    } finally {
      setLoadingItems(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    const s = await fbFetchStats();
    setStats(s);
  }, []);

  const loadPending = useCallback(async () => {
    const p = await fetchAllPendingClaims();
    setPendingClaims(p);
  }, []);

  const addItem = async (formData, imageFile) => {
    let imageUrl = null;
    if (imageFile) {
      setUploadProgress(0);
      imageUrl = await uploadImage(imageFile, setUploadProgress);
      setUploadProgress(0);
    }
    const id = await fbCreateItem({ ...formData, image: imageUrl });
    await loadItems();
    await loadStats();
    return id;
  };

  const removeItem = async (id) => {
    await fbDeleteItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    await loadStats();
  };

  const submitClaim = async (itemId, claimData) => {
    await fbSubmitClaim(itemId, claimData);
  };

  const getClaims = async (itemId) => fetchClaims(itemId);

  const doReviewClaim = async (itemId, claimId, action) => {
    await fbReviewClaim(itemId, claimId, action);
    await loadPending();
    await loadStats();
    if (action === "approved") {
      setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, status:"resolved" } : i));
    }
  };

  return (
    <ItemsCtx.Provider value={{
      items, stats, pendingClaims, loadingItems, uploadProgress,
      loadItems, loadStats, loadPending,
      addItem, removeItem, submitClaim, getClaims, reviewClaim: doReviewClaim,
    }}>
      {children}
    </ItemsCtx.Provider>
  );
}

export const useItems = () => useContext(ItemsCtx);