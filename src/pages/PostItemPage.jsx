import { useState as useStateP } from "react";
import { useNavigate as useNavP } from "react-router-dom";
import { useItems as useItemsP } from "../context/ItemsContext";
import { CATEGORIES, ITEM_EMOJIS } from "../utils/constants";

export function PostItemPage({ onShowToast }) {
  const { addItem } = useItemsP();
  const navigate = useNavP();

  const [form, setFormP] = useState2({
    type: "found", title: "", category: "Electronics",
    description: "", location: "", date: "", image: "📦",
  });
  const [errors, setErrorsP] = useState2({});
  const [poster, setPoster] = useState2({ name: "", email: "", phone: "" });

  function useState2(init) { return useStateP(init); }

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = "Required";
    if (!form.location.trim())    e.location    = "Required";
    if (!form.date)               e.date        = "Required";
    if (!form.description.trim()) e.description = "Required";
    if (!poster.name.trim())      e.pname       = "Required";
    if (!poster.email.trim())     e.pemail      = "Required";
    if (!poster.phone.trim())     e.pphone      = "Required";
    setErrorsP(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) { onShowToast("Please fill all required fields.", "error"); return; }
    addItem(form, poster);
    onShowToast("Item posted successfully! It's now live.");
    navigate("/");
  };

  const F = ({ label, name, type = "text", placeholder, rows, isPost = true }) => {
    const obj = isPost ? poster : form;
    const setObj = isPost ? setPoster : setFormP;
    const errKey = isPost ? "p" + name : name;
    return (
      <div className="form-group">
        <label>{label} <span style={{ color: "var(--danger)" }}>*</span></label>
        {rows ? (
          <textarea rows={rows} placeholder={placeholder} value={obj[name]}
            onChange={(e) => setObj((p) => ({ ...p, [name]: e.target.value }))}
            style={{ borderColor: errors[errKey] ? "var(--danger)" : undefined }} />
        ) : (
          <input type={type} placeholder={placeholder} value={obj[name]}
            onChange={(e) => setObj((p) => ({ ...p, [name]: e.target.value }))}
            style={{ borderColor: errors[errKey] ? "var(--danger)" : undefined }} />
        )}
        {errors[errKey] && <span style={{ color: "var(--danger)", fontSize: 12 }}>{errors[errKey]}</span>}
      </div>
    );
  };

  return (
    <main className="page-wrapper" style={{ maxWidth: 640 }}>
      <button className="btn btn--ghost btn--sm" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        ← Back
      </button>

      <div className="card" style={{ padding: "32px 32px" }}>
        <h2 style={{ fontWeight: 800, marginBottom: 24 }}>📝 Post an Item</h2>

        {/* Type toggle */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          {["found", "lost"].map((t) => (
            <button key={t} onClick={() => setFormP((p) => ({ ...p, type: t }))} style={{
              flex: 1, padding: 14, borderRadius: 10, border: "2px solid",
              borderColor: form.type === t ? (t === "found" ? "var(--success)" : "var(--warning)") : "var(--border)",
              background: form.type === t ? (t === "found" ? "var(--success-bg)" : "var(--warning-bg)") : "#fff",
              fontWeight: 700, fontSize: 15,
            }}>
              {t === "found" ? "✅ I Found Something" : "❓ I Lost Something"}
            </button>
          ))}
        </div>

        {/* Emoji picker */}
        <div className="form-group">
          <label>Choose Icon</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ITEM_EMOJIS.map((e) => (
              <span key={e} onClick={() => setFormP((p) => ({ ...p, image: e }))} style={{
                fontSize: 26, cursor: "pointer", padding: 6, borderRadius: 8,
                border: "2px solid",
                borderColor: form.image === e ? "var(--primary-light)" : "transparent",
                background: form.image === e ? "var(--primary-bg)" : "transparent",
              }}>{e}</span>
            ))}
          </div>
        </div>

        <F label="Item Title"   name="title"    isPost={false} placeholder="e.g. Blue Water Bottle" />

        <div style={{ display: "flex", gap: 14 }}>
          <div style={{ flex: 1 }} className="form-group">
            <label>Category <span style={{ color: "var(--danger)" }}>*</span></label>
            <select value={form.category} onChange={(e) => setFormP((p) => ({ ...p, category: e.target.value }))}>
              {CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }} className="form-group">
            <label>Date <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="date" value={form.date}
              onChange={(e) => setFormP((p) => ({ ...p, date: e.target.value }))}
              style={{ borderColor: errors.date ? "var(--danger)" : undefined }} />
          </div>
        </div>

        <F label="Location"    name="location"    isPost={false} placeholder="e.g. Library, Block-A Room 204" />
        <F label="Description" name="description" isPost={false} placeholder="Colour, brand, unique marks…" rows={4} />

        <hr style={{ border: "none", borderTop: "1.5px solid var(--border)", margin: "20px 0" }} />
        <h4 style={{ marginBottom: 16, color: "var(--text-sub)" }}>Your Contact Info (hidden until admin verifies)</h4>

        <F label="Full Name" name="name"  placeholder="Your full name" />
        <F label="Email"     name="email" type="email" placeholder="your@college.edu" />
        <F label="Phone"     name="phone" type="tel"   placeholder="10-digit phone" />

        <button className="btn btn--primary btn--full" style={{ marginTop: 8 }} onClick={handleSubmit}>
          Post Item →
        </button>
      </div>
    </main>
  );
}
