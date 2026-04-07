mport { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// SVG icon helpers
const Icon = ({ d, size = 18, color = "currentColor", fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const SearchIcon  = () => <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />;
const HomeIcon    = () => <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />;
const PlusIcon    = () => <Icon d="M12 5v14M5 12h14" />;
const SettingsIcon= () => <Icon d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />;
const LogoutIcon  = () => <Icon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" />;
const UserIcon    = () => <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />;

export function Navbar({ onToast }) {
  const { user, isAdmin, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); onToast("Logged out successfully."); navigate("/"); };
  const isActive = (p) => pathname === p;

  const linkStyle = (p) => ({
    display: "flex", alignItems: "center", gap: 7,
    color: isActive(p) ? "#fff" : "rgba(255,255,255,0.75)",
    fontWeight: isActive(p) ? 700 : 500,
    fontSize: 14, padding: "8px 14px", borderRadius: 9,
    background: isActive(p) ? "rgba(255,255,255,0.18)" : "transparent",
    transition: "all 0.15s", textDecoration: "none",
  });

  return (
    <header style={{ position:"sticky", top:0, zIndex:300, background:"linear-gradient(135deg, #1e3a8a 0%, #2563eb 65%, #3b82f6 100%)", boxShadow:"0 2px 24px rgba(30,58,138,0.45)" }}>
      <nav style={{ maxWidth:1120, margin:"0 auto", padding:"0 24px", height:66, display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
        {/* Brand */}
        <Link to="/" style={{ display:"flex", alignItems:"center", gap:12, color:"#fff", textDecoration:"none", flexShrink:0 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <SearchIcon />
          </div>
          <div>
            <div style={{ fontWeight:900, fontSize:17, letterSpacing:"-0.3px", lineHeight:1.1 }}>Campus Lost &amp; Found</div>
            <div style={{ fontSize:11, opacity:0.65, marginTop:1 }}>Reuniting belongings since 2026</div>
          </div>
        </Link>

        {/* Nav links */}
        <div style={{ display:"flex", gap:4, alignItems:"center" }}>
          <Link to="/"     style={linkStyle("/")}><HomeIcon />     <span className="hide-sm">Home</span></Link>
          <Link to="/post" style={linkStyle("/post")}><PlusIcon /> <span>Post Item</span></Link>
          {isAdmin && <Link to="/admin" style={linkStyle("/admin")}><SettingsIcon /><span className="hide-sm">Dashboard</span></Link>}
        </div>

        {/* Auth */}
        <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
          {user ? (
            <>
              <div style={{ background:"rgba(255,255,255,0.15)", borderRadius:9, padding:"7px 13px", fontSize:13, fontWeight:600, color:"#fff", display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:26, height:26, borderRadius:"50%", background:"rgba(255,255,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <UserIcon />
                </div>
                <span className="hide-sm">{user.name}</span>
                {isAdmin && <span className="badge badge-admin" style={{ fontSize:10 }}>Admin</span>}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ color:"rgba(255,255,255,0.85)", borderColor:"rgba(255,255,255,0.3)", display:"flex", alignItems:"center", gap:6 }}>
                <LogoutIcon /> <span className="hide-sm">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn btn-ghost btn-sm" style={{ color:"rgba(255,255,255,0.85)", borderColor:"rgba(255,255,255,0.3)" }}>Login</Link>
              <Link to="/register" className="btn btn-white btn-sm" style={{ fontWeight:700 }}>Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}