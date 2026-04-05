import { useNavigate } from "react-router-dom";
import { truncate, formatDate } from "../utils/helpers";
import styles from "../styles/ItemCard.module.css";

export default function ItemCard({ item }) {
  const navigate = useNavigate();

  return (
    <article
      className={`${styles.card} ${item.status === "resolved" ? styles.resolved : ""}`}
      onClick={() => navigate(`/item/${item.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/item/${item.id}`)}
    >
      {/* ── Icon banner ── */}
      <div className={`${styles.banner} ${item.type === "found" ? styles.bannerFound : styles.bannerLost}`}>
        <span className={styles.emoji}>{item.image}</span>
        <span className={`badge badge--${item.type}`}>{item.type}</span>
      </div>

      {/* ── Body ── */}
      <div className={styles.body}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{item.title}</h3>
          {item.status === "resolved" && (
            <span className="badge badge--resolved">Resolved</span>
          )}
        </div>

        <p className={styles.description}>{truncate(item.description)}</p>

        <div className={styles.meta}>
          <span>📍 {item.location}</span>
          <span>📅 {formatDate(item.date)}</span>
        </div>

        <div className={styles.footer}>
          <span className="badge badge--category">{item.category}</span>
          <span className={styles.claims}>
            {item.claims.length} claim{item.claims.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </article>
  );
}