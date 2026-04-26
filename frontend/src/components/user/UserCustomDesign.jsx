import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, uploadUrl } from "../../config/api";
import "./UserCustomDesign.css";

const STATUS_LABELS = {
  pending: "Pending",
  in_review: "In review",
  quoted: "Quoted",
  declined: "Declined",
  completed: "Completed",
};

export default function UserCustomDesign() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api("/custom-design-requests/my", { auth: "customer" })
      .then((res) => {
        if (cancelled) return;
        setList(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load your requests.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="user-cd-page">
      <div className="user-cd-header">
        <h1>Custom design requests</h1>
        <p className="user-cd-lead">
          Track bespoke requests you&apos;ve submitted.{" "}
          <Link to="/custom-design">Start a new request</Link> with a sketch anytime.
        </p>
        <Link to="/designers" className="user-cd-link-designers">
          Browse designer portfolios →
        </Link>
      </div>

      {loading && <p className="user-cd-muted">Loading…</p>}
      {error && <p className="user-cd-error">{error}</p>}

      {!loading && !error && list.length === 0 && (
        <div className="user-cd-empty">
          <p>You haven&apos;t submitted a custom design request yet.</p>
          <Link to="/custom-design" className="user-cd-btn">
            Request a custom piece
          </Link>
        </div>
      )}

      {!loading && list.length > 0 && (
        <ul className="user-cd-list">
          {list.map((row) => (
            <li key={row._id} className="user-cd-card">
              <div className="user-cd-card-visual">
                {row.sketchRelPath ? (
                  <img src={uploadUrl(row.sketchRelPath)} alt="" />
                ) : (
                  <span className="user-cd-sketch-ph">✦</span>
                )}
              </div>
              <div className="user-cd-card-body">
                <div className="user-cd-card-top">
                  <h2>{row.title?.trim() || "Custom design"}</h2>
                  <span className={`user-cd-status user-cd-status--${row.status || "pending"}`}>
                    {STATUS_LABELS[row.status] || row.status}
                  </span>
                </div>
                <p className="user-cd-desc">{row.description}</p>
                <p className="user-cd-date">
                  Submitted {row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
