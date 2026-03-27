import { Link } from "react-router-dom";
import { getCustomerToken } from "../../config/api";

export default function ShopCartDrawer({
  returnPathForLogin = "/shop",
  cartOpen,
  setCartOpen,
  cart,
  setQty,
  promoInput,
  setPromoInput,
  promo,
  setPromo,
  promoMessage,
  applyPromo,
  busy,
  checkoutMsg,
  subtotal,
  discountAmount,
  total,
  placeOrder,
}) {
  return (
    <>
      <div
        className={`shop-cart-backdrop ${cartOpen ? "shop-cart-backdrop--open" : ""}`}
        onClick={() => setCartOpen(false)}
        aria-hidden={!cartOpen}
      />

      <aside
        id="shop-cart-drawer"
        className={`shop-cart-drawer ${cartOpen ? "shop-cart-drawer--open" : ""}`}
        aria-hidden={!cartOpen}
      >
        <div className="shop-cart-drawer-inner">
          <div className="shop-cart-drawer-head">
            <h2 className="shop-section-title shop-cart-drawer-title">Cart &amp; checkout</h2>
            <button type="button" className="shop-cart-close" onClick={() => setCartOpen(false)} aria-label="Close cart">
              ✕
            </button>
          </div>

          {cart.length === 0 ? (
            <p className="shop-cart-empty">Nothing in your cart.</p>
          ) : (
            <ul className="shop-cart-lines">
              {cart.map((line) => (
                <li key={line.productId}>
                  <div>
                    <strong>{line.product?.productName}</strong>
                    <div className="shop-line-price">
                      LKR {Number(line.product?.productPrice).toLocaleString()} ×{" "}
                      <input
                        type="number"
                        min={1}
                        max={line.product?.stockQuantity}
                        value={line.quantity}
                        onChange={(e) => setQty(line.productId, parseInt(e.target.value, 10) || 0)}
                        className="shop-qty"
                      />
                    </div>
                  </div>
                  <button type="button" className="shop-link-btn" onClick={() => setQty(line.productId, 0)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="shop-promo">
            <label>Promo code</label>
            <div className="shop-promo-row">
              <input
                value={promoInput}
                onChange={(e) => {
                  setPromoInput(e.target.value);
                  setPromo(null);
                  setPromoMessage("");
                }}
                placeholder="e.g. WELCOME10"
              />
              <button type="button" className="shop-btn-outline" disabled={busy || subtotal <= 0} onClick={applyPromo}>
                Apply
              </button>
            </div>
            {promoMessage && <p className="shop-promo-msg">{promoMessage}</p>}
          </div>

          <div className="shop-totals">
            <div className="shop-total-row">
              <span>Subtotal</span>
              <span>LKR {subtotal.toLocaleString()}</span>
            </div>
            {discountAmount > 0 && (
              <div className="shop-total-row discount">
                <span>Discount</span>
                <span>− LKR {discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="shop-total-row total">
              <span>Total</span>
              <span>LKR {total.toLocaleString()}</span>
            </div>
          </div>

          {!getCustomerToken() && (
            <p className="shop-hint">
              <Link to={`/login?return=${encodeURIComponent(returnPathForLogin)}`}>Sign in</Link> or{" "}
              <Link to={`/register?return=${encodeURIComponent(returnPathForLogin)}`}>create an account</Link> to place an
              order.
            </p>
          )}

          {checkoutMsg && <p className="shop-checkout-msg">{checkoutMsg}</p>}

          <button
            type="button"
            className="shop-btn-dark shop-checkout-btn"
            disabled={busy || cart.length === 0}
            onClick={() => placeOrder(returnPathForLogin)}
          >
            {busy ? "Please wait…" : "Place order"}
          </button>
        </div>
      </aside>
    </>
  );
}
