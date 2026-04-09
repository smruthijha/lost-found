import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useItems } from "../context/ItemsContext";
import ItemCard from "../components/ItemCard";
import { StatsBar }  from "../components/StatsBar";
import { FilterBar } from "../components/FilterBar";

export function HomePage() {
  const { items, stats, loadingItems, loadItems, loadStats } = useItems();
  const [filter, setFilter] = useState({ type: "all", category: "All", search: "" });

  // ✅ Load once on mount — both are stable useCallback refs with no deps
  useEffect(() => {
    loadStats();
    loadItems();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // All filtering is client-side — type, category, and text search
  const displayed = items.filter((i) => {
    const matchType     = filter.type === "all" || i.type === filter.type;
    const matchCategory = filter.category === "All" || i.category === filter.category;
    const matchSearch   = !filter.search.trim() ||
      i.title?.toLowerCase().includes(filter.search.toLowerCase()) ||
      i.description?.toLowerCase().includes(filter.search.toLowerCase()) ||
      i.location?.toLowerCase().includes(filter.search.toLowerCase());
    return matchType && matchCategory && matchSearch;
  });

  // Smooth scroll to the items grid
  const scrollToItems = (e) => {
    e.preventDefault();
    const el = document.getElementById("items-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="page">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #7c3aed 100%)",
        borderRadius: 24, padding: "52px 44px", color: "#fff",
        marginBottom: 32,
        display: "flex", justifyContent: "space-between",
        alignItems: "center", flexWrap: "wrap", gap: 28,
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -60,  right: 120, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", bottom: -80, right: -40, width: 340, height: 340, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 540 }}>
          {/* Pill badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.15)", borderRadius: 999,
            padding: "6px 16px", fontSize: 13, fontWeight: 600, marginBottom: 18,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            For Campus Use
          </div>

          <h1 style={{ fontSize: 38, fontWeight: 900, lineHeight: 1.15, marginBottom: 14, letterSpacing: "-0.5px" }}>
            Lost Something?<br />Found Something?
          </h1>
          <p style={{ opacity: 0.88, fontSize: 16, lineHeight: 1.65, marginBottom: 28, maxWidth: 420 }}>
            Post it here. We'll help reunite it with its owner — contact info stays hidden until admin verifies the claim.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/post" className="btn btn-white btn-lg" style={{ fontWeight: 800, color: "#1e3a8a" }}>
              + Post an Item
            </Link>
            {/* ✅ Fixed: use onClick scroll instead of href="#" anchor */}
            <button
              onClick={scrollToItems}
              className="btn btn-lg"
              style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.35)", fontFamily: "inherit" }}
            >
              Browse Items ↓
            </button>
          </div>
        </div>

        {/* Right icon box */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ width: 160, height: 160, borderRadius: 32, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <StatsBar stats={stats} />

      {/* ── Items section ────────────────────────────────────────────── */}
      {/* ✅ id here is what scrollIntoView targets */}
      <div id="items-section" style={{ scrollMarginTop: 80 }}>
        <FilterBar filter={filter} onChange={setFilter} />
      </div>

      {/* ── Skeleton loading ─────────────────────────────────────────── */}
      {loadingItems ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px,1fr))", gap: 18 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ borderRadius: 20, overflow: "hidden", background: "#fff", border: "1px solid var(--border)" }}>
              <div className="skeleton" style={{ height: 190 }} />
              <div style={{ padding: 18 }}>
                <div className="skeleton" style={{ height: 18, width: "65%", marginBottom: 10 }} />
                <div className="skeleton" style={{ height: 13, marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 13, width: "80%" }} />
              </div>
            </div>
          ))}
        </div>

      ) : displayed.length === 0 ? (
        /* ── Empty state ── */
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>
          <div style={{
            width: 80, height: 80, borderRadius: 24,
            background: "var(--gray-100)", display: "flex",
            alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No items found</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: 20 }}>
            {filter.search
              ? `No results for "${filter.search}". Try different keywords.`
              : "Try adjusting your filters or be the first to post an item!"}
          </p>
          <Link to="/post" className="btn btn-primary">Post an Item</Link>
        </div>

      ) : (
        /* ── Items grid ── */
        <>
          {/* Result count */}
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16, fontWeight: 500 }}>
            Showing <strong style={{ color: "var(--text)" }}>{displayed.length}</strong> item{displayed.length !== 1 ? "s" : ""}
            {filter.search && <> for "<strong style={{ color: "var(--primary)" }}>{filter.search}</strong>"</>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px,1fr))", gap: 18 }}>
            {displayed.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}