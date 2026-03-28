import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getCustomerToken } from "../../config/api";
import { isOrderFeedbackEligible } from "../../utils/orderStatus";
import "./Feedback.css";

const EMPTY_FORM = { orderId: "", rating: 0, title: "", body: "" };

function StarRating({ value, onChange, size = 24, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div className={`rv-stars ${readonly ? "readonly" : ""}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`rv-star ${n <= display ? "filled" : ""}`}
          style={{ fontSize: size }}
          onClick={() => !readonly && onChange && onChange(n)}
          onMouseEnter={() => !readonly && setHovered(n)}
          onMouseLeave={() => !readonly && setHovered(0)}
          disabled={readonly}
          aria-label={`${n} star`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

const RATING_LABELS = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent" };

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function orderItemsSummary(order) {
  const items = order?.items || [];
  if (items.length === 0) return "Order items";
  const first = items[0]?.product?.productName || "Item";
  if (items.length === 1) return first;
  return `${first} +${items.length - 1} more`;
}

export default function MyReviews() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [myFeedback, setMyFeedback] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [dataLoading, setDataLoading] = useState(() => !!getCustomerToken());

  const load = () => {
    if (!getCustomerToken()) {
      setLoadError("signin");
      setDataLoading(false);
      return;
    }
    setLoadError("");
    setDataLoading(true);
    Promise.all([
      api("/order/my", { auth: "customer" }).then((r) => r.data || []),
      api("/feedback/my", { auth: "customer" }),
    ])
      .then(([o, f]) => {
        setOrders(o);
        setMyFeedback(Array.isArray(f) ? f : []);
      })
      .catch(() => setLoadError("Could not load your data."))
      .finally(() => setDataLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const feedbackOrderIds = useMemo(
    () => new Set(myFeedback.map((fb) => String(fb.order?._id || fb.order || ""))),
    [myFeedback]
  );

  const eligibleOrders = useMemo(
    () =>
      orders.filter(
        (o) => isOrderFeedbackEligible(o.orderStatus) && !feedbackOrderIds.has(String(o._id))
      ),
    [orders, feedbackOrderIds]
  );

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setSubmitError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.orderId || !form.rating || !form.body.trim()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await api("/feedback/create", {
        method: "POST",
        body: {
          orderId: form.orderId,
          title: form.title.trim(),
          feedback: form.body.trim(),
          rating: form.rating,
        },
        auth: "customer",
      });
      setShowModal(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      setSubmitError(err.message || "Could not submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating =
    myFeedback.length > 0
      ? (myFeedback.reduce((s, r) => s + (r.rating || 0), 0) / myFeedback.length).toFixed(1)
      : "—";

  return (
    <div className="rv-layout">
      <main className="rv-main">
        <div className="rv-top-bar">
          <div>
            <h1>My Reviews</h1>
            <p>Share feedback on orders once they are ready for pickup.</p>
            {loadError === "signin" && (
              <p className="rv-auth-hint">
                <button type="button" className="rv-link-btn" onClick={() => navigate("/login?return=/dashboard/feedback")}>
                  Sign in
                </button>{" "}
                to manage reviews.
              </p>
            )}
            {loadError && loadError !== "signin" && <p className="rv-auth-hint error">{loadError}</p>}
          </div>
          <button
            type="button"
            className="rv-add-btn"
            disabled={loadError === "signin" || dataLoading || eligibleOrders.length === 0}
            onClick={openAdd}
            title={eligibleOrders.length === 0 ? "No eligible orders without feedback yet" : ""}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Write a Review
          </button>
        </div>

        {dataLoading && loadError !== "signin" && (
          <p className="rv-data-loading" role="status">
            Loading your orders and reviews…
          </p>
        )}

        {!dataLoading && eligibleOrders.length > 0 && myFeedback.length === 0 && (
          <p className="rv-eligible-hint">
            You have {eligibleOrders.length} order{eligibleOrders.length !== 1 ? "s" : ""} ready for feedback.
          </p>
        )}

        {!dataLoading && myFeedback.length > 0 && (
          <div className="rv-summary">
            <div className="rv-summary-item">
              <span className="rv-summary-num">{myFeedback.length}</span>
              <span className="rv-summary-label">Reviews</span>
            </div>
            <div className="rv-summary-divider" />
            <div className="rv-summary-item">
              <span className="rv-summary-num">{avgRating}</span>
              <span className="rv-summary-label">Avg. Rating</span>
            </div>
            <div className="rv-summary-divider" />
            <div className="rv-summary-item">
              <StarRating value={Math.round(Number(avgRating)) || 0} readonly size={18} />
            </div>
          </div>
        )}

        {!dataLoading && myFeedback.length === 0 && loadError !== "signin" && !loadError ? (
          <div className="rv-empty">
            <div className="rv-empty-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d4c4a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <h3>No reviews yet</h3>
            <p>When an order is marked ready for pickup, you can leave feedback here.</p>
            {eligibleOrders.length > 0 && (
              <button type="button" className="rv-add-btn" onClick={openAdd}>
                Write your first review
              </button>
            )}
          </div>
        ) : (
          !dataLoading &&
          myFeedback.length > 0 && (
            <div className="rv-list">
              {myFeedback.map((review) => {
                const order = review.order;
                return (
                  <div key={review._id} className="rv-card">
                    <div className="rv-card-left">
                      <div className="rv-product-avatar">
                        {order?.items?.[0]?.product?.productImage ? (
                          <img src={order.items[0].product.productImage} alt="" className="rv-thumb" />
                        ) : (
                          <span className="rv-thumb-fallback">✦</span>
                        )}
                      </div>
                    </div>
                    <div className="rv-card-body">
                      <div className="rv-card-top">
                        <div>
                          <span className="rv-product-category">Order feedback</span>
                          <h3 className="rv-product-name">{orderItemsSummary(order)}</h3>
                          <span className="rv-product-sku">#{String(order?._id || "").slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="rv-card-meta">
                          <StarRating value={review.rating} readonly size={18} />
                          <span className="rv-rating-label">{RATING_LABELS[review.rating]}</span>
                          <span className="rv-date">{formatDate(review.createdAt)}</span>
                        </div>
                      </div>
                      {review.title && <h4 className="rv-review-title">{review.title}</h4>}
                      <p className="rv-review-body">{review.feedback}</p>
                      {review.staffReply && (
                        <div className="rv-staff-reply">
                          <strong>Beceff replied</strong>
                          {review.staffReplyAt && (
                            <span className="rv-staff-reply-date">{formatDate(review.staffReplyAt)}</span>
                          )}
                          <p>{review.staffReply}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </main>

      {showModal && (
        <div className="rv-overlay" onClick={() => !submitting && setShowModal(false)}>
          <div className="rv-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rv-modal-header">
              <h2>Write a Review</h2>
              <button type="button" className="rv-modal-close" onClick={() => !submitting && setShowModal(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="rv-modal-form">
              <div className="rv-field">
                <label>SELECT DELIVERED ORDER</label>
                <div className="rv-product-grid">
                  {eligibleOrders.map((o) => {
                    const selected = form.orderId === o._id;
                    return (
                      <button
                        key={o._id}
                        type="button"
                        className={`rv-product-option ${selected ? "selected" : ""}`}
                        onClick={() => setForm({ ...form, orderId: o._id })}
                      >
                        <span className="rv-option-name">{orderItemsSummary(o)}</span>
                        <span className="rv-option-cat">LKR {Number(o.totalAmount).toLocaleString()}</span>
                        <span className="rv-option-cat">#{String(o._id).slice(-8).toUpperCase()}</span>
                        {selected && (
                          <span className="rv-check">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {!form.orderId && <span className="rv-field-hint">Choose the order you want to review</span>}
              </div>

              <div className="rv-field">
                <label>YOUR RATING</label>
                <div className="rv-rating-row">
                  <StarRating value={form.rating} onChange={(n) => setForm({ ...form, rating: n })} size={30} />
                  {form.rating > 0 && <span className="rv-rating-text">{RATING_LABELS[form.rating]}</span>}
                </div>
                {!form.rating && <span className="rv-field-hint">Please select a rating</span>}
              </div>

              <div className="rv-field">
                <label>REVIEW TITLE</label>
                <input
                  type="text"
                  maxLength={80}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Summarise your experience"
                />
              </div>

              <div className="rv-field">
                <label>YOUR REVIEW</label>
                <textarea
                  required
                  rows={4}
                  maxLength={600}
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  placeholder="Quality, packaging, pickup experience…"
                />
                <span className="rv-char-count">{form.body.length} / 600</span>
              </div>

              {submitError && <p className="rv-submit-error">{submitError}</p>}

              <div className="rv-modal-actions">
                <button type="button" className="rv-btn-cancel" disabled={submitting} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="rv-btn-submit" disabled={!form.orderId || !form.rating || submitting}>
                  {submitting ? "Submitting…" : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
