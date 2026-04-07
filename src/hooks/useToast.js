import { useState, useCallback } from "react";

export function useToast() {
  const [toast, setToast] = useState(null);
  const showToast = useCallback((msg, type = "success", duration = 3200) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), duration);
  }, []);
  return { toast, showToast };
}