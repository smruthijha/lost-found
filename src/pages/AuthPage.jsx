import { useState as useStateA } from "react";
import { useNavigate as useNavA, Link as LinkA } from "react-router-dom";
import { useAuth as useAuthA } from "../context/AuthContext";

export function AuthPage({ mode = "login", onToast }) {
  const { login, register } = useAuthA();
  const navigate = useNavA();
  const isLogin  = mode === "login";

  const [form,    setForm]    = useStateA({ name:"", email:"", phone:"", password:"" });
  const [loading, setLoading] = useStateA(false);
  const [error,   setError]   = useStateA("");

  const handleChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      if (isLogin) {
        const u = await login(form.email, form.password);
        onToast(`Welcome back, ${u.name}!`);
        navigate(u.role === "admin" ? "/admin" : "/");
      } else {
        if (!form.name.trim() || !form.phone.trim()) { setError("All fields are required."); setLoading(false); return; }
        const u = await register(form);
        onToast(`Welcome, ${u.name}!`);
        navigate("/");
      }
    } catch (err) { setError(err.message || "Something went wrong."); }
    finally { setLoading(false); }
  };

  return (
    <main style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"calc(100vh - 66px)", padding:20 }}>
      <div style={{ width:"100%", maxWidth:440 }}>
        <div className="card" style={{ padding:"40px 36px" }}>
          <div style={{ textAlign:"center", marginBottom:32 }}>
            <div style={{ width:64, height:64, borderRadius:20, background:"var(--primary-bg)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8">
                {isLogin
                  ? <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>
                  : <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>
                }
              </svg>
            </div>
            <h2 style={{ fontWeight:900, fontSize:26, letterSpacing:"-0.3px" }}>{isLogin ? "Welcome back" : "Create account"}</h2>
            <p style={{ color:"var(--text-muted)", marginTop:6, fontSize:14 }}>{isLogin ? "Sign in to your account" : "Join Campus Lost & Found"}</p>
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Full Name *</label>
              <input placeholder="Your full name" value={form.name} onChange={handleChange("name")} />
            </div>
          )}

          <div className="form-group">
            <label>Email Address *</label>
            <input type="email" placeholder="your@college.edu" value={form.email} onChange={handleChange("email")} />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Phone Number *</label>
              <input type="tel" placeholder="10-digit mobile number" value={form.phone} onChange={handleChange("phone")} />
            </div>
          )}

          <div className="form-group">
            <label>Password *</label>
            <input type="password" placeholder={isLogin ? "Your password" : "Minimum 6 characters"} value={form.password}
              onChange={handleChange("password")} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
          </div>

          {error && <div className="info-box info-box-danger" style={{ marginBottom:18 }}>{error}</div>}

          <button className="btn btn-primary btn-full btn-lg" onClick={handleSubmit} disabled={loading}>
            {loading ? <><span className="spinner spinner-sm" /> Please wait…</> : isLogin ? "Sign In" : "Create Account"}
          </button>

          <p style={{ textAlign:"center", marginTop:22, fontSize:14, color:"var(--text-sub)" }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <LinkA to={isLogin ? "/register" : "/login"} style={{ color:"var(--primary)", fontWeight:700 }}>
              {isLogin ? "Register" : "Sign In"}
            </LinkA>
          </p>
        </div>
      </div>
    </main>
  );
}
