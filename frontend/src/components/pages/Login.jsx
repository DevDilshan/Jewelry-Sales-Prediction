import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../website/Navbar";
import { api, setCustomerAuth } from "../../config/api";
import "./AuthPages.css";

export default function Login() {
  const [searchParams] = useSearchParams();
  const ret = searchParams.get("return") || "/dashboard";
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
      const data = await api("/customer/login", { method: "POST", body: { email, password } });
      setCustomerAuth(data.token, {
        id: data.id,
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
      });
      navigate(ret.startsWith("/") ? ret : `/${ret}`);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <Navbar />
      <div className="auth-card-wrap">
        <div className="auth-card">
          <h1>Sign in</h1>
          <p className="auth-lead">Use your Beceff account to place takeaway orders.</p>
          <form onSubmit={onSubmit}>
            <label className="auth-label">Email</label>
            <input className="auth-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <label className="auth-label">Password</label>
            <input className="auth-input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="auth-submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <p className="auth-footer">
            No account? <Link to={`/register?return=${encodeURIComponent(ret)}`}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
