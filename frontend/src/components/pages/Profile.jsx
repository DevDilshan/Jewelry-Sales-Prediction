import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PasswordToggleButton from "../PasswordToggleButton";
import "./Profile.css";
import { api, getStaffToken } from "../../config/api";
import {
  getPasswordPolicyIssues,
  isPasswordPolicyValid,
  PASSWORD_REQUIREMENTS_HINT,
} from "../../utils/passwordPolicy";

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

  const newPolicyIssues = getPasswordPolicyIssues(newPassword);
  const confirmMismatch =
    confirmPassword.length > 0 && newPassword.length > 0 && newPassword !== confirmPassword;

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMessage("");
    setPwdError("");
    if (!currentPassword) {
      setPwdError("Enter your current password.");
      return;
    }
    if (!isPasswordPolicyValid(newPassword)) {
      const issues = getPasswordPolicyIssues(newPassword);
      setPwdError(issues[0] || "Choose a stronger password.");
      return;
    }
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

        <div className="profile-section profile-section-password">
          <div className="section-content change-password-layout">
            <div>
              <h2>Change password</h2>
              <p className="change-password-lead">Update your password if you still use a temporary one.</p>
            </div>

            <form className="change-password-form" onSubmit={handleChangePassword} noValidate>
              <div className="form-group">
                <label htmlFor="profile-current-password">Current password</label>
                <div className="password-input-group">
                  <input
                    id="profile-current-password"
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <PasswordToggleButton
                    visible={showPassword}
                    onToggle={() => setShowPassword((v) => !v)}
                    disabled={pwdBusy || loadError === "auth"}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="profile-new-password">New password</label>
                <div className="password-input-group">
                  <input
                    id="profile-new-password"
                    type={showNewPassword ? "text" : "password"}
                    className="form-input"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <PasswordToggleButton
                    visible={showNewPassword}
                    onToggle={() => setShowNewPassword((v) => !v)}
                    disabled={pwdBusy || loadError === "auth"}
                  />
                </div>
                <p className="form-field-hint">{PASSWORD_REQUIREMENTS_HINT}</p>
                {newPassword.length > 0 && newPolicyIssues.length > 0 && (
                  <ul className="form-field-error-list" role="alert">
                    {newPolicyIssues.map((msg) => (
                      <li key={msg}>{msg}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="profile-confirm-password">Confirm new password</label>
                <div className="password-input-group">
                  <input
                    id="profile-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-input"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <PasswordToggleButton
                    visible={showConfirmPassword}
                    onToggle={() => setShowConfirmPassword((v) => !v)}
                    disabled={pwdBusy || loadError === "auth"}
                  />
                </div>
                {confirmMismatch && (
                  <p className="form-field-error" role="alert">
                    Does not match the new password.
                  </p>
                )}
              </div>

              {pwdError && <p className="profile-pwd-error">{pwdError}</p>}
              {pwdMessage && <p className="profile-pwd-success">{pwdMessage}</p>}

              <button
                type="submit"
                className="save-btn"
                disabled={
                  pwdBusy ||
                  loadError === "auth" ||
                  !currentPassword ||
                  !isPasswordPolicyValid(newPassword) ||
                  newPassword !== confirmPassword
                }
              >
                {pwdBusy ? "Updating…" : "Update password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
