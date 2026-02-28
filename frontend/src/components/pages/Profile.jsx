import { useEffect, useState } from 'react'
import './Profile.css'

export default function Profile({ setActivePage }) {
  useEffect(() => {
    setActivePage('profile')
  }, [setActivePage])

  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSaveChanges = () => {
    alert('Profile changes saved!')
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <div>
          <h1>My Profile</h1>
          <p>MANAGE YOUR PERSONAL ACCOUNT SETTINGS</p>
        </div>
        <button className="notification-btn"></button>
      </div>

      <div className="profile-container">
        {/* Profile Details Section */}
        <div className="profile-section">
          <div className="section-content">
            <div className="profile-avatar-section">
              <div className="profile-avatar">NS</div>
            </div>

            <div className="profile-details">
              <h2>Profile Details</h2>
              <p>Basic information about your admin account</p>

              <div className="form-group">
                <label>USERNAME</label>
                <input
                  type="text"
                  defaultValue="nayomi.s"
                  className="form-input"
                  readOnly
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>ROLE</label>
                  <input
                    type="text"
                    defaultValue="Admin"
                    className="form-input"
                    readOnly
                  />
                </div>
              </div>

              <div className="form-group">
                <label>EMAIL ADDRESS</label>
                <input
                  type="email"
                  defaultValue="nayomi.s@gmail.com"
                  className="form-input"
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Section */}
    <div className="profile-section">
    <div className="section-content">
    <h2>Change Password</h2>

    <div className="form-group">
      <label>NEW PASSWORD</label>
      <div className="password-input-group">
        <input
          type={showNewPassword ? 'text' : 'password'}
          placeholder="Minimum 8 characters"
          className="form-input"
        />
        <button
          className="toggle-password"
          onClick={() => setShowNewPassword(!showNewPassword)}
        >
          {showNewPassword ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          )}
        </button>
      </div>
    </div>

    <div className="form-group">
      <label>CONFIRM NEW PASSWORD</label>
      <div className="password-input-group">
        <input
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Repeat new password"
          className="form-input"
        />
        <button
          className="toggle-password"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          )}
        </button>
      </div>
    </div>

    <button className="save-btn" onClick={handleSaveChanges}>
      SAVE CHANGES
    </button>
  </div>
</div>
      </div>
    </div>
  )
}
