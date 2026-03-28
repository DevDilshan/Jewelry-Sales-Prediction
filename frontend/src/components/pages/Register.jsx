import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../website/Navbar";
import { api, setCustomerAuth } from "../../config/api";
import { isPasswordPolicyValid, PASSWORD_REQUIREMENTS_HINT } from "../../utils/passwordPolicy";
import "./AuthPages.css";

export default function Register() {
  const [searchParams] = useSearchParams();
  const ret = searchParams.get("return") || "/dashboard";
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPasswordError("");
    if (!isPasswordPolicyValid(password)) {
      setPasswordError(PASSWORD_REQUIREMENTS_HINT);
      return;
    }
    setBusy(true);
    try {
      const data = await api("/customer/register", {
        method: "POST",
        body: { firstName, lastName, email, password, address },
      });
      if (data.token) {
        setCustomerAuth(data.token, {
          id: data.id,
          firstname: data.firstname,
          lastname: data.lastname,
          email: data.email,
        });
        navigate(ret.startsWith("/") ? ret : `/${ret}`);
      } else {
        navigate(`/login?return=${encodeURIComponent(ret)}`);
      }
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <Navbar />
      <div className="auth-card-wrap">
        <div className="auth-card">
          <h1>Create account</h1>
          <p className="auth-lead">Register to save orders and checkout from the shop.</p>
          <form onSubmit={onSubmit} noValidate>
            <div className="auth-row">
              <div>
                <label className="auth-label">First name</label>
                <input className="auth-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div>
                <label className="auth-label">Last name</label>
                <input className="auth-input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <label className="auth-label">Email</label>
            <input className="auth-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <label className="auth-label" htmlFor="register-password">
              Password
            </label>
            <input
              id="register-password"
              className="auth-input"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError("");
              }}
            />
            <p className="auth-field-hint">{PASSWORD_REQUIREMENTS_HINT}</p>
            {passwordError && <p className="auth-field-error">{passwordError}</p>}
            <label className="auth-label">Address (optional)</label>
            <input className="auth-input" value={address} onChange={(e) => setAddress(e.target.value)} />
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="auth-submit" disabled={busy}>
              {busy ? "Creating…" : "Create account"}
            </button>
          </form>
          <p className="auth-footer">
            Already have an account? <Link to={`/login?return=${encodeURIComponent(ret)}`}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
