import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './Feedback.css'


const PRODUCTS = [
  { id: 1, name: 'Solitaire Diamond Ring', category: 'Rings', sku: 'AUR-RI-001' },
  { id: 2, name: 'Heritage Gold Necklace', category: 'Necklaces', sku: 'AUR-NE-042' },
  { id: 3, name: 'Luna Pearl Earrings', category: 'Earrings', sku: 'AUR-EA-105' },
  { id: 4, name: 'Majesty Gold Bracelet', category: 'Bracelets', sku: 'AUR-BR-018' },
  { id: 5, name: 'Prestige Sapphire Ring', category: 'Rings', sku: 'AUR-RI-077' },
  { id: 6, name: 'Emerald Tennis Bracelet', category: 'Bracelets', sku: 'AUR-BR-034' },
]

const EMPTY_FORM = { productId: '', rating: 0, title: '', body: '' }

function StarRating({ value, onChange, size = 24, readonly = false }) {
  const [hovered, setHovered] = useState(0)
  const display = hovered || value
  return (
    <div className={`rv-stars ${readonly ? 'readonly' : ''}`}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          className={`rv-star ${n <= display ? 'filled' : ''}`}
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
  )
}

const RATING_LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' }

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function MyReviews() {
  const navigate = useNavigate()
  const location = useLocation()

  const [reviews, setReviews] = useState([
    {
      id: 1,
      productId: 1,
      rating: 5,
      title: 'Absolutely stunning piece',
      body: 'The craftsmanship on this ring is beyond anything I\'ve seen. The diamond catches light beautifully and the setting is flawless. Gifted this to my partner and she was speechless.',
      date: '2024-11-20T10:30:00Z',
    },
    {
      id: 2,
      productId: 3,
      rating: 4,
      title: 'Elegant and timeless',
      body: 'The pearl earrings are delicate and sophisticated. Packaging was lovely. Slight delay in delivery but the product itself is worth every rupee.',
      date: '2024-12-05T14:15:00Z',
    },
  ])

  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [hoverRating, setHoverRating] = useState(0)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const isActive = (path) => location.pathname === path

  const openAdd = () => {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = (review) => {
    setEditTarget(review.id)
    setForm({ productId: review.productId, rating: review.rating, title: review.title, body: review.body })
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.productId || !form.rating) return
    if (editTarget !== null) {
      setReviews(reviews.map(r => r.id === editTarget ? { ...r, ...form, date: new Date().toISOString() } : r))
    } else {
      setReviews([{ id: Date.now(), ...form, date: new Date().toISOString() }, ...reviews])
    }
    setShowModal(false)
  }

  const handleDelete = () => {
    setReviews(reviews.filter(r => r.id !== deleteConfirm))
    setDeleteConfirm(null)
  }

  const getProduct = (id) => PRODUCTS.find(p => p.id === Number(id))

  const reviewedProductIds = reviews.filter(r => editTarget ? r.id !== editTarget : true).map(r => r.productId)

  return (
    <div className="rv-layout">

      {/* Main */}
      <main className="rv-main">
        <div className="rv-top-bar">
          <div>
            <h1>My Reviews</h1>
            <p>Share your experience with our jewelry pieces.</p>
          </div>
          <button className="rv-add-btn" onClick={openAdd}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Write a Review
          </button>
        </div>

        {/* Summary strip */}
        {reviews.length > 0 && (
          <div className="rv-summary">
            <div className="rv-summary-item">
              <span className="rv-summary-num">{reviews.length}</span>
              <span className="rv-summary-label">Total Reviews</span>
            </div>
            <div className="rv-summary-divider" />
            <div className="rv-summary-item">
              <span className="rv-summary-num">
                {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}
              </span>
              <span className="rv-summary-label">Avg. Rating</span>
            </div>
            <div className="rv-summary-divider" />
            <div className="rv-summary-item">
              <StarRating value={Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length)} readonly size={18} />
            </div>
          </div>
        )}

        {/* Review cards */}
        {reviews.length === 0 ? (
          <div className="rv-empty">
            <div className="rv-empty-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d4c4a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <h3>No reviews yet</h3>
            <p>Share your thoughts on the jewelry you've purchased.</p>
            <button className="rv-add-btn" onClick={openAdd}>Write your first review</button>
          </div>
        ) : (
          <div className="rv-list">
            {reviews.map(review => {
              const product = getProduct(review.productId)
              return (
                <div key={review.id} className="rv-card">
                  <div className="rv-card-left">
                    <div className="rv-product-avatar">
                      <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="30" cy="34" r="14" stroke="#c9a84c" strokeWidth="3" fill="none"/>
                        <rect x="23" y="14" width="14" height="8" rx="2" stroke="#c9a84c" strokeWidth="2" fill="none"/>
                        <path d="M25 14 L23 22 M35 14 L37 22" stroke="#c9a84c" strokeWidth="1.5"/>
                        <polygon points="30,7 33,13 39,14 35,19 36,25 30,22 24,25 25,19 21,14 27,13" fill="#c9a84c" opacity="0.85"/>
                        <polygon points="30,10 32,14 37,15 33,18 34,23 30,21 26,23 27,18 23,15 28,14" fill="#f5e6b8"/>
                      </svg>
                    </div>
                  </div>

                  <div className="rv-card-body">
                    <div className="rv-card-top">
                      <div>
                        <span className="rv-product-category">{product?.category}</span>
                        <h3 className="rv-product-name">{product?.name}</h3>
                        <span className="rv-product-sku">{product?.sku}</span>
                      </div>
                      <div className="rv-card-meta">
                        <StarRating value={review.rating} readonly size={18} />
                        <span className="rv-rating-label">{RATING_LABELS[review.rating]}</span>
                        <span className="rv-date">{formatDate(review.date)}</span>
                      </div>
                    </div>

                    <h4 className="rv-review-title">{review.title}</h4>
                    <p className="rv-review-body">{review.body}</p>

                    <div className="rv-card-footer">
                      <button className="rv-action-btn edit" onClick={() => openEdit(review)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        EDIT
                      </button>
                      <button className="rv-action-btn delete" onClick={() => setDeleteConfirm(review.id)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                        DELETE
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="rv-overlay" onClick={() => setShowModal(false)}>
          <div className="rv-modal" onClick={e => e.stopPropagation()}>
            <div className="rv-modal-header">
              <h2>{editTarget ? 'Edit Review' : 'Write a Review'}</h2>
              <button className="rv-modal-close" onClick={() => setShowModal(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="rv-modal-form">
              {/* Product selector */}
              <div className="rv-field">
                <label>SELECT PRODUCT</label>
                <div className="rv-product-grid">
                  {PRODUCTS.map(p => {
                    const alreadyReviewed = reviewedProductIds.includes(p.id)
                    const selected = Number(form.productId) === p.id
                    return (
                      <button
                        key={p.id}
                        type="button"
                        className={`rv-product-option ${selected ? 'selected' : ''} ${alreadyReviewed ? 'disabled' : ''}`}
                        onClick={() => !alreadyReviewed && setForm({ ...form, productId: p.id })}
                        disabled={alreadyReviewed}
                        title={alreadyReviewed ? 'Already reviewed' : ''}
                      >
                        <span className="rv-option-name">{p.name}</span>
                        <span className="rv-option-cat">{p.category}</span>
                        {alreadyReviewed && <span className="rv-reviewed-badge">Reviewed</span>}
                        {selected && (
                          <span className="rv-check">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
                {!form.productId && <span className="rv-field-hint">Please select a product to review</span>}
              </div>

              {/* Rating */}
              <div className="rv-field">
                <label>YOUR RATING</label>
                <div className="rv-rating-row">
                  <StarRating
                    value={form.rating}
                    onChange={(n) => setForm({ ...form, rating: n })}
                    size={30}
                  />
                  {form.rating > 0 && (
                    <span className="rv-rating-text">{RATING_LABELS[form.rating]}</span>
                  )}
                </div>
                {!form.rating && <span className="rv-field-hint">Please select a rating</span>}
              </div>

              {/* Title */}
              <div className="rv-field">
                <label>REVIEW TITLE</label>
                <input
                  type="text"
                  required
                  maxLength={80}
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Summarise your experience in a few words"
                />
              </div>

              {/* Body */}
              <div className="rv-field">
                <label>YOUR REVIEW</label>
                <textarea
                  required
                  rows={4}
                  maxLength={600}
                  value={form.body}
                  onChange={e => setForm({ ...form, body: e.target.value })}
                  placeholder="Tell us more about the quality, packaging, and your overall experience..."
                />
                <span className="rv-char-count">{form.body.length} / 600</span>
              </div>

              <div className="rv-modal-actions">
                <button type="button" className="rv-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="rv-btn-submit" disabled={!form.productId || !form.rating}>
                  {editTarget ? 'Save Changes' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="rv-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="rv-modal rv-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="rv-modal-header">
              <h2>Delete Review</h2>
              <button className="rv-modal-close" onClick={() => setDeleteConfirm(null)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="rv-confirm-body">
              <div className="rv-confirm-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#e05c5c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <p>Are you sure you want to delete your review for <strong>{getProduct(reviews.find(r => r.id === deleteConfirm)?.productId)?.name}</strong>? This cannot be undone.</p>
            </div>
            <div className="rv-modal-actions-outer">
              <button className="rv-btn-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="rv-btn-danger" onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}