import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "../common/StatCard";
import "./Feedbacks.css";
import { api, getStaffToken } from "../../config/api";

function customerLabel(fb) {
  const c = fb.customer;
  if (c && (c.firstName || c.lastName)) {
    return [c.firstName, c.lastName].filter(Boolean).join(" ");
  }
  return fb.customerName || "Customer";
}

function customerEmail(fb) {
  return fb.customer?.email || "—";
}

function initials(name) {
  const p = (name || "C").split(/\s+/).filter(Boolean);
  const a = (p[0] || "?").charAt(0);
  const b = (p[1] || "").charAt(0);
  return (a + b).toUpperCase().slice(0, 2);
}

const COLORS = ["#e8d5f5", "#fde8d0", "#d5eef5", "#d5f5e3"];

export default function Feedbacks({ setActivePage }) {
  useEffect(() => {
    setActivePage("feedbacks");
  }, [setActivePage]);

  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [list, setList] = useState([]);
  const [stats, setStats] = useState({ total: 0, pendingReply: 0 });
  const [loadError, setLoadError] = useState("");
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyBusy, setReplyBusy] = useState(false);
  const [listLoading, setListLoading] = useState(true);

  const load = () => {
    setLoadError("");
    if (!getStaffToken()) {
      setLoadError("auth");
      setListLoading(false);
      return;
    }
    setListLoading(true);
    Promise.all([
      api("/feedback/stats", { auth: "staff" }).catch(() => null),
      api("/feedback", { auth: "staff" }),
    ])
      .then(([st, rows]) => {
        if (st) setStats(st);
        setList(Array.isArray(rows) ? rows : []);
      })
      .catch((e) => {
        if (e.status === 401 || e.status === 403) setLoadError("forbidden");
        else setLoadError(e.message || "Could not load feedback");
      })
      .finally(() => setListLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const avgRating = useMemo(() => {
    if (list.length === 0) return "—";
    const s = list.reduce((a, r) => a + (r.rating || 0), 0);
    return (s / list.length).toFixed(1);
  }, [list]);

  const filteredReviews = list.filter((review) => {
    const name = customerLabel(review).toLowerCase();
    const email = customerEmail(review).toLowerCase();
    const text = `${review.title || ""} ${review.feedback || ""}`.toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || name.includes(q) || email.includes(q) || text.includes(q);
    const r = review.rating;
    if (filterType === "all") return matchesSearch;
    if (filterType === "5") return r === 5 && matchesSearch;
    if (filterType === "4") return r === 4 && matchesSearch;
    if (filterType === "3") return r === 3 && matchesSearch;
    if (filterType === "below3") return r < 3 && matchesSearch;
    return matchesSearch;
  });

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < rating ? "filled" : "empty"}`}>
        ★
      </span>
    ));

  const openReply = (fb) => {
    setReplyModal(fb);
    setReplyText(fb.staffReply || "");
  };

  const submitReply = async () => {
    if (!replyModal?._id || !replyText.trim()) return;
    setReplyBusy(true);
    try {
      await api(`/feedback/${replyModal._id}/reply`, {
        method: "PATCH",
        body: { staffReply: replyText.trim() },
        auth: "staff",
      });
      setReplyModal(null);
      setReplyText("");
      load();
    } catch (err) {
      alert(err.message || "Could not save reply");
    } finally {
      setReplyBusy(false);
    }
  };

  return (
    <div className="feedbacks-page">
      <div className="page-header">
        <div>
          <h1>Customer Feedbacks &amp; Reviews</h1>
          <p>Read feedback from customers after orders are ready and reply when needed.</p>
        </div>
      </div>

      {loadError === "auth" && (
        <p className="fb-banner">
          <Link to="/admin/login">Sign in</Link> to view feedback.
        </p>
      )}
      {loadError === "forbidden" && <p className="fb-banner error">You don&apos;t have access to this page.</p>}
      {loadError && loadError !== "auth" && loadError !== "forbidden" && <p className="fb-banner error">{loadError}</p>}

      <div className="stats-grid">
        <StatCard
          title="Average Rating"
          value={avgRating}
          extra="★★★★★"
          change={`${stats.total} total reviews`}
          changeType="positive"
        />
        <StatCard
          title="Total Reviews"
          value={String(stats.total)}
          change={`${stats.pendingReply} awaiting reply`}
          changeType="positive"
        />
        <StatCard title="Response rate" value={stats.total ? `${Math.round(((stats.total - stats.pendingReply) / stats.total) * 100)}%` : "—"} change="Replied vs pending" changeType="positive" />
      </div>

      <div className="feedbacks-section">
        <div className="feedbacks-header">
          <div className="search-box-fb">
            <svg className="search-icon-fb" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search by customer or review text..."
              className="search-input-fb"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-buttons">
            {["all", "5", "4", "3", "below3"].map((f) => (
              <button
                key={f}
                type="button"
                className={`filter-btn ${filterType === f ? "active" : ""}`}
                onClick={() => setFilterType(f)}
              >
                {f === "all" ? "All" : f === "below3" ? "Below 3" : `${f} Stars`}
              </button>
            ))}
          </div>
        </div>

        <table className="reviews-table">
          <thead>
            <tr>
              <th>CUSTOMER</th>
              <th>RATING</th>
              <th>DATE</th>
              <th>REVIEW</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {listLoading ? (
              <tr>
                <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "#888" }}>
                  Loading feedback…
                </td>
              </tr>
            ) : filteredReviews.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "#888" }}>
                  No feedback matches your filters.
                </td>
              </tr>
            ) : (
              filteredReviews.map((review, idx) => {
                const name = customerLabel(review);
                const hasReply = !!(review.staffReply && String(review.staffReply).trim());
                const bg = COLORS[idx % COLORS.length];
                return (
                  <tr key={review._id}>
                    <td>
                      <div className="customer-info">
                        <div className="avatar-fb" style={{ background: bg, color: "#333" }}>
                          {initials(name)}
                        </div>
                        <div>
                          <p className="customer-name">{name}</p>
                          <p className="customer-email">{customerEmail(review)}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="rating">{renderStars(review.rating)}</div>
                    </td>
                    <td className="date-cell">{new Date(review.createdAt).toLocaleDateString()}</td>
                    <td>
                      <p className="review-text">{(review.title ? `${review.title} — ` : "") + (review.feedback || "").slice(0, 80)}…</p>
                    </td>
                    <td>
                      <span className={`fb-status-badge ${hasReply ? "replied" : "pending"}`}>{hasReply ? "Replied" : "Pending"}</span>
                    </td>
                    <td>
                      <div className="actions">
                        <button type="button" className={`action-btn ${hasReply ? "replied" : "reply"}`} onClick={() => openReply(review)}>
                          {hasReply ? "Edit reply" : "Reply"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className="pagination">
          <span className="pagination-info">
            {listLoading ? (
              "Loading…"
            ) : (
              <>
                Showing <strong>{filteredReviews.length}</strong> of <strong>{list.length}</strong> reviews
              </>
            )}
          </span>
        </div>
      </div>

      {replyModal && (
        <div className="fb-modal-overlay" onClick={() => !replyBusy && setReplyModal(null)}>
          <div className="fb-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fb-modal-header">
              <h2>{replyModal.staffReply ? "Update reply" : "Reply to customer"}</h2>
              <button type="button" className="fb-modal-close" onClick={() => !replyBusy && setReplyModal(null)}>
                ✕
              </button>
            </div>
            <div className="fb-modal-body">
              <p className="fb-modal-meta">
                <strong>{customerLabel(replyModal)}</strong> · {renderStars(replyModal.rating)}{" "}
                <span className="fb-modal-date">{new Date(replyModal.createdAt).toLocaleString()}</span>
              </p>
              {replyModal.title && <p className="fb-modal-title">{replyModal.title}</p>}
              <p className="fb-modal-review">{replyModal.feedback}</p>
              <label className="fb-modal-label">Your reply (visible to the customer)</label>
              <textarea
                className="fb-modal-textarea"
                rows={5}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Thank them and address any points they raised…"
                required
              />
            </div>
            <div className="fb-modal-actions">
              <button type="button" className="fb-btn-cancel" disabled={replyBusy} onClick={() => setReplyModal(null)}>
                Cancel
              </button>
              <button type="button" className="fb-btn-submit" disabled={replyBusy || !replyText.trim()} onClick={submitReply}>
                {replyBusy ? "Saving…" : "Send reply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
