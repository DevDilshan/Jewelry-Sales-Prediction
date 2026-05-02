import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import { api, getCustomerToken } from "../../config/api";
import "./CustomDesignPage.css";

const DESIGN_IDEAS = [
  "Engagement ring with custom engraving",
  "Gold necklace with birthstone pendant",
  "Matching bridal jewellery set",
  "Custom bracelet with family initials",
];

export default function CustomDesignPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const signedIn = !!getCustomerToken();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const n = name.trim();
    const em = email.trim();
    const desc = description.trim();
    if (!n || n.length < 2) {
      setError("Please enter your name (at least 2 characters).");
      return;
    }
    if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!desc) {
      setError("Please describe what you have in mind.");
      return;
    }
    setBusy(true);
    try {
      await api("/custom-design-requests/inquiry", {
        method: "POST",
        body: {
          name: n,
          email: em,
          phone: phone.trim() || undefined,
          description: desc,
          budget: budget.trim() || undefined,
          title: title.trim().slice(0, 200) || undefined,
        },
      });
      setSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setTitle("");
      setDescription("");
      setBudget("");
    } catch (err) {
      setError(err.message || "Could not submit your request.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="shop-page cd-page">
      <Navbar />
      <div className="shop-inner cd-inner">
        <header className="cd-header">
          <h1>Request a custom design</h1>
          <p className="cd-lead">
            Tell us about your vision — metal, stones, style, and budget. Our design team will reply within a couple of
            business days. No account required.
          </p>
        </header>

        {success ? (
          <div className="cd-success">
            <h2>Request sent</h2>
            <p>Thank you! We&apos;ll reach out using the email you provided.</p>
            <div className="cd-success-actions">
              {signedIn ? (
                <Link to="/dashboard/custom-design" className="cd-btn-secondary">
                  View my requests
                </Link>
              ) : null}
              <Link to="/designers" className="cd-btn-primary">
                Meet our designers
              </Link>
            </div>
          </div>
        ) : (
          <form className="cd-form" onSubmit={onSubmit}>
            {signedIn && (
              <p className="cd-hint">
                You&apos;re signed in — you can also{" "}
                <Link to="/dashboard/custom-design">track requests in your account</Link>.
              </p>
            )}

            <p className="cd-section-label">Popular requests</p>
            <div className="cd-chips">
              {DESIGN_IDEAS.map((idea) => (
                <button key={idea} type="button" className="cd-chip" onClick={() => setDescription(idea)}>
                  {idea}
                </button>
              ))}
            </div>

            <label className="cd-label" htmlFor="cd-name">
              Your name <span className="cd-req">*</span>
            </label>
            <input
              id="cd-name"
              type="text"
              className="cd-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={200}
              autoComplete="name"
              placeholder="e.g. Amali Perera"
            />

            <label className="cd-label" htmlFor="cd-email">
              Email <span className="cd-req">*</span>
            </label>
            <input
              id="cd-email"
              type="email"
              className="cd-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={320}
              autoComplete="email"
              placeholder="you@example.com"
            />

            <label className="cd-label" htmlFor="cd-phone">
              Phone <span className="cd-optional">(optional)</span>
            </label>
            <input
              id="cd-phone"
              type="tel"
              className="cd-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={40}
              autoComplete="tel"
              placeholder="+94 77 000 0000"
            />

            <label className="cd-label" htmlFor="cd-title">
              Short title <span className="cd-optional">(optional)</span>
            </label>
            <input
              id="cd-title"
              type="text"
              className="cd-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              placeholder="e.g. Rose gold engagement ring with sapphire"
            />

            <label className="cd-label" htmlFor="cd-desc">
              Describe your design <span className="cd-req">*</span>
            </label>
            <textarea
              id="cd-desc"
              className="cd-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              maxLength={8000}
              required
              placeholder="Metal, stones, style, sizing, occasion — anything that helps us understand your vision."
            />

            <label className="cd-label" htmlFor="cd-budget">
              Approximate budget (LKR) <span className="cd-optional">(optional)</span>
            </label>
            <input
              id="cd-budget"
              type="text"
              className="cd-input"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              maxLength={500}
              placeholder="e.g. 50,000 – 100,000"
            />

            {error ? <p className="cd-error">{error}</p> : null}

            <button type="submit" className="cd-submit" disabled={busy}>
              {busy ? "Sending…" : "Send request"}
            </button>
            <p className="cd-footnote">No payment is required at this stage.</p>
          </form>
        )}
      </div>
    </div>
  );
}
