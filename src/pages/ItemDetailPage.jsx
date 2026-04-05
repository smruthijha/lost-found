import { useParams, useNavigate as useNavD } from "react-router-dom";
import { useState as useStateD } from "react";
import { useItems as useItemsD } from "../context/ItemsContext";
import { useAuth as useAuthD }   from "../context/AuthContext";
import { ClaimModal }            from "../components/ClaimModal";
import { formatDate }            from "../utils/helpers";

export function ItemDetailPage({ onShowToast }) {
  const { id } = useParams();
  const { items, submitClaim } = useItemsD();
  const { isAdmin } = useAuthD();
  const navigate = useNavD();
  const [showClaim, setShowClaim] = useStateD(false);

  const item = items.find((i) => i.id === Number(id));
  if (!item) return (
    <main className="page-wrapper text-center" style={{ paddingTop: 80 }}>
      <div style={{ fontSize: 64 }}>🚫</div>
      <h2 style={{ marginTop: 12 }}>Item not found</h2>
      <button className="btn btn--ghost" style={{ marginTop: 16 }} onClick={() => navigate("/")}>← Home</button>
    </main>
  );

  const handleClaim = (claimerInfo, description) => {
    submitClaim(item.id, claimerInfo, description);
    setShowClaim(false);
    onShowToast("Claim submitted! Awaiting admin verification.");
  };

  const InfoRow = ({ label, val }) => (
    <div style={{ background: "#f9fafb", borderRadius: 10, padding: "12px 14px" }}>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{val}</div>
    </div>
  );

  return (
    <main className="page-wrapper" style={{ maxWidth: 700 }}>
      {showClaim && <ClaimModal item={item} onSubmit={handleClaim} onClose={() => setShowClaim(false)} />}

      <button className="btn btn--ghost btn--sm" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>← Back</button>

      <div className="card" style={{ overflow: "hidden" }}>
        {/* Banner */}
        <div style={{
          background: item.type === "found"
            ? "linear-gradient(135deg, #d1fae5, #6ee7b7)"
            : "linear-gradient(135deg, #fef3c7, #fcd34d)",
          padding: "44px 20px",
          textAlign: "center",
          fontSize: 90,
        }}>{item.image}</div>

        <div style={{ padding: "28px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
            <h2 style={{ fontWeight: 800, fontSize: 26 }}>{item.title}</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <span className={`badge badge--${item.type}`}>{item.type}</span>
              <span className={`badge badge--${item.status}`}>{item.status}</span>
            </div>
          </div>

          <p style={{ color: "var(--text-sub)", lineHeight: 1.7, marginBottom: 24 }}>{item.description}</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
            <InfoRow label="📍 Location" val={item.location} />
            <InfoRow label="📅 Date"     val={formatDate(item.date)} />
            <InfoRow label="🏷️ Category" val={item.category} />
            <InfoRow label="📊 Claims"   val={`${item.claims.length} submitted`} />
          </div>

          {/* Contact box — hidden for public, always shown to admin */}
          <div style={{
            background: isAdmin ? "var(--success-bg)" : "var(--primary-bg)",
            borderRadius: 12, padding: "18px 20px", marginBottom: 24,
          }}>
            <div style={{ fontWeight: 700, marginBottom: 8, color: isAdmin ? "#065f46" : "var(--primary)" }}>
              👤 Posted by
            </div>
            <div style={{ fontWeight: 600 }}>{item.postedBy.name}</div>
            {isAdmin ? (
              <div style={{ marginTop: 6, fontSize: 14 }}>
                <div>📧 {item.postedBy.email}</div>
                <div>📞 {item.postedBy.phone}</div>
              </div>
            ) : (
              <div style={{ marginTop: 6, color: "var(--text-muted)", fontSize: 13 }}>
                🔒 Contact info is hidden. Submit a claim to be verified by the admin.
              </div>
            )}
          </div>

          {/* Claim button — only for non-admin, open items */}
          {!isAdmin && item.status !== "resolved" && (
            <button className="btn btn--primary btn--full" onClick={() => setShowClaim(true)}>
              {item.type === "found" ? "🙋 Claim This Item" : "✅ I Found This"}
            </button>
          )}

          {/* Admin: claims list */}
          {isAdmin && item.claims.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <h4 style={{ color: "var(--primary)", marginBottom: 12 }}>📋 Claims ({item.claims.length})</h4>
              {item.claims.map((c) => (
                <div key={c.id} style={{
                  background: c.status === "approved" ? "var(--success-bg)" : c.status === "rejected" ? "var(--danger-bg)" : "#f9fafb",
                  borderRadius: 12, padding: "14px 16px", marginBottom: 10,
                }}>
                  <div style={{ fontWeight: 700 }}>{c.claimedBy.name}</div>
                  <div style={{ fontSize: 13, color: "var(--text-sub)", margin: "4px 0" }}>
                    📧 {c.claimedBy.email} | 📞 {c.claimedBy.phone}
                  </div>
                  <div style={{ fontSize: 14, marginBottom: 10 }}>{c.description}</div>
                  <span className={`badge badge--${c.status}`}>{c.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
