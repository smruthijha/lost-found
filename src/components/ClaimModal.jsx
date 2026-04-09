import { useState } from "react";

export function ClaimModal({ item, onSubmit, onClose, loading }) {
  const [form,   setForm]   = useState({ name:"", email:"", phone:"", description:"" });
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name        = "Name is required";
    if (!form.email.trim())       e.email       = "Email is required";
    if (!form.phone.trim())       e.phone       = "Phone is required";
    if (!form.description.trim()) e.description = "Please describe your claim in detail";
    setErrors(e);
    return !Object.keys(e).length;
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(4px)" }} onClick={onClose}>
      <div className="card" style={{ maxWidth:520, width:"100%", padding:32, maxHeight:"90vh", overflowY:"auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <h3 style={{ fontWeight:800, fontSize:20 }}>{item.type === "found" ? "Claim This Item" : "I Found This Item"}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="info-box info-box-info" style={{ marginBottom:22 }}>
          Your contact details will be <strong>completely hidden</strong> until an admin verifies and approves your claim.
        </div>

        {[
          { label:"Full Name", key:"name", type:"text", ph:"Your full name" },
          { label:"Email Address", key:"email", type:"email", ph:"your@college.edu" },
          { label:"Phone Number", key:"phone", type:"tel", ph:"10-digit mobile number" },
        ].map(({ label, key, type, ph }) => (
          <div className="form-group" key={key}>
            <label>{label} *</label>
            <input type={type} placeholder={ph} value={form[key]} onChange={set(key)}
              style={{ borderColor: errors[key] ? "var(--danger)" : undefined }} />
            {errors[key] && <span className="form-error">{errors[key]}</span>}
          </div>
        ))}

        <div className="form-group">
          <label>{item.type === "found" ? "Why does this belong to you? *" : "Where & when did you find it? *"}</label>
          <textarea rows={4} placeholder="Be specific — serial numbers, unique marks, circumstances…"
            value={form.description} onChange={set("description")}
            style={{ borderColor: errors.description ? "var(--danger)" : undefined }} />
          {errors.description && <span className="form-error">{errors.description}</span>}
        </div>

        <button className="btn btn-primary btn-full btn-lg" disabled={loading}
          onClick={() => { if (validate()) onSubmit(form); }}>
          {loading
            ? <><span className="spinner spinner-sm" /> Submitting…</>
            : "Submit Claim"}
        </button>
      </div>
    </div>
  );
}