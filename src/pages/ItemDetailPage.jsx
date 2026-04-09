import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useItems } from "../context/ItemsContext";
import { useAuth  } from "../context/AuthContext";
import { fetchItem }                       from "../firebase/items";
import { fetchClaims, fetchApprovedClaim } from "../firebase/claims";
import { ClaimModal }                      from "../components/ClaimModal";

/* ── helpers ──────────────────────────────────────────────────────────────── */
const fmtDate = (d) => {
  try {
    return new Date(d?.seconds ? d.seconds * 1000 : d)
      .toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  } catch { return "—"; }
};
const emailEq = (a, b) =>
  !!(a && b && a.trim().toLowerCase() === b.trim().toLowerCase());

/* ── tiny SVG icons ───────────────────────────────────────────────────────── */
const CallIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.26h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const MailIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const WAIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>;
const LockIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const CheckIcon = ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;

/* ── Contact card shown to BOTH approved parties ──────────────────────────── */
function ContactCard({ heading, subheading, person, itemTitle, showCollectBtn, collected, collecting, onCollect }) {
  if (!person?.email) return null;
  const digits = (person.phone || "").replace(/\D/g, "");
  const enc    = encodeURIComponent;
  const waMsg  = enc(`Hi ${person.name}! Regarding "${itemTitle}" on Campus Lost & Found — the claim has been approved. Let's arrange the handover.`);

  return (
    <div style={{ borderRadius: 16, overflow: "hidden", border: "2px solid #22c55e", boxShadow: "0 4px 24px rgba(34,197,94,0.18)", marginBottom: 24 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#16a34a,#22c55e)", padding: "18px 22px", color: "#fff", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <CheckIcon size={22} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{heading}</div>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>{subheading}</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "22px", background: "#f0fdf4" }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 5 }}>Contact Person</div>
          <div style={{ fontWeight: 800, fontSize: 22, color: "#111827" }}>{person.name}</div>
        </div>

        {/* Contact buttons */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <a href={`tel:${digits}`}
            style={btnStyle("#2563eb")}>
            <CallIcon /> Call
          </a>
          <a href={`mailto:${person.email}?subject=${enc(`Campus Lost & Found — ${itemTitle}`)}`}
            style={btnStyle("#7c3aed")}>
            <MailIcon /> Email
          </a>
          <a href={`https://wa.me/${digits}?text=${waMsg}`} target="_blank" rel="noreferrer"
            style={btnStyle("#25D366")}>
            <WAIcon /> WhatsApp
          </a>
        </div>

        {/* Readable info */}
        <div style={{ background: "#fff", borderRadius: 10, padding: "12px 16px", border: "1px solid #bbf7d0", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#374151", marginBottom: 6 }}>
            <MailIcon /> {person.email}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#374151" }}>
            <CallIcon /> {person.phone}
          </div>
        </div>

        {/* Mark collected */}
        {showCollectBtn && !collected && (
          <button disabled={collecting} onClick={onCollect}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "14px", borderRadius: 12, border: "none", cursor: collecting ? "not-allowed" : "pointer", background: "linear-gradient(135deg,#16a34a,#22c55e)", color: "#fff", fontWeight: 800, fontSize: 15, fontFamily: "inherit", opacity: collecting ? 0.7 : 1 }}>
            {collecting ? <><span className="spinner spinner-sm" /> Confirming…</> : <><CheckIcon /> I Have Collected My Item — Mark as Resolved</>}
          </button>
        )}

        {collected && (
          <div style={{ background: "#dcfce7", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10, border: "1px solid #86efac" }}>
            <CheckIcon />
            <span style={{ fontWeight: 700, color: "#15803d" }}>Item collected and marked as resolved!</span>
          </div>
        )}
      </div>
    </div>
  );
}

const btnStyle = (bg) => ({
  flex: 1, minWidth: 90, display: "flex", alignItems: "center", justifyContent: "center",
  gap: 7, padding: "11px 14px", borderRadius: 12, background: bg, color: "#fff",
  fontWeight: 700, fontSize: 14, textDecoration: "none",
});

/* ── Main Page ────────────────────────────────────────────────────────────── */
export function ItemDetailPage({ onToast }) {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { submitClaim, markCollected } = useItems();
  const { user, isAdmin } = useAuth();

  const [item,         setItem]         = useState(null);
  const [approvedClaim,setApproved]     = useState(null);
  const [adminClaims,  setAdminClaims]  = useState([]);
  const [showModal,    setShowModal]    = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [collecting,   setCollecting]   = useState(false);
  const [pageLoading,  setPageLoading]  = useState(true);

  /* ─── Fetch item + approved claim every time page loads ───────────────
     Key fix: we ALWAYS try fetchApprovedClaim when status is
     claim_approved or resolved, regardless of local state.
  ──────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!id) return;
    setPageLoading(true);
    setItem(null);
    setApproved(null);
    setAdminClaims([]);

    const load = async () => {
      try {
        // ✅ Always fetch fresh from Firestore — never rely on context cache
        const fetched = await fetchItem(id);
        setItem(fetched);

        const needsApproved =
          fetched.status === "claim_approved" ||
          fetched.status === "resolved";

        if (isAdmin) {
          const claims = await fetchClaims(id);
          setAdminClaims(Array.isArray(claims) ? claims : []);
        }

        // ✅ Always load approved claim when status qualifies
        // Both poster AND claimer need this data
        if (needsApproved) {
          const approved = await fetchApprovedClaim(id);
          setApproved(approved || null);
        }
      } catch (e) {
        console.error("ItemDetailPage load error:", e);
        setItem(null);
      } finally {
        setPageLoading(false);
      }
    };

    load();
  }, [id, isAdmin]);

  /* ─── Role detection ──────────────────────────────────────────────────
     isPoster  = person who created the item post
     isClaimer = person whose claim was approved
  ────────────────────────────────────────────────────────────────────── */
  const isPoster  = !!(user && item && emailEq(user.email, item.postedBy?.email));
  const isClaimer = !!(user && approvedClaim && emailEq(user.email, approvedClaim.email));

  const isApproved = item?.status === "claim_approved" || item?.status === "resolved";

  /* ─── Who clicks "Mark as collected"?
     LOST item  → poster (they were missing it, they pick it up from finder)
     FOUND item → claimer (they are the real owner, they pick it up from finder)
  ────────────────────────────────────────────────────────────────────── */
  const showCollectBtn =
    (item?.type === "lost"  && isPoster ) ||
    (item?.type === "found" && isClaimer);

  /* ─── Handlers ────────────────────────────────────────────────────── */
  const handleClaim = async (form) => {
    setClaimLoading(true);
    try {
      await submitClaim(id, form);
      setShowModal(false);
      onToast("Claim submitted! Admin will review it shortly.");
    } catch (err) {
      onToast(err.message || "Submission failed.", "error");
    } finally {
      setClaimLoading(false);
    }
  };

  const handleCollect = async () => {
    if (!approvedClaim?.id) return;
    setCollecting(true);
    try {
      await markCollected(id, approvedClaim.id);
      setItem((p)    => ({ ...p, status: "resolved" }));
      setApproved((p)=> ({ ...p, collected: true }));
      onToast("Item marked as resolved and removed from the public dashboard!");
    } catch (err) {
      onToast(err.message || "Failed.", "error");
    } finally {
      setCollecting(false);
    }
  };

  /* ─── Loading / Not found ─────────────────────────────────────────── */
  if (pageLoading) return (
    <main className="page--narrow" style={{ paddingTop: 100, textAlign: "center" }}>
      <div className="spinner" />
      <p style={{ color: "var(--text-muted)", marginTop: 16 }}>Loading item…</p>
    </main>
  );

  if (!item) return (
    <main className="page--narrow" style={{ paddingTop: 80, textAlign: "center" }}>
      <h2 style={{ fontWeight: 800 }}>Item not found</h2>
      <button className="btn btn-ghost" style={{ marginTop: 20 }} onClick={() => navigate("/")}>← Home</button>
    </main>
  );

  const statusMeta = {
    open:           { label: "Open",           bg: "#fef3c7", color: "#b45309", border: "#fcd34d" },
    claim_approved: { label: "Claim Approved",  bg: "#dcfce7", color: "#16a34a", border: "#86efac" },
    resolved:       { label: "Resolved",        bg: "#dbeafe", color: "#1d4ed8", border: "#93c5fd" },
  }[item.status] ?? { label: "Open", bg: "#fef3c7", color: "#b45309", border: "#fcd34d" };

  const isOpen = !item.status || item.status === "open";

  return (
    <main className="page--narrow">
      {showModal && (
        <ClaimModal
          item={item}
          onSubmit={handleClaim}
          onClose={() => setShowModal(false)}
          loading={claimLoading}
        />
      )}

      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}
        style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back
      </button>

      <div className="card" style={{ overflow: "hidden" }}>

        {/* ── Hero image / placeholder ── */}
        <div style={{ position: "relative", height: 300 }}>
          {item.image
            ? <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ height: "100%", background: item.type === "found" ? "linear-gradient(135deg,#dcfce7,#86efac)" : "linear-gradient(135deg,#fef9c3,#fde047)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1"><rect x="2" y="7" width="20" height="15" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
              </div>
          }
          <div style={{ position: "absolute", top: 16, left: 16, display: "flex", gap: 8 }}>
            <span className={`badge badge-${item.type}`}>{item.type}</span>
            <span style={{ padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", background: statusMeta.bg, color: statusMeta.color, border: `1px solid ${statusMeta.border}` }}>
              {statusMeta.label}
            </span>
          </div>
        </div>

        <div style={{ padding: "28px 32px" }}>
          <h2 style={{ fontWeight: 900, fontSize: 28, letterSpacing: "-0.4px", marginBottom: 12 }}>{item.title}</h2>
          <p style={{ color: "var(--text-sub)", lineHeight: 1.75, fontSize: 15, marginBottom: 28 }}>{item.description}</p>

          {/* Meta */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
            {[
              { label: "📍 Location", val: item.location },
              { label: "📅 Date",     val: fmtDate(item.date) },
              { label: "🏷️ Category", val: item.category },
              { label: "📊 Status",   val: statusMeta.label },
            ].map(({ label, val }) => (
              <div key={label} style={{ background: "var(--gray-50)", borderRadius: 12, padding: "14px 16px", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{val}</div>
              </div>
            ))}
          </div>

          {/* ═══════════════════════════════════════════════════════════
              POSTER VIEW after approval
              Shows claimer's contact info
          ═══════════════════════════════════════════════════════════ */}
          {isPoster && isApproved && approvedClaim && (
            <ContactCard
              heading={
                item.type === "lost"
                  ? "Someone found your item!"
                  : "A claim on your found item was approved!"
              }
              subheading="Admin verified this — contact them to arrange handover"
              person={{ name: approvedClaim.name, email: approvedClaim.email, phone: approvedClaim.phone }}
              itemTitle={item.title}
              showCollectBtn={showCollectBtn}
              collected={approvedClaim.collected}
              collecting={collecting}
              onCollect={handleCollect}
            />
          )}

          {/* ═══════════════════════════════════════════════════════════
              CLAIMER VIEW after approval
              Shows poster's contact info
          ═══════════════════════════════════════════════════════════ */}
          {isClaimer && !isPoster && isApproved && approvedClaim && (
            <ContactCard
              heading={
                item.type === "lost"
                  ? "Your finder report was approved!"
                  : "Your ownership claim was approved!"
              }
              subheading="Contact the item poster to arrange handover"
              person={{ name: item.postedBy?.name, email: item.postedBy?.email, phone: item.postedBy?.phone }}
              itemTitle={item.title}
              showCollectBtn={showCollectBtn}
              collected={approvedClaim.collected}
              collecting={collecting}
              onCollect={handleCollect}
            />
          )}

          {/* ═══════════════════════════════════════════════════════════
              PUBLIC VIEW (not poster, not claimer, not admin)
          ═══════════════════════════════════════════════════════════ */}
          {!isPoster && !isClaimer && !isAdmin && (
            <>
              {/* Poster name only — no contact */}
              <div style={{ borderRadius: 14, padding: "18px 22px", marginBottom: 24, background: "var(--gray-50)", border: "1.5px solid var(--border)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>Posted by</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{item.postedBy?.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--text-muted)" }}>
                  <LockIcon />
                  Contact details hidden — revealed only to verified parties
                </div>
              </div>

              {/* Open item actions */}
              {isOpen && (
                user ? (
                  <button className="btn btn-primary btn-full btn-lg" onClick={() => setShowModal(true)}>
                    {item.type === "found" ? "This Is Mine — Claim It" : "I Found This Item"}
                  </button>
                ) : (
                  <div style={{ borderRadius: 14, padding: "22px", background: "var(--primary-bg)", border: "1.5px solid var(--primary-border)", textAlign: "center" }}>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: "var(--primary)" }}>
                      Login to {item.type === "found" ? "claim this item" : "report you found it"}
                    </div>
                    <p style={{ color: "var(--text-sub)", fontSize: 14, marginBottom: 18 }}>
                      You need an account to submit a claim.
                    </p>
                    <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                      <Link to="/login"    className="btn btn-primary">Login</Link>
                      <Link to="/register" className="btn btn-ghost">Register</Link>
                    </div>
                  </div>
                )
              )}

              {item.status === "claim_approved" && (
                <div className="info-box info-box-success" style={{ textAlign: "center", fontWeight: 600 }}>
                  A claim has been approved. The parties are arranging handover.
                </div>
              )}
              {item.status === "resolved" && (
                <div className="info-box info-box-info" style={{ textAlign: "center", fontWeight: 600 }}>
                  This item has been successfully reunited with its owner.
                </div>
              )}
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════
              ADMIN VIEW — full contact + all claims
          ═══════════════════════════════════════════════════════════ */}
          {isAdmin && (
            <>
              <div style={{ borderRadius: 14, padding: "18px 22px", marginBottom: 24, background: "var(--success-bg)", border: "1.5px solid var(--success-border)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--success)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10 }}>Posted by</div>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 10 }}>{item.postedBy?.name}</div>
                <div style={{ fontSize: 14, lineHeight: 2.2 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <MailIcon />
                    <a href={`mailto:${item.postedBy?.email}`} style={{ color: "var(--primary)", fontWeight: 600 }}>{item.postedBy?.email}</a>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CallIcon />
                    <a href={`tel:${item.postedBy?.phone}`} style={{ color: "var(--primary)", fontWeight: 600 }}>{item.postedBy?.phone}</a>
                  </div>
                </div>
              </div>

              <hr className="divider" />
              <p className="section-label">All Claims ({adminClaims.length})</p>

              {adminClaims.length === 0
                ? <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>No claims yet.</p>
                : adminClaims.map((c) => (
                  <div key={c.id} style={{ borderRadius: 14, padding: "16px 18px", marginBottom: 12, background: c.status === "approved" ? "var(--success-bg)" : c.status === "rejected" ? "var(--danger-bg)" : "#fff", border: `1.5px solid ${c.status === "approved" ? "var(--success-border)" : c.status === "rejected" ? "var(--danger-border)" : "var(--border)"}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{c.name}</div>
                        <div style={{ fontSize: 13, color: "var(--text-sub)", lineHeight: 2, marginBottom: 8 }}>
                          <div>📧 {c.email}</div>
                          <div>📞 {c.phone}</div>
                        </div>
                        <div style={{ fontSize: 14, background: "rgba(0,0,0,0.04)", padding: "10px 14px", borderRadius: 8, fontStyle: "italic", lineHeight: 1.6 }}>
                          "{c.description}"
                        </div>
                        {c.collected && (
                          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, color: "var(--success)", fontWeight: 700, fontSize: 13 }}>
                            <CheckIcon size={14} /> Owner confirmed collection
                          </div>
                        )}
                      </div>
                      <span className={`badge badge-${c.status}`}>{c.status}</span>
                    </div>
                  </div>
                ))
              }
            </>
          )}
        </div>
      </div>
    </main>
  );
}