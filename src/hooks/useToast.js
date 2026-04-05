import { useState, useCallback } from "react";

/**
 * useToast — lightweight toast notification hook.
 * Returns { toast, showToast }
 *
 * toast  → { msg: string, type: "success" | "error" } | null
 * showToast(msg, type?, duration?) → void
 */
export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "success", duration = 3000) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), duration);
  }, []);

  return { toast, showToast };
}