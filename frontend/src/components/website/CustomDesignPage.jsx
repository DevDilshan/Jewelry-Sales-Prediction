import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { apiForm, getCustomerToken } from "../../config/api";
import "./CustomDesignPage.css";

export default function CustomDesignPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const signedIn = !!getCustomerToken();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!signedIn) {
      navigate(`/login?return=${encodeURIComponent("/custom-design")}`);
      return;
    }
    if (!file) {
      setError("Please attach a sketch image (JPEG, PNG, GIF, or WebP).");
      return;
    }
    const desc = description.trim();
    if (!desc) {
      setError("Please describe what you have in mind.");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("sketch", file);
      fd.append("description", desc);
      if (title.trim()) fd.append("title", title.trim().slice(0, 200));
      await apiForm("/custom-design-requests", fd, { auth: "customer" });
      setSuccess(true);
      setTitle("");
      setDescription("");
      setFile(null);
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
          <h1>Bespoke &amp; custom design</h1>
          <p className="cd-lead">
            Share a sketch or reference photo and tell us about your dream piece. Our team will review your request and get
            back to you.
          </p>
        </header>

        {success ? (
          <div className="cd-success">
            <h2>Request received</h2>
            <p>We&apos;ll review your sketch and description and contact you soon.</p>
            <div className="cd-success-actions">
              <Link to="/dashboard/custom-design" className="cd-btn-secondary">
                View my requests
              </Link>
              <Link to="/designers" className="cd-btn-primary">
                Meet our designers
              </Link>
            </div>
          </div>
        ) : (
          <form className="cd-form" onSubmit={onSubmit}>
            {!signedIn && (
              <p className="cd-hint">
                <Link to={`/login?return=${encodeURIComponent("/custom-design")}`}>Sign in</Link> or{" "}
                <Link to={`/register?return=${encodeURIComponent("/custom-design")}`}>create an account</Link> to submit a
                request.
              </p>
            )}

            <label className="cd-label" htmlFor="cd-title">
              Title <span className="cd-optional">(optional)</span>
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
              Description <span className="cd-req">*</span>
            </label>
            <textarea
              id="cd-desc"
              className="cd-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              maxLength={8000}
              required
              placeholder="Metal, stones, style, sizing, occasion, budget range — anything that helps us understand your vision."
            />

            <label className="cd-label" htmlFor="cd-sketch">
              Sketch or reference image <span className="cd-req">*</span>
            </label>
            <div className="cd-file-wrap">
              <input
                id="cd-sketch"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  setError("");
                }}
              />
              <p className="cd-file-hint">JPEG, PNG, GIF, or WebP · up to 8 MB</p>
            </div>

            {error ? <p className="cd-error">{error}</p> : null}

            <button type="submit" className="cd-submit" disabled={busy}>
              {busy ? "Sending…" : "Submit request"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
