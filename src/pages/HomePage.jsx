import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useItems } from "../context/ItemsContext";
import ItemCard from "../components/ItemCard";
import { StatsBar } from "../components/StatsBar";
import { FilterBar } from "../components/FilterBar";

export function HomePage() {
  const { items, stats, loadingItems, loadItems, loadStats } = useItems();

  // ✅ Ensure safe default
  const safeItems = items || [];

  const [filter, setFilter] = useState({
    type: "all",
    category: "All",
    search: "",
  });

  const initializeData = useCallback(async () => {
    await loadStats();
    await loadItems();
  }, [loadStats, loadItems]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  /**
   * ✅ SAFE filtering (no crash)
   */
  const displayed = safeItems.filter((i) => {
    const matchType =
      filter.type === "all" || i.type === filter.type;

    const matchCategory =
      filter.category === "All" || i.category === filter.category;

    const matchSearch =
      !filter.search.trim() ||
      i.title?.toLowerCase().includes(filter.search.toLowerCase()) ||
      i.description?.toLowerCase().includes(filter.search.toLowerCase()) ||
      i.location?.toLowerCase().includes(filter.search.toLowerCase());

    return matchType && matchCategory && matchSearch;
  });

  const scrollToItems = useCallback((e) => {
    e.preventDefault();
    const el = document.getElementById("items-section");
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, []);

  return (
    <main className="page">
      {/* ── Hero ── */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #7c3aed 100%)",
          borderRadius: 24,
          padding: "52px 44px",
          color: "#fff",
          marginBottom: 32,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 28,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -60,
            right: 120,
            width: 260,
            height: 260,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: -80,
            right: -40,
            width: 340,
            height: 340,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 540 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 999,
              padding: "6px 16px",
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 18,
            }}
          >
            For Campus Use
          </div>

          <h1
            style={{
              fontSize: 38,
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: 14,
            }}
          >
            Lost Something?
            <br />
            Found Something?
          </h1>

          <p style={{ opacity: 0.88, marginBottom: 28 }}>
            Post it here. We'll help reunite it with its owner.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link
              to="/post"
              className="btn btn-white btn-lg"
              style={{ fontWeight: 800, color: "#1e3a8a" }}
            >
              + Post an Item
            </Link>

            <button
              onClick={scrollToItems}
              className="btn btn-lg"
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.35)",
              }}
            >
              Browse Items ↓
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <StatsBar stats={stats} />

      {/* ── Filters ── */}
      <div id="items-section" style={{ scrollMarginTop: 80 }}>
        <FilterBar filter={filter} onChange={setFilter} />
      </div>

      {/* ── Content ── */}
      {loadingItems ? (
        <p>Loading...</p>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <h3>No items found</h3>
          <Link to="/post" className="btn btn-primary">
            Post an Item
          </Link>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 16 }}>
            Showing {displayed.length} item
            {displayed.length !== 1 ? "s" : ""}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(290px,1fr))",
              gap: 18,
            }}
          >
            {displayed.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}