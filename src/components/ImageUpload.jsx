import { useRef, useState } from "react";

/**
 * ImageUpload component
 *
 * Props:
 *   value      — { file: File, preview: string } | null
 *   onChange   — (value | null) => void
 *   progress   — number 0–100 (upload progress from parent)
 *   error      — string | null (upload error message)
 */
export function ImageUpload({ value, onChange, progress = 0, error = null }) {
  const inputRef  = useRef();
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file) => {
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      alert("Only JPG, PNG, WebP or GIF images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5 MB.");
      return;
    }

    onChange({ file, preview: URL.createObjectURL(file) });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const isUploading = progress > 0 && progress < 100;

  return (
    <div>
      {/* ── Preview state ── */}
      {value?.preview ? (
        <div style={{
          position: "relative",
          borderRadius: 14,
          overflow: "hidden",
          border: `2px solid ${error ? "var(--danger)" : "var(--border)"}`,
          background: "#000",
        }}>
          <img
            src={value.preview}
            alt="Preview"
            style={{ width:"100%", height:220, objectFit:"cover", display:"block", opacity: isUploading ? 0.6 : 1, transition:"opacity 0.3s" }}
          />

          {/* Upload progress overlay */}
          {isUploading && (
            <div style={{
              position:"absolute", bottom:0, left:0, right:0,
              padding:"12px 16px",
              background:"linear-gradient(transparent, rgba(0,0,0,0.75))",
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <span style={{ color:"#fff", fontSize:13, fontWeight:600 }}>Uploading to Cloudinary…</span>
                <span style={{ color:"#4ade80", fontSize:13, fontWeight:700 }}>{progress}%</span>
              </div>
              <div style={{ background:"rgba(255,255,255,0.25)", borderRadius:99, height:5 }}>
                <div style={{
                  height:"100%", borderRadius:99,
                  background:"linear-gradient(90deg,#4ade80,#22c55e)",
                  width:`${progress}%`,
                  transition:"width 0.25s ease",
                }} />
              </div>
            </div>
          )}

          {/* Upload success badge */}
          {progress === 100 && (
            <div style={{
              position:"absolute", top:10, left:10,
              background:"rgba(22,163,74,0.9)",
              color:"#fff", borderRadius:99, padding:"4px 12px",
              fontSize:12, fontWeight:700,
              display:"flex", alignItems:"center", gap:5,
              backdropFilter:"blur(4px)",
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              Uploaded
            </div>
          )}

          {/* Remove button */}
          {!isUploading && (
            <button
              type="button"
              onClick={() => onChange(null)}
              style={{
                position:"absolute", top:10, right:10,
                background:"rgba(0,0,0,0.65)",
                color:"#fff", border:"none", borderRadius:8,
                padding:"6px 12px", fontWeight:600, fontSize:13,
                display:"flex", alignItems:"center", gap:5,
                cursor:"pointer", backdropFilter:"blur(4px)",
                transition:"background 0.15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background="rgba(220,38,38,0.85)"}
              onMouseLeave={(e) => e.currentTarget.style.background="rgba(0,0,0,0.65)"}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              Remove
            </button>
          )}
        </div>

      ) : (
        /* ── Drop zone state ── */
        <div
          onClick={() => inputRef.current.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          style={{
            border: `2px dashed ${dragOver ? "var(--primary)" : error ? "var(--danger)" : "var(--border)"}`,
            borderRadius: 14,
            padding: "48px 24px",
            textAlign: "center",
            cursor: "pointer",
            background: dragOver ? "var(--primary-bg)" : "var(--gray-50)",
            transition: "all 0.2s",
          }}
        >
          {/* Icon */}
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: dragOver ? "var(--primary)" : "#fff",
            display:"flex", alignItems:"center", justifyContent:"center",
            margin:"0 auto 16px",
            boxShadow:"var(--shadow-sm)",
            transition:"all 0.2s",
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
              stroke={dragOver ? "#fff" : "var(--primary)"} strokeWidth="1.8">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>

          <div style={{ fontWeight:700, fontSize:16, marginBottom:6, color: dragOver ? "var(--primary)" : "var(--text)" }}>
            {dragOver ? "Drop it here!" : "Upload a Photo"}
          </div>
          <div style={{ color:"var(--text-muted)", fontSize:13, lineHeight:1.7 }}>
            Drag &amp; drop or{" "}
            <span style={{ color:"var(--primary)", fontWeight:600, textDecoration:"underline" }}>browse files</span>
            <br/>
            JPG, PNG, WebP — max 5 MB
          </div>

          {/* Cloudinary badge */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:5, marginTop:14, background:"#fff", borderRadius:99, padding:"4px 12px", border:"1px solid var(--border)", fontSize:11, color:"var(--text-muted)", fontWeight:600 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            Stored on Cloudinary (free)
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:8, color:"var(--danger)", fontSize:13, fontWeight:500 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display:"none" }}
        onChange={(e) => handleFile(e.target.files[0])}
        // Reset so same file can be re-selected after removal
        onClick={(e) => { e.target.value = null; }}
      />
    </div>
  );
}