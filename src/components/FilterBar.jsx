import { CATEGORIES } from "../utils/constants";

export function FilterBar({ filter, onChange }) {
  return (
    <div style={{
      background: "var(--bg-card)",
      borderRadius: "var(--radius-md)",
      padding: "16px 20px",
      boxShadow: "var(--shadow-sm)",
      display: "flex",
      gap: 12,
      flexWrap: "wrap",
      alignItems: "center",
    }}>
      {/* Search */}
      <input
        style={{ flex: "1 1 200px", maxWidth: 320 }}
        placeholder="🔍  Search items…"
        value={filter.search}
        onChange={(e) => onChange({ ...filter, search: e.target.value })}
      />

      {/* Type toggle */}
      <div style={{ display: "flex", gap: 6 }}>
        {["all", "found", "lost"].map((t) => (
          <button
            key={t}
            className={`btn btn--sm ${filter.type === t ? "btn--primary" : "btn--ghost"}`}
            onClick={() => onChange({ ...filter, type: t })}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Category */}
      <select
        style={{ flex: "0 0 auto", width: "auto" }}
        value={filter.category}
        onChange={(e) => onChange({ ...filter, category: e.target.value })}
      >
        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
      </select>
    </div>
  );
}