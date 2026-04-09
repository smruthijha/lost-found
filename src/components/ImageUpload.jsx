import { useRef } from "react";

export function ImageUpload({ value, onChange, progress }) {
  const ref = useRef();

  const handleFile = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Max file size is 5 MB."); return; }
    onChange({ file, preview: URL.createObjectURL(file) });
  };

  const handleDrop = (e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); };

  return (
    <div>
      {value?.preview ? (
        <div style={{ position:"relative", borderRadius:14, overflow:"hidden", border:"2px solid var(--border)" }}>
          <img src={value.preview} alt="Preview" style={{ width:"100%", height:220, objectFit:"cover", display:"block" }} />
          {progress > 0 && progress < 100 && (
            <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"10px 14px", background:"rgba(0,0,0,0.6)" }}>
              <div style={{ background:"rgba(255,255,255,0.25)", borderRadius:99, height:6 }}>
                <div style={{ height:"100%", borderRadius:99, background:"#4ade80", width:`${progress}%`, transition:"width 0.3s" }} />
              </div>
              <div style={{ color:"#fff", fontSize:12, marginTop:5, fontWeight:600 }}>Uploading {progress}%…</div>
            </div>
          )}
          <button type="button" onClick={() => onChange(null)} style={{ position:"absolute", top:10, right:10, background:"rgba(0,0,0,0.65)", color:"#fff", border:"none", borderRadius:8, padding:"6px 12px", fontWeight:600, fontSize:13, display:"flex", alignItems:"center", gap:6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            Remove
          </button>
        </div>
      ) : (
        <div
          onClick={() => ref.current.click()} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
          style={{ border:"2px dashed var(--border)", borderRadius:14, padding:"48px 24px", textAlign:"center", cursor:"pointer", background:"var(--gray-50)", transition:"all 0.2s" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor="var(--primary)"; e.currentTarget.style.background="var(--primary-bg)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.background="var(--gray-50)"; }}
        >
          <div style={{ width:52, height:52, borderRadius:14, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", boxShadow:"var(--shadow-sm)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
          <div style={{ fontWeight:700, fontSize:16, marginBottom:6, color:"var(--text)" }}>Upload a Photo</div>
          <div style={{ color:"var(--text-muted)", fontSize:13, lineHeight:1.6 }}>Drag &amp; drop here or <span style={{ color:"var(--primary)", fontWeight:600 }}>click to browse</span><br/>JPG, PNG, WebP — max 5 MB</div>
        </div>
      )}
      <input ref={ref} type="file" accept="image/*" style={{ display:"none" }} onChange={(e) => handleFile(e.target.files[0])} />
    </div>
  );
}