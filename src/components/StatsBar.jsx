export function StatsBar({ stats }) {
  const tiles = [
    { label: "Total Posts",   val: stats.total,    emoji: "📋", color: "#3b82f6" },
    { label: "Found Items",   val: stats.found,    emoji: "✅", color: "#22c55e" },
    { label: "Lost Items",    val: stats.lost,     emoji: "❓", color: "#f59e0b" },
    { label: "Reunited",      val: stats.resolved, emoji: "🎉", color: "#8b5cf6" },
  ];
  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
      {tiles.map((s) => (
        <div key={s.label} style={{
          flex: "1 1 160px",
          background: "var(--bg-card)",
          borderRadius: "var(--radius-md)",
          padding: "18px 20px",
          boxShadow: "var(--shadow-sm)",
          borderLeft: `4px solid ${s.color}`,
        }}>
          <div style={{ fontSize: 26 }}>{s.emoji}</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: s.color, lineHeight: 1.1, marginTop: 4 }}>{s.val}</div>
          <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}