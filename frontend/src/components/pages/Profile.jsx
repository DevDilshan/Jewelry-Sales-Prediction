import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PasswordToggleButton from "../PasswordToggleButton";
import "./Profile.css";
import { api, getStaffToken, setStaffAuth } from "../../config/api";
import {
  getPasswordPolicyIssues,
  isPasswordPolicyValid,
  PASSWORD_REQUIREMENTS_HINT,
} from "../../utils/passwordPolicy";
import { validateStaffProfileForm } from "../../utils/staffProfileValidation";

const ROLE_LABEL = {
  admin: "Admin",
  productmanager: "Product Manager",
  sales: "Sales",
  viewer: "Viewer",
  designer: "Designer",
};

const PROFILE_PHOTO_MAX_BYTES = Math.floor(2.5 * 1024 * 1024);
const PROFILE_PHOTO_ACCEPT_RE = /^image\/(jpeg|pjpeg|png|gif|webp)$/i;

function avatarInitialsFromProfile(me) {
  if (!me) return "—";
  const fn = (me.firstName || "").trim();
  const ln = (me.lastName || "").trim();
  if (fn && ln) return `${fn[0]}${ln[0]}`.toUpperCase();
  if (fn.length >= 2) return fn.slice(0, 2).toUpperCase();
  const u = (me.username || "").trim();
  return u.length >= 2 ? u.slice(0, 2).toUpperCase() : (u.charAt(0) || "?").toUpperCase();
}

const emptyPersonalForm = {
  firstName: "",
  lastName: "",
  phone: "",
  jobTitle: "",
  department: "",
  address: "",
  profileImage: "",
};

