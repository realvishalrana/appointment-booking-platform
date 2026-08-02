import PasswordInput from "../components/common/PasswordInput";
import { useLogin } from "../hooks/useLogin";

export default function LoginPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    handleSubmit,
  } = useLogin();

  return (
    <div className="login-page">
      <div className="card login-card">
        <h2 style={{ marginBottom: "0.5rem" }}>Appointment Booking</h2>
        <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
          Sign in with your demo account
        </p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="patient@demo.com"
            required
          />
          <label htmlFor="password">Password</label>
          <PasswordInput
            id="password"
            value={password}
            onChange={setPassword}
            placeholder="password123"
            required
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div style={{ marginTop: "1.5rem", fontSize: "0.85rem", color: "#6b7280" }}>
          <p><strong>Patient:</strong> patient@demo.com / password123</p>
          <p><strong>Therapist:</strong> therapist@demo.com / password123</p>
        </div>
      </div>
    </div>
  );
}
