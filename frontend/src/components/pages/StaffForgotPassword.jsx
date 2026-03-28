import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../config/api";
import "./AuthPages.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function StaffForgotPassword() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = () => {
    const em = email.trim();
    if (!em) {
      setFieldError("Email is required.");
      return false;
    }
    if (!EMAIL_RE.test(em)) {
      setFieldError("Enter a valid email address.");
      return false;
    }
    setFieldError("");
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setBusy(true);
    try {
      await api("/staff/forgot-password", { method: "POST", body: { email: email.trim() } });
      setSent(true);
    } catch (err) {
      setError(err.message || "Request failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card-wrap">
        <div className="auth-card">
          <h1>Forgot password</h1>
          <p className="auth-lead">
            Enter your work email. If a staff account exists, you will receive reset instructions (check the server log in
            development).
          </p>
          {sent ? (
            <>
              <p className="auth-success">
                If a staff account exists for that email, password reset instructions have been sent.
              </p>
              <p className="auth-footer" style={{ marginTop: 24 }}>
                <Link to="/admin/login">Back to staff sign in</Link>
              </p>
            </>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <label className="auth-label auth-label--first" htmlFor="staff-forgot-email">
                Work email
              </label>
              <input
                id="staff-forgot-email"
                className="auth-input"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldError) setFieldError("");
                }}
              />
              {fieldError && <p className="auth-field-error">{fieldError}</p>}
              {error && <p className="auth-error">{error}</p>}
              <button type="submit" className="auth-submit" disabled={busy}>
                {busy ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )}
          {!sent && (
            <p className="auth-footer">
              <Link to="/admin/login">Back to staff sign in</Link>
              <span style={{ margin: "0 8px", color: "#ccc" }}>·</span>
              <Link to="/">Website</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