export default function Profile({ setActivePage }) {
  useEffect(() => {
    setActivePage("profile");
  }, [setActivePage]);

  const [me, setMe] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState(emptyPersonalForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const photoInputRef = useRef(null);

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
      .then((data) => setMe(data))
      .catch((e) => setLoadError(e.message || "Could not load profile"));
  }, []);

  useEffect(() => {
    if (!showEditModal) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !profileBusy) setShowEditModal(false);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [showEditModal, profileBusy]);

  const newPolicyIssues = getPasswordPolicyIssues(newPassword);
  const confirmMismatch =
    confirmPassword.length > 0 && newPassword.length > 0 && newPassword !== confirmPassword;

  const openEditModal = () => {
    if (!me) return;
    setForm({
      firstName: me.firstName || "",
      lastName: me.lastName || "",
      phone: me.phone || "",
      jobTitle: me.jobTitle || "",
      department: me.department || "",
      address: me.address || "",
      profileImage: me.profileImage || "",
    });
    setFieldErrors({});
    setProfileError("");
    setShowEditModal(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!me) return;
    setProfileMessage("");
    setProfileError("");
    setFieldErrors({});

    const v = validateStaffProfileForm({ ...form, email: me.email, profileImage: form.profileImage });
    if (!v.ok) {
      setFieldErrors(v.errors);
      return;
    }

    setProfileBusy(true);
    try {
      const updated = await api("/staff/me", {
        method: "PATCH",
        body: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phone: form.phone.trim(),
          jobTitle: form.jobTitle.trim(),
          department: form.department.trim(),
          address: form.address.trim(),
          profileImage: form.profileImage || "",
        },
        auth: "staff",
      });
      setMe(updated);
      const token = getStaffToken();
      if (token) {
        setStaffAuth(token, {
          username: updated.username,
          email: updated.email,
          role: updated.role,
          firstName: updated.firstName || "",
          lastName: updated.lastName || "",
          profileImage: updated.profileImage || "",
        });
      }
      setShowEditModal(false);
      setProfileMessage("Profile saved.");
      setTimeout(() => setProfileMessage(""), 4000);
    } catch (err) {
      const serverErrors = err.data?.errors;
      if (serverErrors && typeof serverErrors === "object") {
        setFieldErrors(serverErrors);
      }
      setProfileError(err.message || "Could not save profile");
    } finally {
      setProfileBusy(false);
    }
  };

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

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const onProfilePhotoFile = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!PROFILE_PHOTO_ACCEPT_RE.test(f.type)) {
      setFieldErrors((prev) => ({
        ...prev,
        profileImage: "Use JPEG, PNG, GIF, or WebP.",
      }));
      return;
    }
    if (f.size > PROFILE_PHOTO_MAX_BYTES) {
      setFieldErrors((prev) => ({
        ...prev,
        profileImage: "Image must be about 2.5 MB or smaller.",
      }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl === "string") setField("profileImage", dataUrl);
    };
    reader.readAsDataURL(f);
  };

  const clearProfilePhoto = () => {
    setField("profileImage", "");
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const renderAvatar = (src, initials) => {
    if (src) {
      return <img className="profile-avatar-photo" src={src} alt="" />;
    }
    return initials;
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <div>
          <h1>My Profile</h1>
          <p>Account overview and security</p>
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
          <div className="section-content profile-summary-row">
            <div className="profile-avatar-section">
              <div className={`profile-avatar${me?.profileImage ? " profile-avatar--has-photo" : ""}`}>
                {me ? renderAvatar(me.profileImage, avatarInitialsFromProfile(me)) : "—"}
              </div>
            </div>

            <div className="profile-details profile-details--wide">
              <h2>Personal details</h2>
              <p className="profile-section-lead">
                Your sign-in identity and role. Use Edit profile to update your details — text fields there are required;
                profile photo is optional.
              </p>

              <div className="profile-fixed-fields">
                <div className="form-group">
                  <label>Email address</label>
                  <input type="email" className="form-input form-input-readonly" readOnly value={me?.email || ""} />
                </div>

                <div className="form-grid profile-form-grid-2">
                  <div className="form-group">
                    <label>Username</label>
                    <input type="text" className="form-input form-input-readonly" readOnly value={me?.username || ""} />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <input
                      type="text"
                      className="form-input form-input-readonly"
                      readOnly
                      value={me ? ROLE_LABEL[me.role] || me.role : ""}
                    />
                  </div>
                </div>
              </div>

              {profileMessage && <p className="profile-pwd-success profile-inline-msg">{profileMessage}</p>}

              <button
                type="button"
                className="profile-btn-edit"
                onClick={openEditModal}
                disabled={loadError === "auth" || !me}
              >
                Edit profile
              </button>
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

      {showEditModal && (
        <div
          className="profile-modal-backdrop"
          role="presentation"
          onClick={() => !profileBusy && setShowEditModal(false)}
        >
          <div
            className="profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-edit-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="profile-modal-head">
              <h2 id="profile-edit-modal-title">Edit personal details</h2>
              <button
                type="button"
                className="profile-modal-close"
                onClick={() => !profileBusy && setShowEditModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <p className="profile-modal-lead">
              Text fields below are required. Profile photo is optional (JPEG, PNG, GIF, or WebP, about 2.5 MB max).
            </p>

            <form className="profile-modal-form" onSubmit={handleSaveProfile} noValidate>
              <div className="profile-photo-block">
                <div className={`profile-avatar profile-avatar--modal${form.profileImage ? " profile-avatar--has-photo" : ""}`}>
                  {renderAvatar(form.profileImage, avatarInitialsFromProfile(me))}
                </div>
                <input
                  ref={photoInputRef}
                  id="profile-photo-file"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="profile-photo-input-hidden"
                  onChange={onProfilePhotoFile}
                  disabled={profileBusy}
                />
                <div className="profile-photo-actions">
                  <button
                    type="button"
                    className="profile-photo-choose-btn"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={profileBusy}
                  >
                    Choose photo
                  </button>
                  {(form.profileImage || me?.profileImage) && (
                    <button
                      type="button"
                      className="profile-photo-remove-btn"
                      onClick={clearProfilePhoto}
                      disabled={profileBusy}
                    >
                      Remove photo
                    </button>
                  )}
                </div>
                {fieldErrors.profileImage && (
                  <p className="form-field-error" role="alert">
                    {fieldErrors.profileImage}
                  </p>
                )}
              </div>

              <div className="form-grid profile-form-grid-2">
                <div className="form-group">
                  <label htmlFor="modal-first-name">First name</label>
                  <input
                    id="modal-first-name"
                    type="text"
                    className={`form-input ${fieldErrors.firstName ? "form-input-error" : ""}`}
                    autoComplete="given-name"
                    value={form.firstName}
                    onChange={(e) => setField("firstName", e.target.value)}
                    disabled={profileBusy}
                    placeholder="e.g. Saman"
                  />
                  {fieldErrors.firstName && (
                    <p className="form-field-error" role="alert">
                      {fieldErrors.firstName}
                    </p>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="modal-last-name">Last name</label>
                  <input
                    id="modal-last-name"
                    type="text"
                    className={`form-input ${fieldErrors.lastName ? "form-input-error" : ""}`}
                    autoComplete="family-name"
                    value={form.lastName}
                    onChange={(e) => setField("lastName", e.target.value)}
                    disabled={profileBusy}
                    placeholder="e.g. Perera"
                  />
                  {fieldErrors.lastName && (
                    <p className="form-field-error" role="alert">
                      {fieldErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="modal-phone">Phone</label>
                <input
                  id="modal-phone"
                  type="tel"
                  inputMode="numeric"
                  className={`form-input ${fieldErrors.phone ? "form-input-error" : ""}`}
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  disabled={profileBusy}
                  placeholder="0771234567"
                />
                <p className="form-field-hint">Phone number must be this format: 0771234567</p>
                {fieldErrors.phone && (
                  <p className="form-field-error" role="alert">
                    {fieldErrors.phone}
                  </p>
                )}
              </div>

              <div className="form-grid profile-form-grid-2">
                <div className="form-group">
                  <label htmlFor="modal-job">Job title</label>
                  <input
                    id="modal-job"
                    type="text"
                    className={`form-input ${fieldErrors.jobTitle ? "form-input-error" : ""}`}
                    value={form.jobTitle}
                    onChange={(e) => setField("jobTitle", e.target.value)}
                    disabled={profileBusy}
                    placeholder="e.g. Sales associate"
                  />
                  {fieldErrors.jobTitle && (
                    <p className="form-field-error" role="alert">
                      {fieldErrors.jobTitle}
                    </p>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="modal-dept">Department</label>
                  <input
                    id="modal-dept"
                    type="text"
                    className={`form-input ${fieldErrors.department ? "form-input-error" : ""}`}
                    value={form.department}
                    onChange={(e) => setField("department", e.target.value)}
                    disabled={profileBusy}
                    placeholder="e.g. Boutique floor"
                  />
                  {fieldErrors.department && (
                    <p className="form-field-error" role="alert">
                      {fieldErrors.department}
                    </p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="modal-address">Address</label>
                <textarea
                  id="modal-address"
                  className={`form-input form-textarea ${fieldErrors.address ? "form-input-error" : ""}`}
                  rows={4}
                  autoComplete="street-address"
                  value={form.address}
                  onChange={(e) => setField("address", e.target.value)}
                  disabled={profileBusy}
                  placeholder="Street, city, postal code"
                />
                {fieldErrors.address && (
                  <p className="form-field-error" role="alert">
                    {fieldErrors.address}
                  </p>
                )}
              </div>

              {profileError && <p className="profile-pwd-error">{profileError}</p>}

              <div className="profile-modal-actions">
                <button
                  type="button"
                  className="profile-modal-cancel"
                  onClick={() => !profileBusy && setShowEditModal(false)}
                  disabled={profileBusy}
                >
                  Cancel
                </button>
                <button type="submit" className="profile-modal-save" disabled={profileBusy}>
                  {profileBusy ? "Saving…" : "Save profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
