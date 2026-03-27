export const CART_KEY = "spark_shop_cart";

export function loadCart() {
  try {
    const s = localStorage.getItem(CART_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

export function saveCart(lines) {
  localStorage.setItem(CART_KEY, JSON.stringify(lines));
}
