import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import PatientDashboard from "./pages/PatientDashboard";
import TherapistDashboard from "./pages/TherapistDashboard";

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;
  if (user) {
    return (
      <Navigate
        to={user.role === "therapist" ? "/therapist" : "/patient"}
        replace
      />
    );
  }

  return <>{children}</>;
}

function ProtectedRoute({
  children,
  role,
}: {
  children: React.ReactNode;
  role: "patient" | "therapist";
}) {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    return (
      <Navigate
        to={user.role === "therapist" ? "/therapist" : "/patient"}
        replace
      />
    );
  }

  return <>{children}</>;
}

function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <nav className="nav">
        <h1>Appointment Booking</h1>
        <div className="nav-right">
          {user && (
            <>
              <span>
                {user.name} ({user.role})
              </span>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
      {children}
    </>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const defaultHome = user
    ? user.role === "therapist"
      ? "/therapist"
      : "/patient"
    : "/login";

  return (
    <Routes>
      <Route path="/" element={<Navigate to={defaultHome} replace />} />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/patient"
        element={
          <ProtectedRoute role="patient">
            <Layout>
              <PatientDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/therapist"
        element={
          <ProtectedRoute role="therapist">
            <Layout>
              <TherapistDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          user ? (
            <Layout>
              <NotFoundPage />
            </Layout>
          ) : (
            <NotFoundPage />
          )
        }
      />
    </Routes>
  );
}
