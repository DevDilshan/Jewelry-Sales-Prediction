import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getCustomerToken } from "../config/api";
import { loadCart, saveCart } from "../utils/shopCartStorage";

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

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  useEffect(() => {
    if (!cartOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") setCartOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [cartOpen]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, line) => {
      const p = line.product;
      return sum + (p?.productPrice || 0) * line.quantity;
    }, 0);
  }, [cart]);

  const discountAmount = promo?.valid ? promo.discountAmount : 0;
  const total = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);

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
      return [...prev, { productId: product._id, quantity: 1, product }];
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

  const applyPromo = async () => {
    setPromoMessage("");
    setBusy(true);
    try {
      const data = await api("/discount/validate", {
        method: "POST",
        body: { code: promoInput, subtotal },
      });
      if (data.valid) {
        setPromo(data);
        setPromoMessage("Promo applied.");
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
    setBusy(true);
    try {
      const items = cart.map((l) => ({ productId: l.productId, quantity: l.quantity }));
      const body = { items };
      if (promo?.valid) {
        body.discountCoupon = promo.code || promoInput.trim();
      }
      const res = await api("/order", {
        method: "POST",
        body,
        auth: "customer",
      });
      setCart([]);
      saveCart([]);
      setPromo(null);
      setPromoInput("");
      setCheckoutMsg(res.message || "Order placed.");
      navigate("/dashboard/orders");
    } catch (e) {
      setCheckoutMsg(e.message || "Order failed");
    } finally {
      setBusy(false);
    }
  };

  return {
    cart,
    setCart,
    cartOpen,
    setCartOpen,
    cartCount,
    addToCart,
    setQty,
    subtotal,
    discountAmount,
    total,
    promoInput,
    setPromoInput,
    promo,
    setPromo,
    promoMessage,
    busy,
    checkoutMsg,
    applyPromo,
    placeOrder,
  };
}
