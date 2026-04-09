import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useItems } from "../context/ItemsContext";
import { useAuth  } from "../context/AuthContext";
import { ImageUpload } from "../components/ImageUpload";

const CATS = ["Electronics","Accessories","Documents","Clothing","Books","Keys","Bags","Other"];

export function PostItemPage({ onToast }) {
  const { addItem, uploadProgress, uploadError } = useItems();
  const { user }    = useAuth();
  const navigate    = useNavigate();

  const [form, setForm] = useState({
    type: "found", title: "", category: "Electronics",
    description: "", location: "", date: "",
  });
  const [imageData, setImageData] = useState(null); // { file, preview }
  const [errors,    setErrors]    = useState({});
  const [loading,   setLoading]   = useState(false);

  // Single stable handler — prevents input focus loss
  const handle = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = "Required";
    if (!form.location.trim())    e.location    = "Required";
    if (!form.date)               e.date        = "Required";
    if (!form.description.trim()) e.description = "Required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    if (!validate()) { onToast("Please fill all required fields.", "error"); return; }
    setLoading(true);
    try {
      await addItem(
        { ...form, postedBy: { name: user.name, email: user.email, phone: user.phone } },
        imageData?.file || null
      );
      onToast("Item posted successfully!");
      navigate("/");
    } catch (err) {
      onToast(err.message || "Failed to post item.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Not logged in ──────────────────────────────────────────────────────
  if (!user) return (
    <main className="page--narrow" style={{ paddingTop: 60, textAlign: "center" }}>
      <div style={{ width: 80, height: 80, borderRadius: 24, background: "var(--primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5">
          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <h2 style={{ fontWeight: 800, marginBottom: 10 }}>Login Required</h2>
      <p style={{ color: "var(--text-sub)", marginBottom: 28 }}>
        You must be logged in to post a lost or found item.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <Link to="/login"    className="btn btn-primary btn-lg">Login</Link>
        <Link to="/register" className="btn btn-ghost  btn-lg">Register</Link>
      </div>
    </main>
  );

  const iFound = form.type === "found";
  const errBorder = (k) => ({ borderColor: errors[k] ? "var(--danger)" : undefined });

  return (
    <main className="page--narrow">
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}
        style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back
      </button>

      <div className="card" style={{ padding: "36px 36px" }}>
        <h2 style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-0.3px", marginBottom: 28 }}>
          Post an Item
        </h2>

        {/* ── Type toggle ── */}
        <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
          {[
            { val: "found", label: "I Found Something", activeColor: "var(--success)",  activeBg: "var(--success-bg)",  activeBorder: "var(--success-border)"  },
            { val: "lost",  label: "I Lost Something",  activeColor: "var(--warning)",  activeBg: "var(--warning-bg)",  activeBorder: "var(--warning-border)"  },
          ].map(({ val, label, activeColor, activeBg, activeBorder }) => (
            <button key={val} type="button"
              onClick={() => setForm((p) => ({ ...p, type: val }))}
              style={{
                flex: 1, padding: 16, borderRadius: 12, border: "2px solid",
                borderColor:  form.type === val ? activeColor  : "var(--border)",
                background:   form.type === val ? activeBg     : "#fff",
                color:        form.type === val ? activeColor  : "var(--text-sub)",
                fontWeight: 700, fontSize: 15, fontFamily: "inherit",
                cursor: "pointer", transition: "all 0.15s",
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Photo upload ──
            FOUND item: recommended (shows green tip)
            LOST item:  optional (shows neutral tip)
        ── */}
        <div className="form-group">
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            Photo
            {iFound
              ? <span style={{ background: "var(--success-bg)", color: "var(--success)", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 99, border: "1px solid var(--success-border)" }}>Recommended</span>
              : <span style={{ background: "var(--gray-100)", color: "var(--text-muted)", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 99 }}>Optional</span>
            }
          </label>
          {iFound && (
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>
              A photo helps the real owner identify their item — strongly recommended.
            </p>
          )}
          <ImageUpload
            value={imageData}
            onChange={setImageData}
            progress={uploadProgress}
            error={uploadError}
          />
        </div>

        {/* ── Title ── */}
        <div className="form-group">
          <label>Item Title *</label>
          <input
            type="text"
            placeholder="e.g. Blue Nalgene Water Bottle"
            value={form.title}
            onChange={handle("title")}
            style={errBorder("title")}
          />
          {errors.title && <span className="form-error">{errors.title}</span>}
        </div>

        {/* ── Category + Date ── */}
        <div style={{ display: "flex", gap: 14 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Category *</label>
            <select value={form.category} onChange={handle("category")}>
              {CATS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Date *</label>
            <input
              type="date"
              value={form.date}
              onChange={handle("date")}
              style={errBorder("date")}
            />
            {errors.date && <span className="form-error">{errors.date}</span>}
          </div>
        </div>

        {/* ── Location ── */}
        <div className="form-group">
          <label>Location *</label>
          <input
            type="text"
            placeholder="e.g. Library entrance, Block-A Room 204, Cafeteria"
            value={form.location}
            onChange={handle("location")}
            style={errBorder("location")}
          />
          {errors.location && <span className="form-error">{errors.location}</span>}
        </div>

        {/* ── Description ── */}
        <div className="form-group">
          <label>Description *</label>
          <textarea
            rows={4}
            placeholder={
              iFound
                ? "Describe the item in detail — colour, brand, serial number, any markings…"
                : "Describe what you lost — colour, brand, where you last had it, any unique features…"
            }
            value={form.description}
            onChange={handle("description")}
            style={errBorder("description")}
          />
          {errors.description && <span className="form-error">{errors.description}</span>}
        </div>

        {/* ── Contact info (read-only from account) ── */}
        <hr className="divider" />
        <p className="section-label">Your Contact Info</p>
        <div className="info-box info-box-info" style={{ marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span>
            Your contact details are <strong>completely hidden from the public</strong>.
            They are only revealed to the other party once admin approves a verified claim.
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 14 }}>
          {[
            { k: "name",  label: "Name"  },
            { k: "email", label: "Email" },
            { k: "phone", label: "Phone" },
          ].map(({ k, label }) => (
            <div className="form-group" key={k}>
              <label>{label}</label>
              <input
                value={user[k] || ""}
                readOnly
                style={{ background: "var(--gray-50)", color: "var(--text-sub)", cursor: "not-allowed" }}
              />
            </div>
          ))}
        </div>

        {/* ── Submit ── */}
        <button
          className="btn btn-primary btn-full btn-lg"
          style={{ marginTop: 8 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <><span className="spinner spinner-sm" />
                {uploadProgress > 0 && uploadProgress < 100
                  ? ` Uploading photo ${uploadProgress}%…`
                  : " Posting…"}
              </>
            : "Post Item"
          }
        </button>
      </div>
    </main>
  );
}