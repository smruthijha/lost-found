import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main
      className="page-wrapper text-center"
      style={{ paddingTop: 100, minHeight: "calc(100vh - 64px)" }}
    >
      <div style={{ fontSize: 80 }}>🚫</div>
      <h1 style={{ fontSize: 48, fontWeight: 800, marginTop: 16, color: "var(--primary)" }}>
        404
      </h1>
      <h2 style={{ fontWeight: 700, marginTop: 8 }}>Page Not Found</h2>
      <p style={{ color: "var(--text-muted)", marginTop: 10, fontSize: 15 }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="btn btn--primary"
        style={{ marginTop: 28, display: "inline-flex" }}
      >
        ← Back to Home
      </Link>
    </main>
  );
}