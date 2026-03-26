import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, setStaffAuth } from "../../config/api";
import "./AuthPages.css";

export default function StaffLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await api("/staff/login", { method: "POST", body: { email, password } });
      setStaffAuth(data.accesstoken, {
        username: data.username,
        email: data.email,
        role: data.role,
      });
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card-wrap">
        <div className="auth-card">
          <h1>Staff sign in</h1>
          <p className="auth-lead">Sign in to manage products, discounts, and orders.</p>
          <form onSubmit={onSubmit}>
            <label className="auth-label">Work email</label>
            <input className="auth-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <label className="auth-label">Password</label>
            <input className="auth-input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="auth-submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign in to admin"}
            </button>
          </form>
          <p className="auth-footer">
            <Link to="/admin/setup-first">First-time setup (no staff yet)</Link>
            <span style={{ margin: "0 8px", color: "#ccc" }}>·</span>
            <Link to="/">Back to website</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
