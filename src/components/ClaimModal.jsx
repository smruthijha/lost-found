import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ClaimModal({ item, onSubmit, onClose, loading }) {
  const { user } = useAuth();

  // Only description is entered manually — name/email/phone come from logged-in user
  const [description, setDescription] = useState("");
  const [error,        setError]       = useState("");

  const handleSubmit = () => {
    if (!description.trim()) {
      setError("Please describe where/how you found it.");
      return;
    }
    setError("");
    // Pass logged-in user's info + their description
    onSubmit({
      name:        user.name,
      email:       user.email,
      phone:       user.phone,
      description: description.trim(),
    });
  };

  // ── Not logged in ──────────────────────────────────────────────────────
  if (!user) {
    return (
      <div style={overlayStyle} onClick={onClose}>
        <div className="card" style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <div style={{ textAlign: "center", padding: "12px 0 24px" }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: "var(--primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 10 }}>Login Required</h3>
            <p style={{ color: "var(--text-sub)", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
              You need to be logged in to submit a claim.<br />
              Your account details will be used to contact you.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Link to="/login"    className="btn btn-primary"  onClick={onClose}>Login</Link>
              <Link to="/register" className="btn btn-ghost"    onClick={onClose}>Register</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Logged in ──────────────────────────────────────────────────────────
  const isFound = item.type === "lost"; // someone is claiming they FOUND a lost item
  const isOwner = item.type === "found"; // someone is claiming a found item belongs to them

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div className="card" style={modalStyle} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div>
            <h3 style={{ fontWeight: 800, fontSize: 20 }}>
              {isFound ? "I Found This Item" : "This Item is Mine"}
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
              {isFound
                ? "Tell us where and when you found it"
                : "Tell us why this item belongs to you"}
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}
            style={{ flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Info box */}
        <div className="info-box info-box-info" style={{ marginBottom: 22, fontSize: 13 }}>
          <strong>Your contact info is hidden</strong> until an admin verifies and approves your claim.
          Only then will it be shared with the item poster.
        </div>

        {/* Auto-filled user info (read-only) */}
        <div style={{ background: "var(--gray-50)", borderRadius: 12, padding: "14px 16px", marginBottom: 20, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 12 }}>
            Your details (from your account)
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Name",  val: user.name  },
              { label: "Phone", val: user.phone },
              { label: "Email", val: user.email, full: true },
            ].map(({ label, val, full }) => (
              <div key={label} style={{ gridColumn: full ? "1 / -1" : undefined }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 3 }}>{label}</div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{val || "—"}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
            Update these in your profile settings if incorrect
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label>
            {isFound
              ? "Where and when did you find it? *"
              : "Why does this item belong to you? *"}
          </label>
          <textarea
            rows={4}
            placeholder={
              isFound
                ? "e.g. Found near the library entrance on 7th April around 2pm. It was left on a bench..."
                : "e.g. This is my calculator. It has my name engraved on the back. I lost it in Room 204..."
            }
            value={description}
            onChange={(e) => { setDescription(e.target.value); setError(""); }}
            style={{ borderColor: error ? "var(--danger)" : undefined }}
          />
          {error && <span className="form-error">{error}</span>}
        </div>

        <button
          className="btn btn-primary btn-full btn-lg"
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading
            ? <><span className="spinner spinner-sm" /> Submitting…</>
            : "Submit Claim"
          }
        </button>
      </div>
    </div>
  );
}

// ── Shared styles ──────────────────────────────────────────────────────────
const overlayStyle = {
  position: "fixed", inset: 0,
  background: "rgba(0,0,0,0.55)",
  zIndex: 500,
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: 20,
  backdropFilter: "blur(4px)",
};

const modalStyle = {
  maxWidth: 520, width: "100%",
  padding: 28,
  maxHeight: "90vh", overflowY: "auto",
};