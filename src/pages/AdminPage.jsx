import { useEffect as useEffAdmin, useState as useStatAdmin } from "react";
import { useNavigate as useNavAdmin } from "react-router-dom";
import { useItems as useItemsAdmin } from "../context/ItemsContext";
import { useAuth  as useAuthAdmin  } from "../context/AuthContext";

export function AdminPage({ onToast }) {
  const { items, pendingClaims, stats, loadItems, loadPending, loadStats, reviewClaim, removeItem } = useItemsAdmin();
  const { isAdmin } = useAuthAdmin();
  const navigate    = useNavAdmin();
  const [tab,       setTab]       = useStatAdmin("pending");
  const [actioning, setActioning] = useStatAdmin(null);

  useEffAdmin(() => {
    if (!isAdmin) { navigate("/login"); return; }
    loadPending(); loadItems({ limit:50 }); loadStats();
  }, [isAdmin]);

  const handleReview = async (itemId, claimId, action) => {
    setActioning(claimId);
    try {
      await reviewClaim(itemId, claimId, action);
      onToast(action === "approved" ? "Claim approved! Contact info is now visible to claimer." : "Claim rejected.");
    } catch (err) { onToast(err.message, "error"); }
    finally { setActioning(null); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item permanently?")) return;
    try { await removeItem(id); onToast("Item deleted."); }
    catch (err) { onToast(err.message, "error"); }
  };

  const fmtDate = (d) => { try { return new Date(d?.seconds ? d.seconds*1000 : d).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}); } catch { return "—"; } };

  if (!isAdmin) return null;

  return (
    <main className="page">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28, flexWrap:"wrap", gap:14 }}>
        <div>
          <h2 style={{ fontWeight:900, fontSize:26, letterSpacing:"-0.3px" }}>Admin Dashboard</h2>
          <p style={{ color:"var(--text-muted)", marginTop:4 }}>Manage items and verify ownership claims</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          {[
            { val:pendingClaims.length, label:"Pending", color:"var(--warning)", bg:"var(--warning-bg)", border:"var(--warning-border)" },
            { val:items.length,         label:"Items",   color:"var(--primary)", bg:"var(--primary-bg)", border:"var(--primary-border)" },
          ].map(({ val, label, color, bg, border }) => (
            <div key={label} style={{ background:bg, border:`1px solid ${border}`, borderRadius:10, padding:"10px 18px", fontWeight:700, color, display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:22, fontWeight:900 }}>{val}</span>
              <span style={{ fontSize:13, opacity:0.8 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:0, marginBottom:24, borderBottom:"2px solid var(--border)" }}>
        {[
          { key:"pending", label:`Pending Claims (${pendingClaims.length})` },
          { key:"items",   label:`All Items (${items.length})` },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding:"12px 22px", border:"none", background:"transparent",
            fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit",
            color: tab === t.key ? "var(--primary)" : "var(--text-muted)",
            borderBottom: `3px solid ${tab === t.key ? "var(--primary)" : "transparent"}`,
            marginBottom:-2, transition:"all 0.15s",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Pending claims */}
      {tab === "pending" && (
        pendingClaims.length === 0
          ? <div style={{ textAlign:"center", padding:"72px 0", color:"var(--text-muted)" }}>
              <div style={{ width:72, height:72, borderRadius:22, background:"var(--gray-100)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h3 style={{ fontWeight:700 }}>All caught up!</h3>
              <p style={{ marginTop:8 }}>No pending claims to review right now.</p>
            </div>
          : pendingClaims.map((c) => (
            <div key={c.id} className="card" style={{ padding:"22px 26px", marginBottom:14 }}>
              <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                <div style={{ width:64, height:64, borderRadius:12, overflow:"hidden", flexShrink:0, border:"1px solid var(--border)", background:"var(--gray-100)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {c.item?.image
                    ? <img src={c.item.image} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="1.5"><rect x="2" y="7" width="20" height="15" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                  }
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10 }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:15 }}>Claim on: {c.item?.title}</div>
                      <span className={`badge badge-${c.item?.type}`} style={{ marginTop:6 }}>{c.item?.type}</span>
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button className="btn btn-success btn-sm" disabled={actioning === c.id} onClick={() => handleReview(c.itemId, c.id, "approved")}>
                        {actioning === c.id ? <span className="spinner spinner-sm" /> : "Approve"}
                      </button>
                      <button className="btn btn-danger btn-sm" disabled={actioning === c.id} onClick={() => handleReview(c.itemId, c.id, "rejected")}>
                        {actioning === c.id ? <span className="spinner spinner-sm" /> : "Reject"}
                      </button>
                    </div>
                  </div>
                  <div style={{ marginTop:12, padding:"14px 16px", background:"var(--gray-50)", borderRadius:10, border:"1px solid var(--border)" }}>
                    <div style={{ fontWeight:700, marginBottom:4 }}>{c.name}</div>
                    <div style={{ fontSize:13, color:"var(--text-sub)", marginBottom:8 }}>
                      <a href={`mailto:${c.email}`} style={{ color:"var(--primary)" }}>{c.email}</a> &nbsp;|&nbsp; {c.phone}
                    </div>
                    <div style={{ fontSize:14, fontStyle:"italic", color:"var(--text-sub)" }}>"{c.description}"</div>
                  </div>
                </div>
              </div>
            </div>
          ))
      )}

      {/* All items */}
      {tab === "items" && items.map((item) => (
        <div key={item.id} className="card" style={{ padding:"16px 22px", marginBottom:12, display:"flex", gap:14, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ width:54, height:54, borderRadius:10, overflow:"hidden", flexShrink:0, border:"1px solid var(--border)", background:"var(--gray-100)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            {item.image
              ? <img src={item.image} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="1.5"><rect x="2" y="7" width="20" height="15" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
            }
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:700, fontSize:15 }}>{item.title}</div>
            <div style={{ fontSize:13, color:"var(--text-sub)", marginTop:2 }}>{item.location} &nbsp;·&nbsp; {fmtDate(item.date)}</div>
            <div style={{ display:"flex", gap:8, marginTop:6, flexWrap:"wrap" }}>
              <span className={`badge badge-${item.type}`}>{item.type}</span>
              <span className={`badge badge-${item.status}`}>{item.status}</span>
              <span className="badge badge-cat">{item.category}</span>
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/item/${item.id}`)}>View</button>
            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Delete</button>
          </div>
        </div>
      ))}
    </main>
  );
}