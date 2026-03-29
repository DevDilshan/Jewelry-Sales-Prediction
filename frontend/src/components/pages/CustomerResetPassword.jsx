import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../website/Navbar";
import PasswordToggleButton from "../PasswordToggleButton";
import { api } from "../../config/api";
import {
  getPasswordPolicyIssues,
  isPasswordPolicyValid,
  PASSWORD_REQUIREMENTS_HINT,
} from "../../utils/passwordPolicy";
import "./AuthPages.css";

export default function CustomerResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ret = searchParams.get("return") || "/dashboard";
  const token = (searchParams.get("token") || "").trim();
  const loginHref = `/login?return=${encodeURIComponent(ret.startsWith("/") ? ret : `/${ret}`)}`;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const policyIssues = getPasswordPolicyIssues(password);
  const mismatch = confirm.length > 0 && password !== confirm;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!token) {
      setError("Missing reset token. Open the link from your email or request a new reset.");
      return;
    }
    if (!isPasswordPolicyValid(password)) {
      setError(policyIssues[0] || "Choose a stronger password.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await api("/customer/reset-password", { method: "POST", body: { token, newPassword: password } });
      navigate(loginHref, { replace: true, state: { resetSuccess: true } });
    } catch (err) {
      setError(err.message || "Could not reset password");
    } finally {
      setBusy(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-page">
        <Navbar />
        <div className="auth-card-wrap">
          <div className="auth-card">
            <h1>Reset password</h1>
            <p className="auth-error">This link is invalid or incomplete. Request a new reset from the sign-in page.</p>
            <p className="auth-footer" style={{ marginTop: 20 }}>
              <Link to="/forgot-password">Forgot password</Link>
              <span style={{ margin: "0 8px", color: "#ccc" }}>·</span>
              <Link to={loginHref}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <Navbar />
      <div className="auth-card-wrap">
        <div className="auth-card">
          <h1>Set a new password</h1>
          <p className="auth-lead">Choose a strong password for your Beceff account.</p>
          <form onSubmit={onSubmit} noValidate>
            <label className="auth-label auth-label--first" htmlFor="customer-reset-password">
              New password
            </label>
            <div className="auth-password-wrap">
              <input
                id="customer-reset-password"
                className="auth-input"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <PasswordToggleButton visible={showPw} onToggle={() => setShowPw((v) => !v)} disabled={busy} />
            </div>
            <p className="auth-field-hint">{PASSWORD_REQUIREMENTS_HINT}</p>
            {password.length > 0 && policyIssues.length > 0 && (
              <ul className="auth-policy-list" role="alert">
                {policyIssues.map((msg) => (
                  <li key={msg}>{msg}</li>
                ))}
              </ul>
            )}

            <label className="auth-label" htmlFor="customer-reset-confirm">
              Confirm new password
            </label>
            <div className="auth-password-wrap">
              <input
                id="customer-reset-confirm"
                className="auth-input"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              <PasswordToggleButton visible={showConfirm} onToggle={() => setShowConfirm((v) => !v)} disabled={busy} />
            </div>
            {mismatch && (
              <p className="auth-field-error" role="alert">
                Passwords do not match.
              </p>
            )}

            {error && <p className="auth-error">{error}</p>}
            <button
              type="submit"
              className="auth-submit"
              disabled={busy || !isPasswordPolicyValid(password) || password !== confirm}
            >
              {busy ? "Saving…" : "Update password"}
            </button>
          </form>
          <p className="auth-footer">
            <Link to={loginHref}>Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
