import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, setStaffAuth } from "../../config/api";
import "./AuthPages.css";

export default function StaffSetup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [useCustomPassword, setUseCustomPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const body = { username: username.trim(), email: email.trim() };
      if (useCustomPassword && password.trim()) body.password = password.trim();
      const data = await api("/staff/setup-first", { method: "POST", body });
      setStaffAuth(data.accesstoken, {
        username: data.user?.username || username.trim(),
        email: data.user?.email || email.trim(),
        role: data.user?.role || "admin",
      });
      if (data.temporaryPassword) {
        window.alert(
          `Save this password — it will not be shown again:\n\n${data.temporaryPassword}\n\nChange it anytime under Admin → My Profile.`
        );
      }
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Setup failed");
    } finally {
      setBusy(false);
    }
  };


  return (
    <div className="auth-page">
      <div className="auth-card-wrap">
        <div className="auth-card">
          <h1>First administrator</h1>
          <p className="auth-lead">
            Use this once when the database has no staff yet. A default password is assigned unless you set your own below.
            After signing in, change your password under <strong>My Profile</strong>.
          </p>
          <form onSubmit={onSubmit}>
            <label className="auth-label">Username</label>
            <input
              className="auth-input"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
            />
            <label className="auth-label">Work email</label>
            <input
              className="auth-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label className="auth-label" style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={useCustomPassword}
                onChange={(e) => setUseCustomPassword(e.target.checked)}
              />
              Set my own password (optional)
            </label>
            {useCustomPassword && (
              <>
                <label className="auth-label">Password</label>
                <input
                  className="auth-input"
                  type="password"
                  required={useCustomPassword}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                />
              </>
            )}
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="auth-submit" disabled={busy}>
              {busy ? "Creating…" : "Create administrator & sign in"}
            </button>
          </form>
          <p className="auth-footer">
            <Link to="/admin/login">Back to staff sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
