export function StatsBar({ stats }) {
  const tiles = [
    { label:"Total Posts",  val:stats.total,    color:"#2563eb", bg:"#eff6ff", border:"#bfdbfe",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/></svg> },
    { label:"Found Items",  val:stats.found,    color:"#16a34a", bg:"#dcfce7", border:"#86efac",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
    { label:"Lost Items",   val:stats.lost,     color:"#d97706", bg:"#fef3c7", border:"#fcd34d",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
    { label:"Reunited",     val:stats.resolved, color:"#7c3aed", bg:"#f5f3ff", border:"#c4b5fd",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  ];
  return (
    <div style={{ display:"flex", gap:14, flexWrap:"wrap", marginBottom:28 }}>
      {tiles.map((s) => (
        <div key={s.label} style={{ flex:"1 1 160px", background:s.bg, borderRadius:16, padding:"20px 22px", border:`1.5px solid ${s.border}` }}>
          <div style={{ width:40, height:40, borderRadius:10, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12, boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }}>
            {s.icon}
          </div>
          <div style={{ fontSize:34, fontWeight:900, color:s.color, lineHeight:1 }}>{s.val}</div>
          <div style={{ fontSize:13, color:s.color, fontWeight:600, opacity:0.75, marginTop:4 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}
