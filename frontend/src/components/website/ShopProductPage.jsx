import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "./Navbar";
import ShopCartDrawer from "./ShopCartDrawer";
import { useShopCheckout } from "../../hooks/useShopCheckout";
import { api, getCustomerToken } from "../../config/api";
import "./Shop.css";

function StarPicker({ value, onChange }) {
  return (
    <div className="shop-review-stars" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={n <= value ? "filled" : ""}
          onClick={() => onChange(n)}
          aria-label={`${n} stars`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function ProductPageSkeleton() {
  return (
    <div className="shop-inner shop-page-skeleton" aria-busy="true" aria-label="Loading product">
      <div className="shop-header" style={{ marginBottom: 24 }}>
        <div className="sk sk-block sk-w-40" style={{ height: 20 }} />
        <div className="sk sk-block sk-w-24" style={{ height: 44, borderRadius: 10 }} />
      </div>
      <div className="shop-product-layout">
        <div className="sk sk-block sk-hero" />
        <div className="shop-product-detail">
          <div className="sk sk-line sk-w-80" />
          <div className="sk sk-line sk-w-50" />
          <div className="sk sk-line sk-w-30" />
          <div className="sk sk-line sk-w-full" style={{ marginTop: 20 }} />
          <div className="sk sk-line sk-w-full" />
          <div className="sk sk-block sk-w-48" style={{ height: 44, marginTop: 20, borderRadius: 10 }} />
        </div>
      </div>
      <div className="shop-reviews-block" style={{ marginTop: 48 }}>
        <div className="sk sk-line sk-w-40" style={{ marginBottom: 16 }} />
        <div className="sk sk-block sk-h-120" style={{ borderRadius: 12, marginBottom: 16 }} />
        <div className="sk sk-block sk-h-88" style={{ borderRadius: 12 }} />
      </div>
    </div>
  );
}

function ReviewCard({ r, variant, badge }) {
  const stars = "★".repeat(r.rating || 0) + "☆".repeat(5 - (r.rating || 0));
  const reply = r.staffReply && String(r.staffReply).trim();
  return (
    <article className={`shop-review-card ${variant || ""}`}>
      <div className="shop-review-card-head">
        <span className="shop-review-author">{r.customerName || "Customer"}</span>
        <span className="shop-review-date">
          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
        </span>
      </div>
      {badge ? <p className="shop-review-source-badge">{badge}</p> : null}
      <div className="shop-review-stars-inline" aria-hidden>
        {stars}
      </div>
      {r.title ? <p className="shop-review-title">{r.title}</p> : null}
      <p className="shop-review-text">{r.text}</p>
      {reply ? (
        <div className="shop-review-staff-reply">
          <span className="shop-review-label">Store reply</span>
          <p className="shop-review-staff-text">{r.staffReply}</p>
          {r.staffRepliedByName ? (
            <p className="shop-review-staff-meta">— {r.staffRepliedByName}</p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export default function ShopProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const checkout = useShopCheckout();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [myProductReview, setMyProductReview] = useState(null);
  const [myOrderFeedback, setMyOrderFeedback] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitBusy, setSubmitBusy] = useState(false);

  const returnPath = `/shop/product/${productId}`;

  useEffect(() => {
    let cancelled = false;
    setPageError("");
    setPageLoading(true);
    setProduct(null);
    setReviews([]);
    setMyProductReview(null);
    setMyOrderFeedback(null);

    const opts = {};
    if (getCustomerToken()) opts.auth = "customer";

    api(`/product-review/page/${productId}`, opts)
      .then((data) => {
        if (cancelled) return;
        if (!data?.product) {
          setPageError("Product not found or no longer available.");
          return;
        }
        setProduct(data.product);
        setReviews(Array.isArray(data.reviews) ? data.reviews : []);
        const m = data.mine || {};
        setMyProductReview(m.productReview || null);
        setMyOrderFeedback(m.orderFeedback || null);
      })
      .catch(() => {
        if (!cancelled) setPageError("Product not found or no longer available.");
      })
      .finally(() => {
        if (!cancelled) setPageLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  const submitReview = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!getCustomerToken()) {
      navigate(`/login?return=${encodeURIComponent(returnPath)}`);
      return;
    }
    const bodyText = text.trim();
    if (!bodyText) {
      setSubmitError("Please write your review.");
      return;
    }
    setSubmitBusy(true);
    try {
      const created = await api("/product-review", {
        method: "POST",
        body: {
          productId,
          rating,
          title: title.trim(),
          text: bodyText,
        },
        auth: "customer",
      });
      setMyProductReview(created);
      setText("");
      setTitle("");
      setRating(5);
      setReviews((prev) => [
        { ...created, source: "product" },
        ...prev.filter((x) => String(x._id) !== String(created._id)),
      ]);
    } catch (err) {
      setSubmitError(err.message || "Could not post review");
    } finally {
      setSubmitBusy(false);
    }
  };

  if (pageError) {
    return (
      <div className="shop-page">
        <Navbar />
        <div className="shop-inner">
          <div className="shop-back-row">
            <button type="button" className="shop-back-link" onClick={() => navigate("/shop")}>
              ← Back to shop
            </button>
          </div>
          <p className="shop-error">{pageError}</p>
        </div>
      </div>
    );
  }

  if (pageLoading || (!pageError && !product)) {
    return (
      <div className="shop-page">
        <Navbar />
        <ProductPageSkeleton />
      </div>
    );
  }

  return (
    <div className="shop-page">
      <Navbar />

      <div className="shop-inner">
        <header className="shop-header">
          <div className="shop-header-text">
            <div className="shop-back-row">
              <button type="button" className="shop-back-link" onClick={() => navigate("/shop")}>
                ← Back to shop
              </button>
            </div>
          </div>
          <button
            type="button"
            className="shop-cart-trigger"
            onClick={() => checkout.setCartOpen(true)}
            aria-expanded={checkout.cartOpen}
            aria-controls="shop-cart-drawer"
          >
            <span className="shop-cart-trigger-label">Cart</span>
            {checkout.cartCount > 0 && <span className="shop-cart-badge">{checkout.cartCount}</span>}
          </button>
        </header>

        <div className="shop-product-layout">
          <div className="shop-product-hero">
            {product.productImage ? (
              <img src={product.productImage} alt={product.productName} />
            ) : (
              <span className="shop-product-hero-placeholder">✦</span>
            )}
          </div>

          <div className="shop-product-detail">
            <h1>{product.productName}</h1>
            <p className="shop-card-meta">
              {product.productCategory}
              {product.metalMaterial ? ` · ${product.metalMaterial}` : ""}
              {product.gemType && product.gemType !== "none" ? ` · ${product.gemType}` : ""}
            </p>
            <p className="shop-product-price">
              {product.compareAtPrice != null && product.compareAtPrice > product.productPrice && (
                <span className="shop-product-price-was">LKR {Number(product.compareAtPrice).toLocaleString()}</span>
              )}
              LKR {Number(product.productPrice).toLocaleString()}
            </p>
            <p className="shop-product-stock">{product.stockQuantity} in stock</p>
            {product.productDescription ? (
              <div className="shop-product-desc">{product.productDescription}</div>
            ) : null}
            <div className="shop-product-actions">
              <button
                type="button"
                className="shop-btn-dark"
                disabled={!product.stockQuantity}
                onClick={() => checkout.addToCart(product)}
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>

        <section className="shop-reviews-block" aria-labelledby="reviews-heading">
          <h2 id="reviews-heading">Customer reviews</h2>
          <p className="shop-reviews-sub">
            Includes reviews left here and feedback from your account after an order is ready for pickup. Everything appears as
            soon as it is posted.
          </p>

          {myOrderFeedback ? (
            <div style={{ marginBottom: 20 }}>
              <h3 className="shop-review-label" style={{ marginBottom: 10 }}>
                Your order feedback
              </h3>
              <ReviewCard
                r={myOrderFeedback}
                variant="shop-review-yours"
                badge="From My Reviews (order feedback)"
              />
            </div>
          ) : null}

          {myProductReview ? (
            <div style={{ marginBottom: 24 }}>
              <h3 className="shop-review-label" style={{ marginBottom: 10 }}>
                Your product review
              </h3>
              <ReviewCard r={myProductReview} variant="shop-review-yours" badge="Posted on this page" />
            </div>
          ) : null}

          {!myProductReview ? (
            <form className="shop-review-form" onSubmit={submitReview}>
              <h3>Write a review on this page</h3>
              {!getCustomerToken() ? (
                <p className="shop-hint" style={{ marginBottom: 0 }}>
                  <Link to={`/login?return=${encodeURIComponent(returnPath)}`}>Sign in</Link> or{" "}
                  <Link to={`/register?return=${encodeURIComponent(returnPath)}`}>create an account</Link> to post a review.
                </p>
              ) : (
                <>
                  <span className="shop-review-label">Rating</span>
                  <StarPicker value={rating} onChange={setRating} />
                  <label className="shop-review-label" htmlFor="rv-title">
                    Title (optional)
                  </label>
                  <input id="rv-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
                  <label className="shop-review-label" htmlFor="rv-text">
                    Review
                  </label>
                  <textarea
                    id="rv-text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    required
                    placeholder="Share your experience with this piece…"
                  />
                  {submitError && <p className="shop-review-error">{submitError}</p>}
                  <button type="submit" className="shop-btn-dark shop-review-submit" disabled={submitBusy}>
                    {submitBusy ? "Publishing…" : "Publish review"}
                  </button>
                </>
              )}
            </form>
          ) : null}

          <div className="shop-review-list">
            {(() => {
              const hide = new Set(
                [myProductReview?._id, myOrderFeedback?._id].filter(Boolean).map((id) => String(id))
              );
              const shown = reviews.filter((r) => !hide.has(String(r._id)));
              const hasMine = !!(myProductReview || myOrderFeedback);
              if (shown.length === 0) {
                return (
                  <p className="shop-review-empty">
                    {hasMine ? "No other reviews yet." : "No reviews yet. Be the first to share your thoughts."}
                  </p>
                );
              }
              return shown.map((r) => (
                <ReviewCard
                  key={r._id || r.createdAt}
                  r={r}
                  badge={r.source === "order" ? "Order feedback" : undefined}
                />
              ));
            })()}
          </div>
        </section>
      </div>

      <ShopCartDrawer
        returnPathForLogin={returnPath}
        cartOpen={checkout.cartOpen}
        setCartOpen={checkout.setCartOpen}
        cart={checkout.cart}
        setQty={checkout.setQty}
        toggleLineSelected={checkout.toggleLineSelected}
        hasSelectedForCheckout={checkout.hasSelectedForCheckout}
        promoInput={checkout.promoInput}
        setPromoInput={checkout.setPromoInput}
        promo={checkout.promo}
        setPromo={checkout.setPromo}
        promoMessage={checkout.promoMessage}
        applyPromo={checkout.applyPromo}
        busy={checkout.busy}
        checkoutMsg={checkout.checkoutMsg}
        subtotal={checkout.subtotal}
        discountAmount={checkout.discountAmount}
        total={checkout.total}
        placeOrder={checkout.placeOrder}
      />
    </div>
  );
}
