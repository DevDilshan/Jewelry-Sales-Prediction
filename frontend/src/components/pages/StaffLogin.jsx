import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { api, setStaffAuth } from "../../config/api";
import PasswordToggleButton from "../PasswordToggleButton";
import "./AuthPages.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function StaffLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const resetSuccess = location.state?.resetSuccess;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const validate = () => {
    const next = {};
    const em = email.trim();
    if (!em) next.email = "Email is required.";
    else if (!EMAIL_RE.test(em)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setBusy(true);
    try {
      const data = await api("/staff/login", {
        method: "POST",
        body: { email: email.trim(), password },
      });
      setStaffAuth(data.accesstoken, {
        username: data.username,
        email: data.email,
        role: data.role,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        profileImage: data.profileImage || "",
      });
      navigate("/admin");
    } catch (err) {
      const apiErrors = err.data?.errors;
      if (apiErrors && typeof apiErrors === "object") {
        const next = {};
        if (typeof apiErrors.email === "string") next.email = apiErrors.email;
        if (typeof apiErrors.password === "string") next.password = apiErrors.password;
        if (Object.keys(next).length > 0) {
          setFieldErrors(next);
          setError("");
        } else {
          setError(err.message || "Invalid credentials");
        }
      } else {
        setError(err.message || "Invalid credentials");
      }
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
          {resetSuccess && (
            <p className="auth-success" role="status">
              Your password was reset. Sign in with your new password.
            </p>
          )}
          <form onSubmit={onSubmit} noValidate>
            <label className="auth-label" htmlFor="staff-login-email">
              Work email
            </label>
            <input
              id="staff-login-email"
              className="auth-input"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: undefined }));
              }}
            />
            {fieldErrors.email && <p className="auth-field-error">{fieldErrors.email}</p>}
            <label className="auth-label" htmlFor="staff-login-password">
              Password
            </label>
            <div className="auth-password-wrap">
              <input
                id="staff-login-password"
                className="auth-input"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: undefined }));
                }}
              />
              <PasswordToggleButton visible={showPassword} onToggle={() => setShowPassword((v) => !v)} disabled={busy} />
            </div>
            {fieldErrors.password && <p className="auth-field-error">{fieldErrors.password}</p>}
            <p className="auth-forgot-inline">
              <Link to="/admin/forgot-password">Forgot password?</Link>
            </p>
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
