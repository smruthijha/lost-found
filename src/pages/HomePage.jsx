import { useState } from "react";
import { Link } from "react-router-dom";
import { useItems } from "../context/ItemsContext";
import ItemCard from "../components/ItemCard";
import { FilterBar } from "../components/FilterBar";
import { StatsBar }  from "../components/StatsBar";

export function HomePage() {
  const { items, stats } = useItems();
  const [filter, setFilter] = useState({ type: "all", category: "All", search: "" });

  const filtered = items.filter((i) => {
    const matchType = filter.type === "all" || i.type === filter.type;
    const matchCat  = filter.category === "All" || i.category === filter.category;
    const matchQ    = i.title.toLowerCase().includes(filter.search.toLowerCase()) ||
                      i.description.toLowerCase().includes(filter.search.toLowerCase());
    return matchType && matchCat && matchQ;
  });

  return (
    <main className="page-wrapper">
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #1e40af, #6366f1)",
        borderRadius: "var(--radius-lg)",
        padding: "44px 36px",
        color: "#fff",
        marginBottom: 28,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 24,
      }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 10 }}>
            Lost Something? Found Something?
          </h1>
          <p style={{ opacity: 0.9, fontSize: 16, marginBottom: 22 }}>
            Post it here and we'll help reunite it with its rightful owner.
          </p>
          <Link to="/post" className="btn" style={{ background:"#fff", color:"#1e40af", fontWeight:800, fontSize:15, padding:"12px 28px", borderRadius:10 }}>
            + Post an Item
          </Link>
        </div>
        <span style={{ fontSize: 90, lineHeight: 1 }}>🎒</span>
      </div>

      <StatsBar stats={stats} />

      <div style={{ marginTop: 22, marginBottom: 20 }}>
        <FilterBar filter={filter} onChange={setFilter} />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center" style={{ padding: "60px 0", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 64 }}>🔍</div>
          <h3 style={{ marginTop: 12 }}>No items match your search</h3>
          <p>Try different filters or post the item yourself.</p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
          gap: 18,
        }}>
          {filtered.map((item) => <ItemCard key={item.id} item={item} />)}
        </div>
      )}
    </main>
  );
}