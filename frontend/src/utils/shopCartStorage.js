export const CART_KEY = "spark_shop_cart";

function normalizeLine(line) {
  if (!line || typeof line !== "object") return line;
  return {
    ...line,
    selected: line.selected === false ? false : true,
  };
}

export function loadCart() {
  try {
    const s = localStorage.getItem(CART_KEY);
    const raw = s ? JSON.parse(s) : [];
    return Array.isArray(raw) ? raw.map(normalizeLine) : [];
  } catch {
    return [];
  }
}

export function saveCart(lines) {
  localStorage.setItem(CART_KEY, JSON.stringify(lines));
}
