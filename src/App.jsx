import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider }  from "./context/AuthContext";
import { ItemsProvider } from "./context/ItemsContext";
import { useToast }      from "./hooks/useToast";
import { Navbar }        from "./components/Navbar";
import { Toast }         from "./components/Toast";
import { HomePage }       from "./pages/HomePage";
import { PostItemPage }   from "./pages/PostItemPage";
import { ItemDetailPage } from "./pages/ItemDetailPage";
import { AuthPage }       from "./pages/AuthPage";
import { AdminPage }      from "./pages/AdminPage";
import { ProfilePage }    from "./pages/ProfilePage";
import "./styles/global.css";
import { patchMissingStatus } from "./firebase/patchItems"; // ← remove after first deploy

function AppShell() {
  const { toast, showToast } = useToast();

  // ✅ One-time patch — adds missing `status: "open"` to old items
  // Remove this useEffect after your first successful deploy
  useEffect(() => {
    patchMissingStatus().catch(console.error);
  }, []);
  return (
    <>
      <Toast toast={toast} />
      <Navbar onToast={showToast} />
      <Routes>
        <Route path="/"         element={<HomePage />} />
        <Route path="/post"     element={<PostItemPage   onToast={showToast} />} />
        <Route path="/item/:id" element={<ItemDetailPage onToast={showToast} />} />
        <Route path="/login"    element={<AuthPage mode="login"    onToast={showToast} />} />
        <Route path="/register" element={<AuthPage mode="register" onToast={showToast} />} />
        <Route path="/admin"    element={<AdminPage      onToast={showToast} />} />
        <Route path="/profile"  element={<ProfilePage    onToast={showToast} />} />
        <Route path="*"         element={<NotFound />} />
      </Routes>
    </>
  );
}

function NotFound() {
  return (
    <main style={{ textAlign: "center", padding: "100px 20px" }}>
      <div style={{
        width: 96, height: 96, borderRadius: 28,
        background: "var(--primary-bg)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 24px",
      }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>
      <h1 style={{ fontSize: 56, fontWeight: 900, color: "var(--primary)", lineHeight: 1 }}>404</h1>
      <h2 style={{ marginTop: 8, fontWeight: 700 }}>Page not found</h2>
      <p style={{ color: "var(--text-muted)", marginTop: 8 }}>
        The page you're looking for doesn't exist.
      </p>
      <a href="/" className="btn btn-primary" style={{ marginTop: 28, display: "inline-flex" }}>
        Back to Home
      </a>
    </main>
  );
}

export default function App() {
  return (
    // ✅ Both future flags added to silence React Router v6 → v7 warnings
    <BrowserRouter
      future={{
        v7_startTransition:       true,
        v7_relativeSplatPath:     true,
      }}
    >
      <AuthProvider>
        <ItemsProvider>
          <AppShell />
        </ItemsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}