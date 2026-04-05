import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider }   from "./context/AuthContext";
import { ItemsProvider }  from "./context/ItemsContext";
import { useToast }       from "./hooks/useToast";
import Toast        from "./components/Toast";
import Navbar             from "./components/Navbar";
import { HomePage }        from "./pages/HomePage";
import { PostItemPage }   from "./pages/PostItemPage";
import  { ItemDetailPage }  from "./pages/ItemDetailPage";
import { AdminLoginPage, AdminPage } from "./pages/AdminPage";
import "./styles/global.css";

function AppInner() {
  const { toast, showToast } = useToast();

console.log("HomePage:", HomePage);
console.log("PostItemPage:", PostItemPage);
console.log("ItemDetailPage:", ItemDetailPage);
console.log("AdminLoginPage:", AdminLoginPage);
console.log("AdminPage:", AdminPage);

  return (
    <>
      <Toast toast={toast} />
      <Navbar onShowToast={showToast} />
      <Routes>
        <Route path="/"             element={<HomePage />} />
        <Route path="/post"         element={<PostItemPage   onShowToast={showToast} />} />
        <Route path="/item/:id"     element={<ItemDetailPage onShowToast={showToast} />} />
        <Route path="/admin/login"  element={<AdminLoginPage onShowToast={showToast} />} />
        <Route path="/admin"        element={<AdminPage      onShowToast={showToast} />} />
        <Route path="*"             element={<NotFound />} />
      </Routes>
    </>
  );
}

function NotFound() {
  return (
    <div className="page-wrapper text-center" style={{ paddingTop: 80 }}>
      <div style={{ fontSize: 72 }}>🚫</div>
      <h2 style={{ marginTop: 16 }}>404 — Page Not Found</h2>
      <a href="/" className="btn btn--primary" style={{ marginTop: 20, display: "inline-flex" }}>← Go Home</a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <ItemsProvider>
          <AppInner />
        </ItemsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}