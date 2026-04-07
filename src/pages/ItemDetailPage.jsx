import { useEffect as useEffD, useState as useStatD } from "react";
import { useParams, useNavigate as useNavD } from "react-router-dom";
import { useItems as useItemsD } from "../context/ItemsContext";
import { useAuth  as useAuthD  } from "../context/AuthContext";
import { fetchItem } from "../firebase/items";
import { ClaimModal } from "../components/ClaimModal";

export function ItemDetailPage({ onToast }) {
  const { id } = useParams();
  const { submitClaim, getClaims } = useItemsD();
  const { isAdmin } = useAuthD();
  const navigate    = useNavD();

  const [item,        setItem]        = useStatD(null);
  const [claims,      setClaims]      = useStatD([]);
  const [showClaim,   setShowClaim]   = useStatD(false);
  const [claimLoading,setCL]          = useStatD(false);
  const [loading,     setLoading]     = useStatD(true);

  const fmtDate = (d) => {
    try { return new Date(d?.seconds ? d.seconds*1000 : d).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}); }
    catch { return "—"; }
  };

  useEffD(() => {
    setLoading(true);
    fetchItem(id)
      .then((i) => { setItem(i); if (isAdmin) getClaims(id).then(setClaims); })
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [id, isAdmin]);

  const handleClaim = async (form) => {
    setCL(true);
    try { await submitClaim(id, form); setShowClaim(false); onToast("Claim submitted! Awaiting admin verification."); }
    catch (err) { onToast(err.message, "error"); }
    finally { setCL(false); }
  };

  if (loading) return <main className="page--narrow" style={{ paddingTop:100, textAlign:"center" }}><div className="spinner" /></main>;
  if (!item)   return (
    <main className="page--narrow" style={{ paddingTop:80, textAlign:"center" }}>
      <h2>Item not found</h2>
      <button className="btn btn-ghost" style={{ marginTop:20 }} onClick={() => navigate("/")}>Back to Home</button>
    </main>
  );

  return (
    <main className="page--narrow">
      {showClaim && <ClaimModal item={item} onSubmit={handleClaim} onClose={() => setShowClaim(false)} loading={claimLoading} />}
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom:20, display:"flex", alignItems:"center", gap:6 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back
      </button>

      <div className="card" style={{ overflow:"hidden" }}>
        {/* Hero image */}
        <div style={{ position:"relative", height:300 }}>
          {item.image
            ? <img src={item.image} alt={item.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            : <div style={{ height:"100%", background: item.type==="found" ? "linear-gradient(135deg,#dcfce7,#86efac)" : "linear-gradient(135deg,#fef9c3,#fde047)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1"><rect x="2" y="7" width="20" height="15" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
              </div>
          }
          <div style={{ position:"absolute", top:16, left:16, display:"flex", gap:8 }}>
            <span className={`badge badge-${item.type}`}>{item.type}</span>
            <span className={`badge badge-${item.status}`}>{item.status}</span>
          </div>
        </div>

        <div style={{ padding:"28px 32px" }}>
          <h2 style={{ fontWeight:900, fontSize:28, letterSpacing:"-0.4px", marginBottom:12 }}>{item.title}</h2>
          <p style={{ color:"var(--text-sub)", lineHeight:1.75, fontSize:15, marginBottom:28 }}>{item.description}</p>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:28 }}>
            {[
              { icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, label:"Location", val:item.location },
              { icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, label:"Date", val:fmtDate(item.date) },
              { icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>, label:"Category", val:item.category },
              { icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>, label:"Claims", val:`${claims.length} submitted` },
            ].map(({ icon, label, val }) => (
              <div key={label} style={{ background:"var(--gray-50)", borderRadius:12, padding:"14px 16px", border:"1px solid var(--border)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"var(--text-muted)", marginBottom:4 }}>{icon} {label}</div>
                <div style={{ fontWeight:700, fontSize:15 }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Poster contact */}
          <div style={{ borderRadius:14, padding:"20px 22px", marginBottom:28, background: isAdmin ? "var(--success-bg)" : "var(--gray-50)", border:`1.5px solid ${isAdmin ? "var(--success-border)" : "var(--border)"}` }}>
            <div style={{ fontWeight:700, fontSize:13, color: isAdmin ? "var(--success)" : "var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:10 }}>Posted by</div>
            <div style={{ fontWeight:700, fontSize:16 }}>{item.postedBy?.name}</div>
            {isAdmin ? (
              <div style={{ marginTop:8, fontSize:14, lineHeight:2 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-sub)" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <a href={`mailto:${item.postedBy?.email}`} style={{ color:"var(--primary)", fontWeight:600 }}>{item.postedBy?.email}</a>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-sub)" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.26h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <a href={`tel:${item.postedBy?.phone}`} style={{ color:"var(--primary)", fontWeight:600 }}>{item.postedBy?.phone}</a>
                </div>
              </div>
            ) : (
              <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:8, fontSize:13, color:"var(--text-muted)" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Contact info hidden until your claim is verified by admin
              </div>
            )}
          </div>

          {!isAdmin && item.status !== "resolved" && (
            <button className="btn btn-primary btn-full btn-lg" onClick={() => setShowClaim(true)}>
              {item.type === "found" ? "This Is Mine — Claim It" : "I Found This Item"}
            </button>
          )}
          {item.status === "resolved" && !isAdmin && (
            <div className="info-box info-box-success" style={{ textAlign:"center" }}>
              This item has been successfully reunited with its owner!
            </div>
          )}

          {isAdmin && claims.length > 0 && (
            <>
              <hr className="divider" />
              <p className="section-label">Claims ({claims.length})</p>
              {claims.map((c) => (
                <div key={c.id} style={{ borderRadius:14, padding:"16px 18px", marginBottom:12, background: c.status==="approved" ? "var(--success-bg)" : c.status==="rejected" ? "var(--danger-bg)" : "#fff", border:`1.5px solid ${c.status==="approved" ? "var(--success-border)" : c.status==="rejected" ? "var(--danger-border)" : "var(--border)"}` }}>
                  <div style={{ fontWeight:700, marginBottom:4 }}>{c.name}</div>
                  <div style={{ fontSize:13, color:"var(--text-sub)", marginBottom:8 }}>{c.email} | {c.phone}</div>
                  <div style={{ fontSize:14, background:"rgba(0,0,0,0.04)", padding:"10px 14px", borderRadius:8, marginBottom:8 }}>"{c.description}"</div>
                  <span className={`badge badge-${c.status}`}>{c.status}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </main>
  );
}