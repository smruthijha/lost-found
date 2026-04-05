import { useState as useStateA } from "react";
import { useNavigate as useNavA } from "react-router-dom";
import { useItems as useItemsA } from "../context/ItemsContext";
import { useAuth as useAuthA }   from "../context/AuthContext";
import { formatDate as fmtA }    from "../utils/helpers";

export function AdminLoginPage({ onShowToast }) {
  const { adminLogin } = useAuthA();
  const navigate = useNavA();
  const [form, setF] = useStateA({ email: "", password: "" });
  const [err, setE]  = useStateA("");

  const handleLogin = () => {
    const res = adminLogin(form.email, form.password);
    if (res.success) { onShowToast("Welcome, Admin!"); navigate("/admin"); }
    else setE(res.error);
  };

  return (
    <main className="page-wrapper flex-center" style={{ minHeight: "calc(100vh - 64px)" }}>
      <div className="card" style={{ maxWidth: 420, width: "100%", padding: "40px 36px" }}>
        <div className="text-center" style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 48 }}>⚙️</div>
          <h2 style={{ fontWeight: 800, marginTop: 8 }}>Admin Login</h2>
          <p style={{ color: "var(--text-muted)", marginTop: 4 }}>Restricted access — staff only</p>
        </div>

        <div className="form-group">
          <label>Admin Email</label>
          <input type="email" placeholder="admin@college.edu"
            value={form.email} onChange={(e) => setF((p) => ({ ...p, email: e.target.value }))} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder="••••••••"
            value={form.password} onChange={(e) => setF((p) => ({ ...p, password: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
        </div>

        {err && <div className="info-box info-box--warning" style={{ marginBottom: 14 }}>{err}</div>}

        <div className="info-box info-box--info" style={{ marginBottom: 18, fontSize: 13 }}>
          Demo — <strong>admin@college.edu</strong> / <strong>admin123</strong>
        </div>

        <button className="btn btn--primary btn--full" onClick={handleLogin}>Login →</button>
      </div>
    </main>
  );
}

export function AdminPage({ onShowToast }) {
  const { items, deleteItem, reviewClaim, pendingClaims } = useItemsA();
  const { isAdmin } = useAuthA();
  const navigate = useNavA();
  const [tab, setTab] = useStateA("pending");

  if (!isAdmin) { navigate("/admin/login"); return null; }

  const handleReview = (itemId, claimId, action) => {
    reviewClaim(itemId, claimId, action);
    onShowToast(action === "approved" ? "Claim approved! Contact info revealed to claimer." : "Claim rejected.");
  };

  const handleDelete = (itemId) => {
    if (window.confirm("Delete this item?")) { deleteItem(itemId); onShowToast("Item removed."); }
  };

  return (
    <main className="page-wrapper">
      <h2 style={{ fontWeight: 800, color: "var(--primary)", marginBottom: 20 }}>⚙️ Admin Dashboard</h2>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
        {[
          { key: "pending", label: `⏳ Pending Claims (${pendingClaims.length})` },
          { key: "items",   label: `📋 All Items (${items.length})` },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`btn btn--sm ${tab === t.key ? "btn--primary" : "btn--ghost"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Pending Claims ── */}
      {tab === "pending" && (
        <>
          {pendingClaims.length === 0 ? (
            <div className="text-center" style={{ padding: "60px 0", color: "var(--text-muted)" }}>
              <div style={{ fontSize: 56 }}>🎉</div>
              <h3 style={{ marginTop: 12 }}>No pending claims</h3>
            </div>
          ) : pendingClaims.map((c) => (
            <div key={c.id} className="card" style={{ padding: "20px 24px", marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                    Claim on: {c.item.image} {c.item.title}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-sub)", marginBottom: 6 }}>
                    <strong>{c.claimedBy.name}</strong> &nbsp;|&nbsp; 📧 {c.claimedBy.email} &nbsp;|&nbsp; 📞 {c.claimedBy.phone}
                  </div>
                  <div style={{ background: "#f9fafb", padding: "10px 14px", borderRadius: 8, fontSize: 14 }}>
                    "{c.description}"
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexShrink: 0 }}>
                  <button className="btn btn--success btn--sm" onClick={() => handleReview(c.item.id, c.id, "approved")}>✅ Approve</button>
                  <button className="btn btn--reject  btn--sm" onClick={() => handleReview(c.item.id, c.id, "rejected")}>❌ Reject</button>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* ── All Items ── */}
      {tab === "items" && items.map((item) => (
        <div key={item.id} className="card" style={{ padding: "18px 22px", marginBottom: 12, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 38 }}>{item.image}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{item.title}</div>
            <div style={{ fontSize: 13, color: "var(--text-sub)" }}>
              {item.type.toUpperCase()} &nbsp;|&nbsp; {item.location} &nbsp;|&nbsp; {fmtA(item.date)}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              By {item.postedBy.name} &nbsp;|&nbsp; {item.claims.length} claim(s) &nbsp;|&nbsp;
              <span style={{ color: item.status === "resolved" ? "var(--success)" : "var(--warning)", fontWeight: 600 }}>
                {" "}{item.status}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn--ghost btn--sm" onClick={() => navigate(`/item/${item.id}`)}>View</button>
            <button className="btn btn--danger  btn--sm" onClick={() => handleDelete(item.id)}>Delete</button>
          </div>
        </div>
      ))}
    </main>
  );
}