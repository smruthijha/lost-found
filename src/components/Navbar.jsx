import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/Navbar.module.css";

export default function Navbar({ onShowToast }) {
  const { isAdmin, adminLogout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    adminLogout();
    onShowToast("Admin logged out successfully.");
    navigate("/");
  };

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        {/* ── Brand ── */}
        <Link to="/" className={styles.brand}>
          <span className={styles.brandIcon}>🔍</span>
          <div>
            <div className={styles.brandTitle}>Campus Lost &amp; Found</div>
            <div className={styles.brandSub}>Reuniting belongings since 2026</div>
          </div>
        </Link>

        {/* ── Links ── */}
        <div className={styles.links}>
          <Link to="/"       className={`${styles.link} ${pathname === "/"        ? styles.active : ""}`}>Home</Link>
          <Link to="/post"   className={`${styles.link} ${pathname === "/post"    ? styles.active : ""}`}>+ Post Item</Link>
          {isAdmin && (
            <Link to="/admin" className={`${styles.link} ${pathname === "/admin" ? styles.active : ""}`}>⚙ Admin</Link>
          )}
        </div>

        {/* ── Auth ── */}
        <div className={styles.auth}>
          {isAdmin ? (
            <>
              <span className={styles.adminPill}>⚙ Admin</span>
              <button className="btn btn--ghost btn--sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <Link to="/admin/login" className="btn btn--primary btn--sm">Admin Login</Link>
          )}
        </div>
      </nav>
    </header>
  );
}