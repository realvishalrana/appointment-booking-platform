import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NotFoundPage() {
  const { user } = useAuth();

  const homeTo = user
    ? user.role === "therapist"
      ? "/therapist"
      : "/patient"
    : "/login";

  const homeLabel = user ? "Go to dashboard" : "Go to login";

  return (
    <div className="not-found-page">
      <div className="card not-found-card">
        <p className="not-found-code">404</p>
        <h2 style={{ marginBottom: "0.5rem" }}>Page not found</h2>
        <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to={homeTo} className="btn btn-primary">
          {homeLabel}
        </Link>
      </div>
    </div>
  );
}
