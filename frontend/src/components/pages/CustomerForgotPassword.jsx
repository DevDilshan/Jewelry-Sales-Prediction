import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../website/Navbar";
import { api } from "../../config/api";
import "./AuthPages.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CustomerForgotPassword() {
  const [searchParams] = useSearchParams();
  const ret = searchParams.get("return") || "/dashboard";

  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const loginHref = `/login?return=${encodeURIComponent(ret.startsWith("/") ? ret : `/${ret}`)}`;

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
      const returnPath = ret.startsWith("/") ? ret : `/${ret}`;
      await api("/customer/forgot-password", {
        method: "POST",
        body: { email: email.trim(), return: returnPath },
      });
      setSent(true);
    } catch (err) {
      setError(err.message || "Request failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <Navbar />
      <div className="auth-card-wrap">
        <div className="auth-card">
          <h1>Forgot password</h1>
          <p className="auth-lead">
            Enter your account email. If we find a match, reset instructions are sent (in development, check the server
            console for the link).
          </p>
          {sent ? (
            <>
              <p className="auth-success">
                If an account exists for that email, password reset instructions have been sent.
              </p>
              <p className="auth-footer" style={{ marginTop: 24 }}>
                <Link to={loginHref}>Back to sign in</Link>
              </p>
            </>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <label className="auth-label auth-label--first" htmlFor="customer-forgot-email">
                Email
              </label>
              <input
                id="customer-forgot-email"
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
              <Link to={loginHref}>Back to sign in</Link>
              <span style={{ margin: "0 8px", color: "#ccc" }}>·</span>
              <Link to={`/register?return=${encodeURIComponent(ret.startsWith("/") ? ret : `/${ret}`)}`}>Register</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
