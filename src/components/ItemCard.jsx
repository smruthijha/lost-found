import { useNavigate } from "react-router-dom";

const CAT_ICONS = {
  Electronics: "#3b82f6", Accessories: "#8b5cf6", Documents: "#f59e0b",
  Clothing: "#ec4899", Books: "#10b981", Keys: "#f97316",
  Bags: "#6366f1", Other: "#9ca3af",
};

function ItemPlaceholder({ category, type }) {
  const color = CAT_ICONS[category] || "#9ca3af";
  const bg    = type === "found"
    ? "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)"
    : "linear-gradient(135deg, #fef9c3 0%, #fde68a 100%)";
  return (
    <div style={{ width:"100%", height:"100%", background:bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8 }}>
      <div style={{ width:56, height:56, borderRadius:16, background:"rgba(255,255,255,0.7)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.08)" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
          <rect x="2" y="7" width="20" height="15" rx="2"/>
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        </svg>
      </div>
      <span style={{ fontSize:12, fontWeight:600, color:"rgba(0,0,0,0.45)", letterSpacing:"0.3px" }}>{category}</span>
    </div>
  );
}

export default function ItemCard({ item }) {
  const navigate = useNavigate();
  const fmtDate  = (d) => {
    try { return new Date(d?.seconds ? d.seconds * 1000 : d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }); }
    catch { return "—"; }
  };

  return (
    <article
      onClick={() => navigate(`/item/${item.id}`)}
      style={{ background:"#fff", borderRadius:20, overflow:"hidden", cursor:"pointer",
        border: item.status === "resolved" ? "2px solid #22c55e" : "1px solid rgba(0,0,0,0.07)",
        boxShadow:"0 2px 14px rgba(0,0,0,0.07)", transition:"transform 0.18s, box-shadow 0.18s",
        display:"flex", flexDirection:"column" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform="translateY(-5px)"; e.currentTarget.style.boxShadow="0 14px 36px rgba(0,0,0,0.13)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 2px 14px rgba(0,0,0,0.07)"; }}
    >
      {/* Image / Placeholder */}
      <div style={{ position:"relative", height:190, overflow:"hidden", flexShrink:0 }}>
        {item.image
          ? <img src={item.image} alt={item.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          : <ItemPlaceholder category={item.category} type={item.type} />
        }
        <div style={{ position:"absolute", top:10, left:10, display:"flex", gap:6 }}>
          <span className={`badge badge-${item.type}`}>{item.type}</span>
          {item.status === "resolved" && <span className="badge badge-resolved">Resolved</span>}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding:"16px 18px", display:"flex", flexDirection:"column", gap:8, flex:1 }}>
        <h3 style={{ fontWeight:700, fontSize:16, lineHeight:1.3 }}>{item.title}</h3>
        <p style={{ fontSize:13, color:"var(--text-sub)", lineHeight:1.55, flex:1 }}>
          {item.description?.length > 90 ? item.description.slice(0,90) + "…" : item.description}
        </p>
        <div style={{ display:"flex", gap:14, fontSize:12, color:"var(--text-muted)" }}>
          <span style={{ display:"flex", alignItems:"center", gap:4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {item.location}
          </span>
          <span style={{ display:"flex", alignItems:"center", gap:4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {fmtDate(item.date)}
          </span>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:12, borderTop:"1px solid var(--border)" }}>
          <span className="badge badge-cat">{item.category}</span>
          <span style={{ fontSize:12, color:"var(--text-muted)", display:"flex", alignItems:"center", gap:4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            {item.claimCount || 0} claim{item.claimCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </article>
  );
}