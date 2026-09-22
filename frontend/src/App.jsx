import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Auth from "./pages/Auth";
import Documents from "./pages/Documents";
import DocumentChat from "./pages/DocumentChat";
import { getCurrentUser } from "./services/authService";

export default function App() {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // ── On mount: check existing session ──────────────────────────────────────
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await getCurrentUser();
        setUser(data.user);
        // If already on root and authenticated, stay wherever the URL says
      } catch {
        setUser(null);
        // If session is gone and user was on a protected route, send to root
        if (location.pathname !== "/") {
          navigate("/", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Called by Auth on successful login/signup ──────────────────────────────
  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    navigate("/", { replace: true });
  };

  // ── Called by Documents/DocumentChat on logout ─────────────────────────────
  const handleLogout = () => {
    setUser(null);
    navigate("/", { replace: true });
  };

  // ── Global loading screen ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: "#0F172A" }}>
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="mt-4 text-sm text-white/70">
          Loading DocuFlow<span className="animate-pulse">...</span>
        </p>
      </div>
    );
  }

  // ── Not authenticated — always show Auth ───────────────────────────────────
  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  // ── Authenticated — routing ────────────────────────────────────────────────
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Documents
            user={user}
            onLogout={handleLogout}
            onOpenDoc={(doc) => navigate(`/documents/${doc._id || doc.id}`)}
          />
        }
      />
      <Route
        path="/documents/:documentId"
        element={
          <DocumentChat
            user={user}
            onBack={() => navigate("/")}
            onLogout={handleLogout}
          />
        }
      />
      {/* Catch-all: send unknown paths to root */}
      <Route path="*" element={<RedirectToRoot />} />
    </Routes>
  );
}

function RedirectToRoot() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/", { replace: true }); }, [navigate]);
  return null;
}