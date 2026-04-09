import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useItems } from "../context/ItemsContext";
import { useAuth  } from "../context/AuthContext";

const STATUS_META = {
  open:           { label: "Open",           bg: "#fef3c7", color: "#b45309", border: "#fcd34d" },
  claim_approved: { label: "Claim Approved", bg: "#dcfce7", color: "#16a34a", border: "#86efac" },
  resolved:       { label: "Resolved",       bg: "#dbeafe", color: "#1d4ed8", border: "#93c5fd" },
};

export function AdminPage({ onToast }) {
  const {
    items         = [],   // ✅ default to [] so .length never crashes
    stats         = {},
    pendingClaims = [],   // ✅ default to []
    loadAllItems,
    loadPending,
    loadStats,
    reviewClaim,
    removeItem,
  } = useItems();

  const { isAdmin } = useAuth();
  const navigate    = useNavigate();

  const [tab,       setTab]       = useState("pending");
  const [actioning, setActioning] = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!isAdmin) { navigate("/login"); return; }
    const init = async () => {
      setLoading(true);
      try {
        await Promise.all([loadAllItems(), loadPending(), loadStats()]);
      } catch (e) {
        console.error("Admin init error:", e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [isAdmin]); // eslint-disable-line

  const handleReview = async (itemId, claimId, action) => {
    setActioning(claimId);
    try {
      await reviewClaim(itemId, claimId, action);
      onToast(
        action === "approved"
          ? "Claim approved! Both parties can now see each other's contact info."
          : "Claim rejected."
      );
    } catch (err) {
      onToast(err.message || "Something went wrong.", "error");
    } finally {
      setActioning(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item permanently?")) return;
    try {
      await removeItem(id);
      onToast("Item deleted.");
    } catch (err) {
      onToast(err.message || "Delete failed.", "error");
    }
  };

  const fmtDate = (d) => {
    try {
      return new Date(d?.seconds ? d.seconds * 1000 : d)
        .toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch { return "—"; }
  };

  if (!isAdmin) return null;

  // ── Safe derived values ─────────────────────────────────────────────────
  const safeItems    = Array.isArray(items)         ? items         : [];
  const safePending  = Array.isArray(pendingClaims) ? pendingClaims : [];

  const chips = [
    { val: safePending.length,       label: "Pending",        color: "#d97706", bg: "#fef3c7", border: "#fcd34d" },
    { val: stats.claim_approved ?? 0, label: "Claim Approved", color: "#16a34a", bg: "#dcfce7", border: "#86efac" },
    { val: stats.resolved       ?? 0, label: "Resolved",       color: "#1d4ed8", bg: "#dbeafe", border: "#93c5fd" },
    { val: safeItems.length,          label: "Total Items",    color: "#7c3aed", bg: "#f5f3ff", border: "#c4b5fd" },
  ];

  return (
    <main className="page">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
        <div>
          <h2 style={{ fontWeight: 900, fontSize: 26, letterSpacing: "-0.3px" }}>Admin Dashboard</h2>
          <p style={{ color: "var(--text-muted)", marginTop: 4 }}>Manage items and verify ownership claims</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {chips.map(({ val, label, color, bg, border }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 22, fontWeight: 900, color }}>{val}</span>
              <span style={{ fontSize: 12, color, fontWeight: 700, opacity: 0.85 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "2px solid var(--border)", marginBottom: 24 }}>
        {[
          { key: "pending", label: `Pending Claims (${safePending.length})` },
          { key: "items",   label: `All Items (${safeItems.length})` },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "12px 22px", border: "none", background: "transparent",
            fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
            color: tab === t.key ? "var(--primary)" : "var(--text-muted)",
            borderBottom: `3px solid ${tab === t.key ? "var(--primary)" : "transparent"}`,
            marginBottom: -2, transition: "all 0.15s",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Loading */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div className="spinner" />
          <p style={{ color: "var(--text-muted)", marginTop: 16 }}>Loading data…</p>
        </div>
      ) : (
        <>
          {/* ── Pending Claims Tab ── */}
          {tab === "pending" && (
            safePending.length === 0 ? (
              <div style={{ textAlign: "center", padding: "72px 0", color: "var(--text-muted)" }}>
                <div style={{ width: 72, height: 72, borderRadius: 22, background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="1.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <h3 style={{ fontWeight: 700 }}>All caught up!</h3>
                <p style={{ marginTop: 8 }}>No pending claims to review.</p>
              </div>
            ) : (
              safePending.map((c) => (
                <div key={c.id} className="card" style={{ padding: "22px 26px", marginBottom: 14 }}>
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                    {/* Item thumbnail */}
                    <div style={{ width: 64, height: 64, borderRadius: 12, overflow: "hidden", flexShrink: 0, border: "1px solid var(--border)", background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {c.item?.image
                        ? <img src={c.item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="1.5"><rect x="2" y="7" width="20" height="15" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                      }
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                            Claim on: <span style={{ color: "var(--primary)" }}>{c.item?.title || "Unknown Item"}</span>
                          </div>
                          <span className={`badge badge-${c.item?.type || "found"}`}>{c.item?.type || "—"}</span>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            className="btn btn-success btn-sm"
                            disabled={actioning === c.id}
                            onClick={() => handleReview(c.itemId, c.id, "approved")}
                          >
                            {actioning === c.id ? <span className="spinner spinner-sm" /> : "✓ Approve"}
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            disabled={actioning === c.id}
                            onClick={() => handleReview(c.itemId, c.id, "rejected")}
                          >
                            {actioning === c.id ? <span className="spinner spinner-sm" /> : "✕ Reject"}
                          </button>
                        </div>
                      </div>

                      <div style={{ marginTop: 12, padding: "14px 16px", background: "var(--gray-50)", borderRadius: 10, border: "1px solid var(--border)" }}>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>{c.name || "—"}</div>
                        <div style={{ fontSize: 13, color: "var(--text-sub)", marginBottom: 8, lineHeight: 1.8 }}>
                          <div>📧 {c.email || "—"}</div>
                          <div>📞 {c.phone || "—"}</div>
                        </div>
                        <div style={{ fontSize: 14, fontStyle: "italic", color: "var(--text-sub)", lineHeight: 1.6 }}>
                          "{c.description || "No description provided."}"
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )
          )}

          {/* ── All Items Tab ── */}
          {tab === "items" && (
            safeItems.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
                <p>No items found.</p>
              </div>
            ) : (
              safeItems.map((item) => {
                const st = STATUS_META[item.status] || STATUS_META.open;
                return (
                  <div key={item.id} className="card" style={{ padding: "16px 22px", marginBottom: 12, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                    {/* Thumbnail */}
                    <div style={{ width: 54, height: 54, borderRadius: 10, overflow: "hidden", flexShrink: 0, border: "1px solid var(--border)", background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {item.image
                        ? <img src={item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="1.5"><rect x="2" y="7" width="20" height="15" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                      }
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{item.title || "Untitled"}</div>
                      <div style={{ fontSize: 13, color: "var(--text-sub)", marginTop: 2 }}>
                        {item.location || "—"} &nbsp;·&nbsp; {fmtDate(item.date)}
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
                        <span className={`badge badge-${item.type || "found"}`}>{item.type || "—"}</span>
                        <span style={{
                          padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                          background: st.bg, color: st.color, border: `1px solid ${st.border}`,
                          textTransform: "uppercase", letterSpacing: "0.5px",
                        }}>{st.label}</span>
                        <span className="badge badge-cat">{item.category || "—"}</span>
                        {item.status === "resolved" && (
                          <span style={{ fontSize: 12, color: "var(--success)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            Owner confirmed
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                        Posted by: <strong>{item.postedBy?.name || "Unknown"}</strong>
                        &nbsp;·&nbsp; {item.postedBy?.email || "—"}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/item/${item.id}`)}>View</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Delete</button>
                    </div>
                  </div>
                );
              })
            )
          )}
        </>
      )}
    </main>
  );
}