import { useState } from "react";

export function ClaimModal({ item, onSubmit, onClose }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", description: "" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name        = "Name is required";
    if (!form.email.trim())       e.email       = "Email is required";
    if (!form.phone.trim())       e.phone       = "Phone is required";
    if (!form.description.trim()) e.description = "Please describe your claim";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(form, form.description);
  };

  const Field = ({ label, name, type = "text", placeholder, rows }) => (
    <div className="form-group">
      <label>{label}</label>
      {rows ? (
        <textarea
          rows={rows} placeholder={placeholder}
          value={form[name]}
          onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.value }))}
          style={{ borderColor: errors[name] ? "var(--danger)" : undefined }}
        />
      ) : (
        <input
          type={type} placeholder={placeholder}
          value={form[name]}
          onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.value }))}
          style={{ borderColor: errors[name] ? "var(--danger)" : undefined }}
        />
      )}
      {errors[name] && <span style={{ color: "var(--danger)", fontSize: 12 }}>{errors[name]}</span>}
    </div>
  );

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ maxWidth: 500, width: "100%", padding: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontWeight: 800 }}>
            {item.type === "found" ? "🙋 Claim This Item" : "✅ I Found This"}
          </h3>
          <button className="btn btn--ghost btn--sm" onClick={onClose}>✕ Close</button>
        </div>

        <div className="info-box info-box--info" style={{ marginBottom: 18, fontSize: 13 }}>
          Your contact info will remain <strong>hidden</strong> until the admin verifies your claim.
        </div>

        <Field label="Full Name"  name="name"  placeholder="Your full name" />
        <Field label="Email"      name="email" type="email" placeholder="your@email.com" />
        <Field label="Phone"      name="phone" type="tel"   placeholder="10-digit number" />
        <Field
          label={item.type === "found" ? "Why does this belong to you?" : "Where & when did you find it?"}
          name="description" rows={4}
          placeholder="Provide specific details — unique marks, serial numbers, circumstances of loss…"
        />

        <button className="btn btn--primary btn--full" onClick={handleSubmit}>Submit Claim</button>
      </div>
    </div>
  );
}