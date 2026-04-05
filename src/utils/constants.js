// ─── Admin Credentials (use .env in production) ───────────────────────────────
export const ADMIN_EMAIL    = process.env.REACT_APP_ADMIN_EMAIL    || "admin@college.edu";
export const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || "admin123";

// ─── Item Categories ──────────────────────────────────────────────────────────
export const CATEGORIES = [
  "All", "Electronics", "Accessories", "Documents",
  "Clothing", "Books", "Keys", "Bags", "Other",
];

// ─── Item Emoji Icons ─────────────────────────────────────────────────────────
export const ITEM_EMOJIS = [
  "📦","🎒","📱","💻","🔑","👓","🎧",
  "📚","🧢","👜","🪪","🔢","🍶","⌚","✏️",
];

// ─── Seed / Demo Data ─────────────────────────────────────────────────────────
export const SEED_ITEMS = [
  {
    id: 1,
    type: "found",
    title: "Blue Water Bottle",
    category: "Accessories",
    description: "Found near the library entrance — blue Nalgene bottle with travel stickers on it.",
    location: "Library Entrance",
    date: "2026-04-01",
    image: "🍶",
    postedBy: { name: "Anonymous Student", email: "s1@college.edu", phone: "98765-43210" },
    claims: [],
    status: "open",
  },
  {
    id: 2,
    type: "lost",
    title: "Casio Scientific Calculator",
    category: "Electronics",
    description: "Lost my Casio fx-991ES Plus. Has my name engraved on the back panel.",
    location: "Room 204 — Engineering Block",
    date: "2026-04-02",
    image: "🔢",
    postedBy: { name: "Anonymous Student", email: "s2@college.edu", phone: "91234-56789" },
    claims: [],
    status: "open",
  },
  {
    id: 3,
    type: "found",
    title: "Student ID Card",
    category: "Documents",
    description: "Found an ID card for Roll No 2023CS045 near the cafeteria counter.",
    location: "Main Cafeteria",
    date: "2026-04-03",
    image: "🪪",
    postedBy: { name: "Anonymous Student", email: "s3@college.edu", phone: "99887-76655" },
    claims: [],
    status: "open",
  },
];