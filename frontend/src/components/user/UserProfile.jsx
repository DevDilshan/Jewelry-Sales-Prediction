import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api, getCustomerToken, setCustomerAuth } from "../../config/api";
import {
  isPasswordPolicyValid,
  PASSWORD_REQUIREMENTS_HINT,
} from "../../utils/passwordPolicy";
import "./UserProfile.css";

function splitFullName(fullName) {
  const t = String(fullName || "").trim();
  if (!t) return { firstName: "", lastName: "" };
  const i = t.indexOf(" ");
  if (i === -1) return { firstName: t, lastName: "" };
  return { firstName: t.slice(0, i).trim(), lastName: t.slice(i + 1).trim() };
}

export default function ProfileSettings() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [profile, setProfile] = useState({
    fullName: "",
    phone: "",
    email: "",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [profileBusy, setProfileBusy] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const refreshProfile = useCallback(() => {
    if (!getCustomerToken()) {
      setLoading(false);
      setLoadError("signin");
      return;
    }
    setLoadError("");
    setLoading(true);
    api("/customer/me", { auth: "customer" })
      .then((data) => {
        setProfile({
          fullName: [data.firstName, data.lastName].filter(Boolean).join(" ").trim(),
          phone: data.phone || "",
          email: data.email || "",
        });
      })
      .catch(() => setLoadError("Could not load your profile."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!getCustomerToken()) {
      navigate("/login?return=/dashboard/profile");
      return;
    }
    refreshProfile();
  }, [navigate, refreshProfile]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSaved(false);
    const { firstName, lastName } = splitFullName(profile.fullName);
    if (!profile.email.trim() || !profile.email.includes("@")) {
      setProfileError("Please enter a valid email address.");
      return;
    }
    setProfileBusy(true);
    try {
      const data = await api("/customer/me", {
        method: "PATCH",
        body: {
          firstName,
          lastName,
          email: profile.email.trim(),
          phone: profile.phone.trim(),
        },
        auth: "customer",
      });
      setProfile({
        fullName: [data.firstName, data.lastName].filter(Boolean).join(" ").trim(),
        phone: data.phone || "",
        email: data.email || "",
      });
      const token = getCustomerToken();
      if (token) {
        setCustomerAuth(token, {
          id: data.id,
          firstname: data.firstName,
          lastname: data.lastName,
          email: data.email,
        });
      }
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err) {
      setProfileError(err.message || "Could not save profile.");
    } finally {
      setProfileBusy(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSaved(false);
    if (!passwords.current) {
      setPasswordError("Enter your current password.");
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }
    if (!isPasswordPolicyValid(passwords.newPass)) {
      setPasswordError(PASSWORD_REQUIREMENTS_HINT);
      return;
    }
    setPasswordBusy(true);
    try {
      await api("/customer/me/password", {
        method: "POST",
        body: {
          currentPassword: passwords.current,
          newPassword: passwords.newPass,
        },
        auth: "customer",
      });
      setPasswords({ current: "", newPass: "", confirm: "" });
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 2500);
    } catch (err) {
      setPasswordError(err.message || "Could not update password.");
    } finally {
      setPasswordBusy(false);
    }
  };

  if (loadError === "signin") {
    return null;
  }

  return (
    <div className="ps-layout">
      <main className="ps-main">
        <div className="ps-page-header">
          <h1>Profile Settings</h1>
          <p>Manage your personal information and security preferences.</p>
        </div>

        {loadError && <p className="ps-inline-error">{loadError}</p>}

        {/* Personal Information */}
        <div className="ps-card">
          <div className="ps-card-header">
            <div>
              <h2>Personal Information</h2>
            </div>
            <span className="ps-card-tag">GENERAL INFO</span>
          </div>

          {loading ? (
            <p className="ps-loading">Loading profile…</p>
          ) : (
            <form onSubmit={handleSaveProfile} className="ps-form">
              {profileError && <p className="ps-inline-error">{profileError}</p>}
              <div className="ps-form-row">
                <div className="ps-field">
                  <label htmlFor="ps-fullname">FULL NAME</label>
                  <input
                    id="ps-fullname"
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    placeholder="Your full name"
                    autoComplete="name"
                    disabled={profileBusy}
                  />
                </div>
                <div className="ps-field">
                  <label htmlFor="ps-phone">PHONE NUMBER</label>
                  <input
                    id="ps-phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+94 77 000 0000"
                    autoComplete="tel"
                    disabled={profileBusy}
                  />
                </div>
              </div>

              <div className="ps-field">
                <label htmlFor="ps-email">EMAIL ADDRESS</label>
                <input
                  id="ps-email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="your@email.com"
                  autoComplete="email"
                  disabled={profileBusy}
                />
              </div>

              <div className="ps-form-footer">
                <button type="submit" className={`ps-btn-save ${profileSaved ? "saved" : ""}`} disabled={profileBusy}>
                  {profileBusy ? (
                    "Saving…"
                  ) : profileSaved ? (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Saved
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security */}
        <div className="ps-card">
          <div className="ps-card-header">
            <div>
              <h2>Security</h2>
            </div>
            <span className="ps-card-tag">PASSWORD MANAGEMENT</span>
          </div>

          <form onSubmit={handleUpdatePassword} className="ps-form">
            {passwordError && <p className="ps-inline-error">{passwordError}</p>}
            <div className="ps-field">
              <label htmlFor="ps-current-pw">CURRENT PASSWORD</label>
              <div className="ps-password-wrap">
                <input
                  id="ps-current-pw"
                  type={showCurrent ? "text" : "password"}
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  disabled={passwordBusy || loading}
                />
                <button type="button" className="ps-eye" onClick={() => setShowCurrent(!showCurrent)} aria-label={showCurrent ? "Hide password" : "Show password"}>
                  {showCurrent ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="ps-form-row">
              <div className="ps-field">
                <label htmlFor="ps-new-pw">NEW PASSWORD</label>
                <div className="ps-password-wrap">
                  <input
                    id="ps-new-pw"
                    type={showNew ? "text" : "password"}
                    value={passwords.newPass}
                    onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    disabled={passwordBusy || loading}
                  />
                  <button type="button" className="ps-eye" onClick={() => setShowNew(!showNew)} aria-label={showNew ? "Hide password" : "Show password"}>
                    {showNew ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="ps-field">
                <label htmlFor="ps-confirm-pw">CONFIRM NEW PASSWORD</label>
                <div className="ps-password-wrap">
                  <input
                    id="ps-confirm-pw"
                    type={showConfirm ? "text" : "password"}
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    disabled={passwordBusy || loading}
                  />
                  <button type="button" className="ps-eye" onClick={() => setShowConfirm(!showConfirm)} aria-label={showConfirm ? "Hide password" : "Show password"}>
                    {showConfirm ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="ps-form-footer">
              <button type="submit" className={`ps-btn-save ${passwordSaved ? "saved" : ""}`} disabled={passwordBusy || loading}>
                {passwordBusy ? (
                  "Updating…"
                ) : passwordSaved ? (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Updated
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
