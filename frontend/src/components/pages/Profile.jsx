import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Profile.css";
import { api, getStaffToken } from "../../config/api";

const ROLE_LABEL = {
  admin: "Admin",
  productmanager: "Product Manager",
  sales: "Sales",
  viewer: "Viewer",
};

function avatarInitials(username) {
  const u = (username || "").trim();
  return u.length >= 2 ? u.slice(0, 2).toUpperCase() : u.slice(0, 1).toUpperCase() || "?";
}

export default function Profile({ setActivePage }) {
  useEffect(() => {
    setActivePage("profile");
  }, [setActivePage]);

  const [me, setMe] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdBusy, setPwdBusy] = useState(false);
  const [pwdMessage, setPwdMessage] = useState("");
  const [pwdError, setPwdError] = useState("");

  useEffect(() => {
    if (!getStaffToken()) {
      setLoadError("auth");
      return;
    }
    api("/staff/me", { auth: "staff" })
      .then(setMe)
      .catch((e) => setLoadError(e.message || "Could not load profile"));
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMessage("");
    setPwdError("");
    if (newPassword !== confirmPassword) {
      setPwdError("New passwords do not match.");
      return;
    }
    setPwdBusy(true);
    try {
      await api("/staff/me/password", {
        method: "POST",
        body: { currentPassword, newPassword },
        auth: "staff",
      });
      setPwdMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwdError(err.message || "Could not update password");
    } finally {
      setPwdBusy(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <div>
          <h1>My Profile</h1>
          <p>Manage your staff account and password</p>
        </div>
      </div>

      {loadError === "auth" && (
        <p className="profile-banner">
          <Link to="/admin/login">Sign in</Link> to view your profile.
        </p>
      )}
      {loadError && loadError !== "auth" && <p className="profile-banner error">{loadError}</p>}

      <div className="profile-container">
        <div className="profile-section">
          <div className="section-content">
            <div className="profile-avatar-section">
              <div className="profile-avatar">{me ? avatarInitials(me.username) : "—"}</div>
            </div>

            <div className="profile-details">
              <h2>Profile Details</h2>
              <p>Information from your staff account</p>

              <div className="form-group">
                <label>USERNAME</label>
                <input type="text" className="form-input" readOnly value={me?.username || ""} />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>ROLE</label>
                  <input
                    type="text"
                    className="form-input"
                    readOnly
                    value={me ? ROLE_LABEL[me.role] || me.role : ""}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>EMAIL ADDRESS</label>
                <input type="email" className="form-input" readOnly value={me?.email || ""} />
              </div>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <div className="section-content">
            <h2>Change Password</h2>
            <p>If you were given a temporary password when your account was created, replace it here.</p>

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>CURRENT PASSWORD</label>
                <div className="password-input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    className="form-input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>NEW PASSWORD</label>
                  <div className="password-input-group">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                      className="form-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>CONFIRM NEW PASSWORD</label>
                  <div className="password-input-group">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repeat new password"
                      className="form-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
              </div>

              {pwdError && <p className="profile-pwd-error">{pwdError}</p>}
              {pwdMessage && <p className="profile-pwd-success">{pwdMessage}</p>}

              <button type="submit" className="save-btn" disabled={pwdBusy || loadError === "auth"}>
                {pwdBusy ? "UPDATING…" : "UPDATE PASSWORD"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
