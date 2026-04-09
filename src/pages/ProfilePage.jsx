import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* ── small section card ─────────────────────────────────────────────────── */
function Section({ title, children }) {
  return (
    <div className="card" style={{ padding: "28px 28px", marginBottom: 20 }}>
      <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 22, paddingBottom: 14, borderBottom: "1.5px solid var(--border)" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ── reusable field row ──────────────────────────────────────────────────── */
function Field({ label, value, onChange, type = "text", placeholder, readOnly, error }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        style={{
          background:   readOnly ? "var(--gray-50)"  : "#fff",
          color:        readOnly ? "var(--text-muted)" : "var(--text)",
          cursor:       readOnly ? "not-allowed" : "text",
          borderColor:  error ? "var(--danger)" : undefined,
        }}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

export function ProfilePage({ onToast }) {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const navigate = useNavigate();

  /* ── profile form state ─────────────────────────────────────────────── */
  const [name,      setName]      = useState(user?.name  || "");
  const [phone,     setPhone]     = useState(user?.phone || "");
  const [pErrors,   setPErrors]   = useState({});
  const [pLoading,  setPLoading]  = useState(false);

  /* ── password form state ────────────────────────────────────────────── */
  const [curPwd,    setCurPwd]    = useState("");
  const [newPwd,    setNewPwd]    = useState("");
  const [confPwd,   setConfPwd]   = useState("");
  const [pwdErrors, setPwdErrors] = useState({});
  const [pwdLoad,   setPwdLoad]   = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  /* ── validate & save profile ────────────────────────────────────────── */
  const handleSaveProfile = async () => {
    const e = {};
    if (!name.trim())           e.name  = "Name is required";
    if (!phone.trim())          e.phone = "Phone is required";
    if (phone.replace(/\D/g,"").length < 10) e.phone = "Enter a valid 10-digit phone number";
    setPErrors(e);
    if (Object.keys(e).length) return;

    setPLoading(true);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() });
      onToast("Profile updated successfully!");
    } catch (err) {
      onToast(err.message || "Failed to update profile.", "error");
    } finally {
      setPLoading(false);
    }
  };

  /* ── validate & change password ─────────────────────────────────────── */
  const handleChangePassword = async () => {
    const e = {};
    if (!curPwd)          e.curPwd  = "Enter your current password";
    if (newPwd.length < 6) e.newPwd = "New password must be at least 6 characters";
    if (newPwd !== confPwd) e.confPwd = "Passwords do not match";
    setPwdErrors(e);
    if (Object.keys(e).length) return;

    setPwdLoad(true);
    try {
      await changePassword(curPwd, newPwd);
      setCurPwd(""); setNewPwd(""); setConfPwd("");
      onToast("Password changed successfully!");
    } catch (err) {
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setPwdErrors({ curPwd: "Current password is incorrect" });
      } else {
        onToast(err.message || "Failed to change password.", "error");
      }
    } finally {
      setPwdLoad(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
    onToast("Logged out.");
  };

  return (
    <main className="page--narrow">
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}
          style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
        <h2 style={{ fontWeight: 900, fontSize: 26, letterSpacing: "-0.3px" }}>My Profile</h2>
        <p style={{ color: "var(--text-muted)", marginTop: 4 }}>Manage your account details</p>
      </div>

      {/* ── Avatar + info card ── */}
      <div className="card" style={{ padding: "24px 28px", marginBottom: 20, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ color: "#fff", fontWeight: 900, fontSize: 28 }}>
            {(user.name || "U").charAt(0).toUpperCase()}
          </span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 20 }}>{user.name}</div>
          <div style={{ color: "var(--text-sub)", fontSize: 14, marginTop: 3 }}>{user.email}</div>
          <div style={{ marginTop: 8 }}>
            <span className={`badge ${user.role === "admin" ? "badge-admin" : "badge-cat"}`}>
              {user.role === "admin" ? "Admin" : "Student"}
            </span>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}
          style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--danger)", borderColor: "var(--danger-border)" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
          Logout
        </button>
      </div>

      {/* ── Edit profile section ── */}
      <Section title="Edit Profile">
        <Field
          label="Full Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          error={pErrors.name}
        />
        <Field
          label="Email Address"
          value={user.email}
          readOnly
          placeholder="your@college.edu"
        />
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 14, display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
            </svg>
            Email cannot be changed. Contact admin if needed.
          </div>
        </div>
        <Field
          label="Phone Number *"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          type="tel"
          placeholder="10-digit mobile number"
          error={pErrors.phone}
        />
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20, background: "var(--primary-bg)", borderRadius: 8, padding: "10px 14px", border: "1px solid var(--primary-border)" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" style={{ marginRight: 6, verticalAlign: "middle" }}>
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Your name and phone are shared <strong>only with the other party</strong> after admin approves a claim.
        </div>
        <button
          className="btn btn-primary btn-full"
          onClick={handleSaveProfile}
          disabled={pLoading}
        >
          {pLoading
            ? <><span className="spinner spinner-sm" /> Saving…</>
            : "Save Changes"
          }
        </button>
      </Section>

      {/* ── Change password section ── */}
      <Section title="Change Password">
        <Field
          label="Current Password *"
          value={curPwd}
          onChange={(e) => setCurPwd(e.target.value)}
          type="password"
          placeholder="Your current password"
          error={pwdErrors.curPwd}
        />
        <Field
          label="New Password *"
          value={newPwd}
          onChange={(e) => setNewPwd(e.target.value)}
          type="password"
          placeholder="At least 6 characters"
          error={pwdErrors.newPwd}
        />
        <Field
          label="Confirm New Password *"
          value={confPwd}
          onChange={(e) => setConfPwd(e.target.value)}
          type="password"
          placeholder="Re-enter new password"
          error={pwdErrors.confPwd}
        />
        <button
          className="btn btn-primary btn-full"
          onClick={handleChangePassword}
          disabled={pwdLoad}
        >
          {pwdLoad
            ? <><span className="spinner spinner-sm" /> Changing…</>
            : "Change Password"
          }
        </button>
      </Section>
    </main>
  );
}