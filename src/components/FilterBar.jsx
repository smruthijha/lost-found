const CATS = ["All","Electronics","Accessories","Documents","Clothing","Books","Keys","Bags","Other"];

export function FilterBar({ filter, onChange }) {
  // ✅ FIX: onChange is called with a new object — no internal state = no focus loss
  return (
    <div className="card" style={{ padding:"16px 20px", marginBottom:24, display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
      <input
        style={{ flex:"1 1 220px", maxWidth:360 }}
        placeholder="Search by title or description…"
        value={filter.search}
        onChange={(e) => onChange({ ...filter, search: e.target.value })}
      />
      <div style={{ display:"flex", gap:6 }}>
        {[
          { val:"all",   label:"All" },
          { val:"found", label:"Found" },
          { val:"lost",  label:"Lost" },
        ].map(({ val, label }) => (
          <button key={val} className={`btn btn-sm ${filter.type === val ? "btn-primary" : "btn-ghost"}`}
            onClick={() => onChange({ ...filter, type: val })}>
            {label}
          </button>
        ))}
      </div>
      <select style={{ flex:"0 0 auto", width:"auto" }}
        value={filter.category}
        onChange={(e) => onChange({ ...filter, category: e.target.value })}>
        {CATS.map((c) => <option key={c}>{c}</option>)}
      </select>
    </div>
  );
}
