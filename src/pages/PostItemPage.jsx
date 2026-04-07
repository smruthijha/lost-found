import { useState as useStateP } from "react";
import { useNavigate as useNavP, Link as LinkP } from "react-router-dom";
import { useItems  as useItemsP } from "../context/ItemsContext";
import { useAuth   as useAuthP  } from "../context/AuthContext";
import { ImageUpload } from "../components/ImageUpload";

const CATS = ["Electronics","Accessories","Documents","Clothing","Books","Keys","Bags","Other"];

export function PostItemPage({ onToast }) {
  const { addItem, uploadProgress, uploadError } = useItemsP();
  const { user } = useAuthP();
  const navigate = useNavP();

  // ✅ All form fields in ONE state object — never causes focus loss
  const [form, setForm] = useStateP({
    type:"found", title:"", category:"Electronics", description:"", location:"", date:"",
  });
  const [imageData, setImageData] = useStateP(null);
  const [errors,    setErrors]    = useStateP({});
  const [loading,   setLoading]   = useStateP(false);

  // ✅ Single stable handler — won't unmount/remount inputs
  const handleChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

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
    } catch (err) { onToast(err.message || "Failed to post item.", "error"); }
    finally { setLoading(false); }
  };

  if (!user) return (
    <main className="page--narrow" style={{ paddingTop:60, textAlign:"center" }}>
      <div style={{ width:80, height:80, borderRadius:24, background:"var(--primary-bg)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <h2 style={{ fontWeight:800, marginBottom:10 }}>Login Required</h2>
      <p style={{ color:"var(--text-sub)", marginBottom:28 }}>You must be logged in to post a lost or found item.</p>
      <LinkP to="/login" className="btn btn-primary btn-lg">Login to Continue</LinkP>
    </main>
  );

  const inputStyle = (key) => ({ borderColor: errors[key] ? "var(--danger)" : undefined });

  return (
    <main className="page--narrow">
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom:20, display:"flex", alignItems:"center", gap:6 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back
      </button>

      <div className="card" style={{ padding:"36px 36px" }}>
        <h2 style={{ fontWeight:900, fontSize:24, letterSpacing:"-0.3px", marginBottom:28 }}>Post an Item</h2>

        {/* Type toggle */}
        <div style={{ display:"flex", gap:10, marginBottom:28 }}>
          {[
            { val:"found", label:"I Found Something", color:"var(--success)", bg:"var(--success-bg)", border:"var(--success-border)" },
            { val:"lost",  label:"I Lost Something",  color:"var(--warning)", bg:"var(--warning-bg)", border:"var(--warning-border)" },
          ].map(({ val, label, color, bg, border }) => (
            <button key={val} type="button" onClick={() => setForm((p) => ({ ...p, type:val }))} style={{
              flex:1, padding:16, borderRadius:12, border:`2px solid ${form.type === val ? color : "var(--border)"}`,
              background: form.type === val ? bg : "#fff", fontWeight:700, fontSize:15, transition:"all 0.15s", color: form.type === val ? color : "var(--text-sub)",
            }}>{label}</button>
          ))}
        </div>

        {/* Photo upload */}
        <div className="form-group">
          <label>Photo {form.type === "found" ? "(strongly recommended)" : "(optional)"}</label>
          <ImageUpload value={imageData} onChange={setImageData} progress={uploadProgress} error={uploadError} />
        </div>

        {/* Title */}
        <div className="form-group">
          <label>Item Title *</label>
          <input
            type="text"
            placeholder="e.g. Blue Nalgene Water Bottle"
            value={form.title}
            onChange={handleChange("title")}   // ✅ stable reference
            style={inputStyle("title")}
          />
          {errors.title && <span className="form-error">{errors.title}</span>}
        </div>

        <div style={{ display:"flex", gap:14 }}>
          <div className="form-group" style={{ flex:1 }}>
            <label>Category *</label>
            <select value={form.category} onChange={handleChange("category")}>
              {CATS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex:1 }}>
            <label>Date *</label>
            <input type="date" value={form.date} onChange={handleChange("date")} style={inputStyle("date")} />
            {errors.date && <span className="form-error">{errors.date}</span>}
          </div>
        </div>

        <div className="form-group">
          <label>Location *</label>
          <input type="text" placeholder="e.g. Library, Block-A Room 204, Cafeteria" value={form.location} onChange={handleChange("location")} style={inputStyle("location")} />
          {errors.location && <span className="form-error">{errors.location}</span>}
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea rows={4} placeholder="Colour, brand, serial number, unique marks, any distinguishing features…" value={form.description} onChange={handleChange("description")} style={inputStyle("description")} />
          {errors.description && <span className="form-error">{errors.description}</span>}
        </div>

        <hr className="divider" />
        <p className="section-label">Your Contact Info</p>
        <div className="info-box info-box-info" style={{ marginBottom:20, display:"flex", alignItems:"flex-start", gap:10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" style={{ flexShrink:0, marginTop:1 }}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span>Your contact details are <strong>hidden from everyone</strong> until the admin approves a claim on your item.</span>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px,1fr))", gap:14 }}>
          {[{ k:"name", label:"Name" }, { k:"email", label:"Email" }, { k:"phone", label:"Phone" }].map(({ k, label }) => (
            <div className="form-group" key={k}>
              <label>{label}</label>
              <input value={user[k] || ""} readOnly style={{ background:"var(--gray-50)", color:"var(--text-sub)" }} />
            </div>
          ))}
        </div>

        <button className="btn btn-primary btn-full btn-lg" style={{ marginTop:8 }} onClick={handleSubmit} disabled={loading}>
          {loading ? <><span className="spinner spinner-sm" /> {uploadProgress > 0 ? `Uploading ${uploadProgress}%…` : "Posting…"}</> : "Post Item"}
        </button>
      </div>
    </main>
  );
}