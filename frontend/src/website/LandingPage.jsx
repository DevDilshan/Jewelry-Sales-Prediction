import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import './LandingPage.css'

export default function LandingPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleNotify = (e) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
      setEmail('')
    }
  }

  const pillars = [
    {
      title: 'Handcrafted Mastery',
      desc: 'Every piece shaped by artisans with decades of experience in fine jewelry.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
    },
    {
      title: 'Ethically Sourced',
      desc: 'Gemstones and metals traced to responsible, certified origins worldwide.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      ),
    },
    {
      title: 'Certified Authentic',
      desc: 'Each creation accompanied by a full certificate of origin and quality.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="6"/>
          <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
        </svg>
      ),
    },
    {
      title: 'Bespoke Service',
      desc: 'Personal consultants to guide every step of your journey with us.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      ),
    },
  ]

  return (
    <div className="landing-page">
      <Navbar />

      {/* ── Hero / Coming Soon ── */}
      <section id="hero" className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            ✦ BECEFF FINE JEWELRY
          </div>

          <h1>
            Something<br />
            <em>Extraordinary</em><br />
            Is Coming
          </h1>

          <p>
            We're crafting a new digital home for our luxury collection — one as refined and timeless as the pieces within. Our boutique opens its doors online very soon.
          </p>

          {/* Countdown */}
          <div className="hero-stats">
            {[['28', 'Days'], ['14', 'Hours'], ['36', 'Minutes'], ['52', 'Seconds']].map(([num, label], i, arr) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                <div className="hero-stat">
                  <span className="stat-num">{num}</span>
                  <span className="stat-label">{label}</span>
                </div>
                {i < arr.length - 1 && <div className="hero-stat-divider" />}
              </div>
            ))}
          </div>

          {/* Email capture */}
          <div className="hero-buttons" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
            {submitted ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 24px', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.35)', borderRadius: 50 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span style={{ color: '#c9a84c', fontSize: 14, fontWeight: 500 }}>
                  You're on the list. We'll be in touch soon.
                </span>
              </div>
            ) : (
              <form onSubmit={handleNotify} style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 460 }}>
                <input
                  type="email"
                  required
                  placeholder="Enter your email for early access"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '14px 20px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 8,
                    color: 'inherit',
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                  }}
                />
                <button type="submit" className="btn-primary">Notify Me</button>
              </form>
            )}
            <p style={{ fontSize: 12, opacity: 0.4, margin: 0, paddingLeft: 4 }}>
              No spam. Early access &amp; exclusive previews only.
            </p>
          </div>
        </div>

        {/* Ring visual */}
        <div className="hero-visual">
          <div className="hero-ring-wrapper">
            <div className="hero-ring" style={{ fontSize: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 240 240" width="220" height="220" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Band */}
                <circle cx="120" cy="145" r="74" stroke="#c9a84c" strokeWidth="12" fill="none"/>
                <circle cx="120" cy="145" r="64" stroke="rgba(201,168,76,0.25)" strokeWidth="1" fill="none" strokeDasharray="4 6"/>
                {/* Setting */}
                <rect x="96" y="52" width="48" height="28" rx="5" stroke="#c9a84c" strokeWidth="6" fill="rgba(0,0,0,0.4)"/>
                <path d="M100 54 L96 80 M144 54 L148 80" stroke="#c9a84c" strokeWidth="4"/>
                {/* Main diamond */}
                <polygon points="120,20 130,40 152,43 136,58 140,80 120,68 100,80 104,58 88,43 110,40" fill="#c9a84c"/>
                <polygon points="120,27 128,42 146,44 132,57 136,73 120,63 104,73 108,57 94,44 112,42" fill="#f5e6b8"/>
                <polygon points="120,33 126,44 140,46 129,56 132,68 120,61 108,68 111,56 100,46 114,44" fill="white" opacity="0.55"/>
                {/* Shine */}
                <circle cx="113" cy="34" r="4" fill="white" opacity="0.5"/>
                <circle cx="122" cy="29" r="2" fill="white" opacity="0.35"/>
                {/* Side stones */}
                <polygon points="84,58 88,50 93,58 88,66" fill="#c9a84c" opacity="0.8"/>
                <polygon points="156,58 152,50 147,58 152,66" fill="#c9a84c" opacity="0.8"/>
                <polygon points="74,64 77,57 80,64 77,71" fill="#c9a84c" opacity="0.5"/>
                <polygon points="166,64 163,57 160,64 163,71" fill="#c9a84c" opacity="0.5"/>
              </svg>
            </div>
            <div className="hero-glow"></div>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.25), transparent)' }} />

      {/* ── What to Expect ── */}
      <section className="features-section">
        <div className="section-intro" style={{ textAlign: 'center', marginBottom: 48 }}>
          <span className="section-tag">WHAT TO EXPECT</span>
          <h2 style={{ marginTop: 12 }}>A New Standard in Fine Jewelry</h2>
          <p>Everything we've perfected in person, now brought to your screen.</p>
        </div>
        <div className="features-grid">
          {pillars.map((p, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{p.icon}</div>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

    

      {/* ── Contact ── */}
      <section id="contact" className="contact-section">
        <div className="contact-inner">
          <div className="contact-info">
            <span className="section-tag">FIND US</span>
            <h2>Visit Our Boutique</h2>
            <p>
              While our online store is under construction, our physical boutique remains open and welcoming you daily.
            </p>
            <div className="contact-details">
              {[
                {
                  label: 'Address', value: '42 Galle Road, Colombo 03, Sri Lanka',
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                },
                {
                  label: 'Phone', value: '+94 11 234 5678',
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                },
                {
                  label: 'Email', value: 'hello@beceff.lk',
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                },
                {
                  label: 'Hours', value: 'Mon – Sat: 10 AM – 8 PM',
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                },
              ].map((item, i) => (
                <div key={i} className="contact-item">
                  <span className="contact-icon">{item.icon}</span>
                  <div>
                    <strong>{item.label}</strong>
                    <p>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="contact-form-box">
            <h3>Request a Private Preview</h3>
            <form onSubmit={(e) => { e.preventDefault(); alert('Thank you. Our team will reach out shortly with exclusive access details.') }}>
              <div className="cf-row">
                <input type="text" placeholder="Your Name" required />
                <input type="email" placeholder="Email Address" required />
              </div>
              <input type="text" placeholder="What interests you most? (e.g. Rings, custom pieces)" />
              <textarea placeholder="Tell us what you're looking for..." rows="4" required></textarea>
              <button type="submit" className="btn-submit-contact">Request Preview Access</button>
            </form>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="navbar-logo-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span>BECEFF</span>
            </div>
            <p>Sri Lanka's premier destination for luxury fine jewelry since 1995. Launching online soon.</p>
          </div>
          <div className="footer-links-group">
            <h4>Discover</h4>
            <button onClick={() => { const el = document.getElementById('about'); if (el) el.scrollIntoView({ behavior: 'smooth' }) }}>Our Story</button>
            <button onClick={() => { const el = document.getElementById('contact'); if (el) el.scrollIntoView({ behavior: 'smooth' }) }}>Visit Boutique</button>
            <button onClick={() => { const el = document.getElementById('contact'); if (el) el.scrollIntoView({ behavior: 'smooth' }) }}>Private Preview</button>
          </div>
          <div className="footer-links-group">
            <h4>Account</h4>
            <button onClick={() => navigate('/dashboard')}>My Dashboard</button>
            <button onClick={() => navigate('/dashboard/orders')}>My Orders</button>
            <button onClick={() => navigate('/dashboard/wishlist')}>Wishlist</button>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 BECEFF Fine Jewelry. All rights reserved. · Launching soon.</p>
        </div>
      </footer>
    </div>
  )
}