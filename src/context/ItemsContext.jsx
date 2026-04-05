import { createContext, useContext, useState } from "react";
import { SEED_ITEMS } from "../utils/constants";
import { genId } from "../utils/helpers";

const ItemsContext = createContext(null);

export function ItemsProvider({ children }) {
  const [items, setItems] = useState(SEED_ITEMS);

  /** Add a new Lost / Found posting */
  const addItem = (formData, posterInfo) => {
    const newItem = {
      id: genId(),
      ...formData,
      postedBy: posterInfo,
      claims: [],
      status: "open",
    };
    setItems((prev) => [newItem, ...prev]);
    return newItem;
  };

  /** Delete an item (admin only) */
  const deleteItem = (itemId) =>
    setItems((prev) => prev.filter((i) => i.id !== itemId));

  /** Submit a claim on an item */
  const submitClaim = (itemId, claimerInfo, description) => {
    const claim = {
      id: genId(),
      claimedBy: claimerInfo,
      description,
      status: "pending",
      date: new Date().toISOString().split("T")[0],
    };
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, claims: [...i.claims, claim] } : i
      )
    );
  };

  /** Admin: approve or reject a claim */
  const reviewClaim = (itemId, claimId, action) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const updatedClaims = item.claims.map((c) =>
          c.id === claimId ? { ...c, status: action } : c
        );
        return {
          ...item,
          claims: updatedClaims,
          status: action === "approved" ? "resolved" : item.status,
        };
      })
    );
  };

  // ─── Derived helpers ────────────────────────────────────────────
  const pendingClaims = items.flatMap((item) =>
    item.claims
      .filter((c) => c.status === "pending")
      .map((c) => ({ ...c, item }))
  );

  const stats = {
    total: items.length,
    found: items.filter((i) => i.type === "found").length,
    lost: items.filter((i) => i.type === "lost").length,
    resolved: items.filter((i) => i.status === "resolved").length,
  };

  return (
    <ItemsContext.Provider
      value={{ items, addItem, deleteItem, submitClaim, reviewClaim, pendingClaims, stats }}
    >
      {children}
    </ItemsContext.Provider>
  );
}

export const useItems = () => useContext(ItemsContext);