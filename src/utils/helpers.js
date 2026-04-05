/**
 * Truncate a string to maxLen characters, adding ellipsis if needed.
 */
export const truncate = (str, maxLen = 80) =>
  str.length > maxLen ? str.slice(0, maxLen) + "…" : str;

/**
 * Format a date string (YYYY-MM-DD) to a human-readable form.
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

/**
 * Generate a simple unique ID (timestamp-based).
 */
export const genId = () => Date.now();

/**
 * Check whether a user has an approved claim on a specific item.
 */
export const getApprovedClaim = (item, userEmail) => {
  if (!userEmail) return null;
  return item.claims.find(
    (c) => c.claimedBy.email === userEmail && c.status === "approved"
  ) || null;
};

/**
 * Check whether a user has already submitted any claim on an item.
 */
export const hasUserClaimed = (item, userEmail) => {
  if (!userEmail) return false;
  return item.claims.some((c) => c.claimedBy.email === userEmail);
};