import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import ShopCartDrawer from "./ShopCartDrawer";
import { useShopCheckout } from "../../hooks/useShopCheckout";
import { API_BASE } from "../../config/api";
import "./Shop.css";

export default function Shop() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [productsLoading, setProductsLoading] = useState(true);

  const checkout = useShopCheckout();

  useEffect(() => {
    setProductsLoading(true);
    setLoadError("");
    fetch(`${API_BASE}/product?forShop=1`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setProducts(list.filter((p) => p.isActive));
      })
      .catch(() => setLoadError("Could not load products. Is the backend running on port 5001?"))
      .finally(() => setProductsLoading(false));
  }, []);

  return (
    <div className="shop-page">
      <Navbar />

      <div className="shop-inner">
        <header className="shop-header">
          <div className="shop-header-text">
            <h1>Boutique Shop</h1>
            <p className="shop-sub">
              Add pieces to your cart, apply a promo code if you have one, then place a order. Pay when you pick up, no online
              payment.
            </p>
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

        {loadError && <p className="shop-error">{loadError}</p>}

        <section className="shop-products">
          <h2 className="shop-section-title">Available pieces</h2>
          <div className="shop-grid">
            {productsLoading &&
              [1, 2, 3, 4, 5, 6].map((k) => (
                <article key={`sk-${k}`} className="shop-card shop-card-skeleton" aria-hidden>
                  <div className="sk sk-block shop-card-sk-img" />
                  <div className="shop-card-body">
                    <div className="sk sk-line sk-w-80" />
                    <div className="sk sk-line sk-w-50" />
                    <div className="sk sk-line sk-w-40" style={{ marginTop: 12 }} />
                    <div className="sk sk-block sk-w-full" style={{ height: 40, marginTop: 16, borderRadius: 8 }} />
                  </div>
                </article>
              ))}
            {!productsLoading &&
              products.map((p) => (
              <article
                key={p._id}
                className="shop-card shop-card--clickable"
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/shop/product/${p._id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/shop/product/${p._id}`);
                  }
                }}
              >
                <div className="shop-card-img">
                  {p.productImage ? (
                    <img src={p.productImage} alt={p.productName} />
                  ) : (
                    <span className="shop-card-placeholder">✦</span>
                  )}
                </div>
                <div className="shop-card-body">
                  <h3>{p.productName}</h3>
                  <p className="shop-card-meta">
                    {p.productCategory}
                    {p.metalMaterial ? ` · ${p.metalMaterial}` : ""}
                  </p>
                  <p className="shop-card-price">
                    {p.compareAtPrice != null && p.compareAtPrice > p.productPrice && (
                      <span className="shop-card-price-was">LKR {Number(p.compareAtPrice).toLocaleString()}</span>
                    )}
                    LKR {Number(p.productPrice).toLocaleString()}
                  </p>
                  <p className="shop-card-stock">{p.stockQuantity} in stock</p>
                  <button
                    type="button"
                    className="shop-btn-dark"
                    disabled={!p.stockQuantity}
                    onClick={(e) => {
                      e.stopPropagation();
                      checkout.addToCart(p);
                    }}
                  >
                    Add to cart
                  </button>
                </div>
              </article>
            ))}
          </div>
          {!productsLoading && products.length === 0 && !loadError && (
            <p className="shop-empty">No active products yet. Ask an admin to add stock.</p>
          )}
        </section>

        <p className="shop-browse-hint">Click a product to open its page, read reviews, and add to cart.</p>
      </div>

      <ShopCartDrawer
        returnPathForLogin="/shop"
        cartOpen={checkout.cartOpen}
        setCartOpen={checkout.setCartOpen}
        cart={checkout.cart}
        setQty={checkout.setQty}
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
