import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getCustomerToken } from "../config/api";
import { CART_KEY, loadCart, saveCart } from "../utils/shopCartStorage";

function lineIncluded(line) {
  return line?.selected !== false;
}

export function useShopCheckout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(loadCart);
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState(null);
  const [promoMessage, setPromoMessage] = useState("");
  const [checkoutMsg, setCheckoutMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const cartCount = useMemo(() => cart.reduce((n, line) => n + line.quantity, 0), [cart]);

  const hasSelectedForCheckout = useMemo(() => cart.some((line) => lineIncluded(line)), [cart]);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === CART_KEY || e.key === null) setCart(loadCart());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!cartOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") setCartOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [cartOpen]);

  // --- BEST DEAL ALGORITHM UI MATH ---
  // 1. Calculate the TRUE original price of the cart (e.g., LKR 100,000)
  const baseSubtotal = useMemo(() => {
    return cart.reduce((sum, line) => {
      if (!lineIncluded(line)) return sum;
      const p = line.product;
      const originalPrice = (p?.compareAtPrice && p.compareAtPrice > p.productPrice) ? p.compareAtPrice : (p?.productPrice || 0);
      return sum + (originalPrice * line.quantity);
    }, 0);
  }, [cart]);

  // 2. Calculate how much the active site-wide sale is saving them right now (e.g., LKR 20,000)
  const siteWideSavings = useMemo(() => {
    return cart.reduce((sum, line) => {
      if (!lineIncluded(line)) return sum;
      const p = line.product;
      if (p?.compareAtPrice && p.compareAtPrice > p.productPrice) {
        return sum + ((p.compareAtPrice - p.productPrice) * line.quantity);
      }
      return sum;
    }, 0);
  }, [cart]);

  // 3. The Active Discount is EITHER the Coupon (if valid) OR the Site-Wide sale. They never stack.
  const activeDiscountAmount = promo?.valid ? promo.discountAmount : siteWideSavings;
  
  // 4. Final Total is simply the True Original Price minus the Active Discount
  const total = Math.max(0, Math.round((baseSubtotal - activeDiscountAmount) * 100) / 100);

  const addToCart = (product) => {
    setPromo(null);
    setPromoMessage("");
    if (!product.stockQuantity) return;
    setCart((prev) => {
      const i = prev.findIndex((l) => l.productId === product._id);
      if (i >= 0) {
        const next = [...prev];
        const q = next[i].quantity + 1;
        if (q > product.stockQuantity) return prev;
        next[i] = { ...next[i], quantity: q };
        return next;
      }
      return [...prev, { productId: product._id, quantity: 1, product, selected: true }];
    });
    setCartOpen(true);
  };

  const setQty = (productId, quantity) => {
    setPromo(null);
    setPromoMessage("");
    setCart((prev) => {
      const line = prev.find((l) => l.productId === productId);
      if (!line) return prev;
      const max = line.product?.stockQuantity ?? quantity;
      const q = Math.max(0, Math.min(quantity, max));
      if (q === 0) return prev.filter((l) => l.productId !== productId);
      return prev.map((l) => (l.productId === productId ? { ...l, quantity: q } : l));
    });
  };

  const toggleLineSelected = (productId) => {
    setPromo(null);
    setPromoMessage("");
    setCart((prev) =>
      prev.map((l) =>
        l.productId === productId ? { ...l, selected: l.selected === false ? true : false } : l
      )
    );
  };

  const applyPromo = async () => {
    setPromoMessage("");
    setBusy(true);
    try {
      const data = await api("/discount/validate", {
        method: "POST",
        body: { 
          code: promoInput, 
          baseSubtotal,         // Send the 100k
          siteWideSavings       // Send the 20k
        },
      });
      if (data.valid) {
        setPromo(data);
        setPromoMessage(data.message || "Promo applied.");
      } else {
        setPromo(null);
        setPromoMessage(data.message || "Invalid code");
      }
    } catch (e) {
      setPromo(null);
      setPromoMessage(e.message || "Could not validate code");
    } finally {
      setBusy(false);
    }
  };

  const placeOrder = async (returnPath = "/shop") => {
    setCheckoutMsg("");
    if (!getCustomerToken()) {
      navigate(`/login?return=${encodeURIComponent(returnPath)}`);
      return;
    }
    if (cart.length === 0) {
      setCheckoutMsg("Your cart is empty.");
      return;
    }
    const selectedLines = cart.filter((l) => lineIncluded(l));
    if (selectedLines.length === 0) {
      setCheckoutMsg("Tick the items you want to buy, then place your order.");
      return;
    }
    setBusy(true);
    try {
      const items = selectedLines.map((l) => ({ productId: l.productId, quantity: l.quantity }));
      const body = { items };
      if (promo?.valid) {
        body.discountCoupon = promo.code || promoInput.trim();
      }
      const res = await api("/order", {
        method: "POST",
        body,
        auth: "customer",
      });
      // Clear cart in storage first so it stays empty even if navigation unmounts quickly.
      saveCart([]);
      setCart([]);
      setCartOpen(false);
      setPromo(null);
      setPromoInput("");
      setPromoMessage("");
      setCheckoutMsg(res.message || "Order placed.");
      navigate("/dashboard/orders");
    } catch (e) {
      setCheckoutMsg(e.message || "Order failed");
    } finally {
      setBusy(false);
    }
  };

  return {
    cart, setCart, cartOpen, setCartOpen, cartCount, hasSelectedForCheckout, addToCart, setQty, toggleLineSelected,
    // We export the exact values the Drawer needs to display the beautiful math
    subtotal: baseSubtotal, 
    discountAmount: activeDiscountAmount, 
    total, 
    promoInput, setPromoInput,
    promo, setPromo, promoMessage, busy, checkoutMsg, applyPromo, placeOrder,
  };
}