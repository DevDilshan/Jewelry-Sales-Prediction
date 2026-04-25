import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api, getCustomerToken, setCustomerAuth } from "../../config/api";
import {
  isPasswordPolicyValid,
  PASSWORD_REQUIREMENTS_HINT,
} from "../../utils/passwordPolicy";
import {
  validateCustomerProfileForm,
  toLkMobileTenDigits,
} from "../../utils/customerProfileValidation";
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
    address: "",
  });

  const [profileFieldErrors, setProfileFieldErrors] = useState({});

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
          phone: toLkMobileTenDigits(data.phone || ""),
          email: data.email || "",
          address: data.address || "",
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

  const mapServerProfileErrors = (errors) => {
    if (!errors || typeof errors !== "object") return {};
    const out = { ...errors };
    delete out.email;
    if (out.firstName || out.lastName) {
      out.fullName = out.firstName || out.lastName;
      delete out.firstName;
      delete out.lastName;
    }
    return out;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileFieldErrors({});
    setProfileSaved(false);
    const { firstName, lastName } = splitFullName(profile.fullName);
    const { ok, errors } = validateCustomerProfileForm(profile);
    if (!ok) {
      setProfileFieldErrors(errors);
      return;
    }
    setProfileBusy(true);
    try {
      const data = await api("/customer/me", {
        method: "PATCH",
        body: {
          firstName,
          lastName,
          phone: toLkMobileTenDigits(profile.phone),
          address: profile.address.trim(),
        },
        auth: "customer",
      });
      setProfile({
        fullName: [data.firstName, data.lastName].filter(Boolean).join(" ").trim(),
        phone: toLkMobileTenDigits(data.phone || ""),
        email: data.email || "",
        address: data.address || "",
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
      setProfileFieldErrors({});
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err) {
      const serverErrors = mapServerProfileErrors(err.data?.errors);
      if (Object.keys(serverErrors).length > 0) {
        setProfileFieldErrors(serverErrors);
        setProfileError("");
      } else {
        setProfileError(err.message || "Could not save profile.");
      }
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
              {profileError ? <p className="ps-inline-error">{profileError}</p> : null}
              <div className="ps-form-row">
                <div className="ps-field">
                  <label htmlFor="ps-fullname">FULL NAME</label>
                  <input
                    id="ps-fullname"
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => {
                      setProfileFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.fullName;
                        return next;
                      });
                      setProfile({ ...profile, fullName: e.target.value });
                    }}
                    placeholder="Your full name"
                    autoComplete="name"
                    disabled={profileBusy}
                    maxLength={121}
                    className={profileFieldErrors.fullName ? "ps-input-invalid" : ""}
                    aria-invalid={Boolean(profileFieldErrors.fullName)}
                    aria-describedby={profileFieldErrors.fullName ? "ps-fullname-err" : undefined}
                  />
                  {profileFieldErrors.fullName && (
                    <p id="ps-fullname-err" className="ps-field-error" role="alert">
                      {profileFieldErrors.fullName}
                    </p>
                  )}
                </div>

                <div className="ps-field">
                  <label htmlFor="ps-phone">MOBILE NUMBER</label>
                  <input
                    id="ps-phone"
                    type="tel"
                    inputMode="numeric"
                    value={profile.phone}
                    onChange={(e) => {
                      setProfileFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.phone;
                        return next;
                      });
                      setProfile({ ...profile, phone: toLkMobileTenDigits(e.target.value) });
                    }}
                    placeholder="0712345678"
                    autoComplete="tel"
                    disabled={profileBusy}
                    maxLength={15}
                    className={profileFieldErrors.phone ? "ps-input-invalid" : ""}
                    aria-invalid={Boolean(profileFieldErrors.phone)}
                    aria-describedby={profileFieldErrors.phone ? "ps-phone-err" : "ps-phone-hint"}
                  />
                  {profileFieldErrors.phone ? (
                    <p id="ps-phone-err" className="ps-field-error" role="alert">
                      {profileFieldErrors.phone}
                    </p>
                  ) : (
                    <p id="ps-phone-hint" className="ps-field-hint">
                      10 digits, Sri Lankan format starting with 07 (e.g. 071, 077). You can paste +94… and it will be normalized.
                    </p>
                  )}
                </div>
              </div>

              <div className="ps-field">
                <span className="ps-field-label-text" id="ps-email-label">
                  EMAIL ADDRESS
                </span>
                <div
                  className="ps-readonly-value"
                  aria-labelledby="ps-email-label"
                  title={profile.email}
                >
                  {profile.email || "—"}
                </div>
                <p className="ps-field-hint">Email is fixed to your account and cannot be changed here.</p>
              </div>

              <div className="ps-field">
                <label htmlFor="ps-address">SHIPPING / CONTACT ADDRESS</label>
                <textarea
                  id="ps-address"
                  value={profile.address}
                  onChange={(e) => {
                    setProfileFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.address;
                      return next;
                    });
                    setProfile({ ...profile, address: e.target.value });
                  }}
                  placeholder="Street, city, postal code, country"
                  autoComplete="street-address"
                  disabled={profileBusy}
                  rows={4}
                  maxLength={2000}
                  className={profileFieldErrors.address ? "ps-input-invalid" : ""}
                  aria-invalid={Boolean(profileFieldErrors.address)}
                  aria-describedby={
                    profileFieldErrors.address ? "ps-address-err" : "ps-address-hint"
                  }
                />
                <div className="ps-address-meta">
                  {profileFieldErrors.address ? (
                    <p id="ps-address-err" className="ps-field-error" role="alert">
                      {profileFieldErrors.address}
                    </p>
                  ) : (
                    <p id="ps-address-hint" className="ps-field-hint">
                      Required. Street, city, postal code, and country (up to 2000 characters).
                    </p>
                  )}
                  <span className="ps-char-count">{profile.address.length}/2000</span>
                </div>
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
