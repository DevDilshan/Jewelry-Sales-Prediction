import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { API_BASE } from "../../config/api";
import "./LandingPage.css";

function IconShield({ className }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconTruck({ className }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function IconReturn({ className }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M3 12a9 9 0 109-9" strokeLinecap="round" />
      <path d="M3 3v6h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSupport({ className }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPin({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconPhone({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconMail({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 6l-10 7L2 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconClock({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HeroJewelArt() {
  return (
    <div className="hero-jewel-art" aria-hidden>
      <svg viewBox="0 0 200 200" className="hero-jewel-svg">
        <defs>
          <linearGradient id="hj-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e8d5a8" />
            <stop offset="50%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#b8960f" />
          </linearGradient>
          <linearGradient id="hj-soft" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f5f0e8" />
            <stop offset="100%" stopColor="#faf8f4" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="88" fill="url(#hj-soft)" stroke="#ebe5d8" strokeWidth="1" />
        <circle cx="100" cy="100" r="72" fill="none" stroke="url(#hj-gold)" strokeWidth="0.75" opacity="0.35" />
        <path
          d="M100 44 L128 92 L100 156 L72 92 Z"
          fill="none"
          stroke="url(#hj-gold)"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
        <path d="M100 56 L118 92 L100 138 L82 92 Z" fill="rgba(212,175,55,0.06)" stroke="url(#hj-gold)" strokeWidth="0.5" />
        <line x1="100" y1="56" x2="100" y2="138" stroke="url(#hj-gold)" strokeWidth="0.4" opacity="0.5" />
        <line x1="82" y1="92" x2="118" y2="92" stroke="url(#hj-gold)" strokeWidth="0.4" opacity="0.5" />
      </svg>
    </div>
  );
}

const FEATURES = [
  { Icon: IconShield, title: "Certified authentic", desc: "Certificate of authenticity with every piece." },
  { Icon: IconTruck, title: "Insured delivery", desc: "Complimentary insured delivery across Sri Lanka." },
  { Icon: IconReturn, title: "30-day returns", desc: "Hassle-free returns within 30 days of purchase." },
  { Icon: IconSupport, title: "Expert support", desc: "Jewelry consultants when you need guidance." },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [showcase, setShowcase] = useState([]);
  const [showcaseLoading, setShowcaseLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/product?forShop=1`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data.filter((p) => p.isActive) : [];
        if (!cancelled) setShowcase(list.slice(0, 4));
      })
      .catch(() => {
        if (!cancelled) setShowcase([]);
      })
      .finally(() => {
        if (!cancelled) setShowcaseLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const scrollToShowcase = () => {
    const el = document.getElementById("showcase");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="landing-page">
      <Navbar />

      <section id="hero" className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">Luxury fine jewelry</div>
          <h1>
            Quiet luxury,
            <br />
            made to last
          </h1>
          <p>
            Beceff brings together refined materials and careful craft. Explore the boutique collection—each piece chosen for
            clarity of line and lasting quality.
          </p>
          <div className="hero-buttons">
            <button type="button" className="btn-primary" onClick={scrollToShowcase}>
              Featured pieces
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate("/shop")}>
              Shop all
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-num">1,200+</span>
              <span className="stat-label">Pieces curated</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="stat-num">5,000+</span>
              <span className="stat-label">Clients served</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="stat-num">4.8 / 5</span>
              <span className="stat-label">Average rating</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-ring-wrapper">
            <HeroJewelArt />
            <div className="hero-glow" />
          </div>
        </div>
      </section>

      <section id="showcase" className="showcase-section">
        <div className="section-intro section-intro--left">
          <span className="section-tag">Featured</span>
          <h2>Four pieces we love right now</h2>
          <p>A snapshot from the shop—updated as the collection evolves.</p>
        </div>

        <div className="showcase-grid">
          {showcaseLoading
            ? Array.from({ length: 4 }, (_, i) => (
                <div key={`sk-${i}`} className="showcase-card showcase-card--skeleton" aria-hidden>
                  <div className="showcase-card-image showcase-skel-img" />
                  <div className="showcase-card-body">
                    <div className="showcase-skel-line showcase-skel-line--lg" />
                    <div className="showcase-skel-line showcase-skel-line--sm" />
                  </div>
                </div>
              ))
            : showcase.length === 0
              ? (
                  <div className="showcase-empty">
                    <p>New arrivals are on the way.</p>
                    <button type="button" className="btn-text-gold" onClick={() => navigate("/shop")}>
                      Open the boutique
                    </button>
                  </div>
                )
              : (
                  showcase.map((p) => (
                    <article key={p._id} className="showcase-card">
                      <button
                        type="button"
                        className="showcase-card-hit"
                        onClick={() => navigate(`/shop/product/${p._id}`)}
                      >
                        <span className="visually-hidden">View {p.productName}</span>
                      </button>
                      <div className="showcase-card-image">
                        {p.productImage ? (
                          <img src={p.productImage} alt="" />
                        ) : (
                          <span className="showcase-card-placeholder" aria-hidden />
                        )}
                      </div>
                      <div className="showcase-card-body">
                        <span className="showcase-card-meta">{p.productCategory}</span>
                        <h3>{p.productName}</h3>
                        <p className="showcase-card-price">
                          {p.compareAtPrice != null && p.compareAtPrice > p.productPrice && (
                            <span className="showcase-price-was">LKR {Number(p.compareAtPrice).toLocaleString()} </span>
                          )}
                          LKR {Number(p.productPrice).toLocaleString()}
                        </p>
                        <span className="showcase-card-cta">View piece</span>
                      </div>
                    </article>
                  ))
                )}
        </div>

        {!showcaseLoading && showcase.length > 0 && (
          <div className="showcase-footer">
            <button type="button" className="btn-outline-dark" onClick={() => navigate("/shop")}>
              Browse the full collection
            </button>
          </div>
        )}
      </section>

      <section className="features-section">
        <div className="features-inner">
          <div className="features-grid">
            {FEATURES.map(({ Icon, title, desc }) => (
              <div key={title} className="feature-card">
                <div className="feature-icon-wrap">
                  <Icon className="feature-icon-svg" />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="about-section">
        <div className="about-content">
          <span className="section-tag">Our story</span>
          <h2>Crafting dreams since 1995</h2>
          <p>
            For nearly three decades, Beceff has been a destination for fine jewelry in Sri Lanka. Master artisans blend
            traditional technique with contemporary restraint—pieces meant to be worn for years, then handed down.
          </p>
          <p>
            Gemstones are ethically sourced and inspected. Settings are finished by hand. The standard is simple: if it is not
            excellent, it does not leave the atelier.
          </p>
          <div className="about-values">
            <div className="value-item">
              <div className="value-num">28+</div>
              <div className="value-label">Years of craft</div>
            </div>
            <div className="value-item">
              <div className="value-num">150+</div>
              <div className="value-label">Artisans</div>
            </div>
            <div className="value-item">
              <div className="value-num">100%</div>
              <div className="value-label">Ethically sourced</div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="contact-section">
        <div className="contact-inner">
          <div className="contact-info">
            <span className="section-tag">Visit</span>
            <h2>Flagship boutique</h2>
            <p>See the collection in person at our Colombo salon.</p>
            <div className="contact-details">
              <div className="contact-item">
                <span className="contact-icon-wrap">
                  <IconPin />
                </span>
                <div>
                  <strong>Address</strong>
                  <p>42 Galle Road, Colombo 03, Sri Lanka</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon-wrap">
                  <IconPhone />
                </span>
                <div>
                  <strong>Phone</strong>
                  <p>+94 11 234 5678</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon-wrap">
                  <IconMail />
                </span>
                <div>
                  <strong>Email</strong>
                  <p>hello@beceff.com</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon-wrap">
                  <IconClock />
                </span>
                <div>
                  <strong>Hours</strong>
                  <p>Mon - Sat: 10 AM - 8 PM</p>
                </div>
              </div>
            </div>
          </div>
          <div className="contact-form-box">
            <h3>Write to us</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Thank you. We will respond shortly.");
              }}
            >
              <div className="cf-row">
                <input type="text" placeholder="Name" required />
                <input type="email" placeholder="Email" required />
              </div>
              <input type="text" placeholder="Subject" />
              <textarea placeholder="Message" rows={4} required />
              <button type="submit" className="btn-submit-contact">
                Send
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="navbar-logo-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1">
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span>Beceff</span>
            </div>
            <p>Fine jewelry in Sri Lanka since 1995.</p>
          </div>
          <div className="footer-links-group">
            <h4>Explore</h4>
            <button type="button" onClick={scrollToShowcase}>
              Featured
            </button>
            <button type="button" onClick={() => navigate("/shop")}>
              Shop
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("about");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              About
            </button>
          </div>
          <div className="footer-links-group">
            <h4>Account</h4>
            <button type="button" onClick={() => navigate("/dashboard")}>
              Dashboard
            </button>
            <button type="button" onClick={() => navigate("/dashboard/orders")}>
              Orders
            </button>
            <button type="button" onClick={() => navigate("/login")}>
              Sign in
            </button>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Beceff. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
