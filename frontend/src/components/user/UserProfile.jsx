import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './UserProfile.css'

export default function ProfileSettings() {
  const navigate = useNavigate()
  const location = useLocation()

  const [profile, setProfile] = useState({
    fullName: 'Eleanor St. James',
    phone: '+94 77 123 4567',
    email: 'eleanor.sj@luxury.com',
  })

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: '',
  })

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)

  const handleSaveProfile = (e) => {
    e.preventDefault()
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2500)
  }

  const handleUpdatePassword = (e) => {
    e.preventDefault()
    setPasswordSaved(true)
    setPasswords({ current: '', newPass: '', confirm: '' })
    setTimeout(() => setPasswordSaved(false), 2500)
  }

  

  const isActive = (path) => location.pathname === path

  return (
    <div className="ps-layout">

      {/* ── Main Content ── */}
      <main className="ps-main">
        <div className="ps-page-header">
          <h1>Profile Settings</h1>
          <p>Manage your personal information and security preferences.</p>
        </div>

        {/* Personal Information */}
        <div className="ps-card">
          <div className="ps-card-header">
            <div>
              <h2>Personal Information</h2>
            </div>
            <span className="ps-card-tag">GENERAL INFO</span>
          </div>

          <form onSubmit={handleSaveProfile} className="ps-form">
            <div className="ps-form-row">
              <div className="ps-field">
                <label>FULL NAME</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  placeholder="Your full name"
                />
              </div>
              <div className="ps-field">
                <label>PHONE NUMBER</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+94 77 000 0000"
                />
              </div>
            </div>

            <div className="ps-field">
              <label>EMAIL ADDRESS</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="your@email.com"
              />
            </div>

            <div className="ps-form-footer">
              <button type="submit" className={`ps-btn-save ${profileSaved ? 'saved' : ''}`}>
                {profileSaved ? (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Saved
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          </form>
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
            <div className="ps-field">
              <label>CURRENT PASSWORD</label>
              <div className="ps-password-wrap">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  placeholder="••••••••••••"
                />
                <button type="button" className="ps-eye" onClick={() => setShowCurrent(!showCurrent)}>
                  {showCurrent ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="ps-form-row">
              <div className="ps-field">
                <label>NEW PASSWORD</label>
                <div className="ps-password-wrap">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={passwords.newPass}
                    onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                    placeholder="Min. 8 characters"
                  />
                  <button type="button" className="ps-eye" onClick={() => setShowNew(!showNew)}>
                    {showNew ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="ps-field">
                <label>CONFIRM NEW PASSWORD</label>
                <div className="ps-password-wrap">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    placeholder="Repeat password"
                  />
                  <button type="button" className="ps-eye" onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="ps-form-footer">
              <button type="submit" className={`ps-btn-save ${passwordSaved ? 'saved' : ''}`}>
                {passwordSaved ? (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Updated
                  </>
                ) : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}