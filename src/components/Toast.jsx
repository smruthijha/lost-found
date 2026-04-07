export function Toast({ toast }) {
  if (!toast) return null;
  const isErr = toast.type === "error";
  return (
    <div style={{
      position:"fixed", top:20, right:20, zIndex:9999,
      background: isErr ? "#1e1e1e" : "#1e1e1e",
      color:"#fff", padding:"14px 20px", borderRadius:var_r_md(),
      boxShadow:"0 8px 32px rgba(0,0,0,0.3)",
      fontWeight:600, fontSize:14,
      display:"flex", alignItems:"center", gap:12, maxWidth:380,
      animation:"toastIn 0.3s ease",
      borderLeft: `4px solid ${isErr ? "#f87171" : "#4ade80"}`,
    }}>
      <span style={{ width:22, height:22, borderRadius:"50%", background: isErr ? "rgba(248,113,113,0.2)" : "rgba(74,222,128,0.2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        {isErr
          ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
        }
      </span>
      {toast.msg}
    </div>
  );
}
function var_r_md() { return "14px"; }