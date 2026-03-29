import { useEffect, useState } from "react";
import { API_BASE } from "../../config/api";
import "./CouponBanner.css";

const BANNER_OFFSET_PX = 40;

function offerPhrase(c) {
  const amt = Number(c.discountAmount);
  if (c.discountType === "percentage") {
    return `Get ${amt}% off`;
  }
  return `Save LKR ${amt.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function CouponBanner() {
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/discount/public/active-coupons`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (cancelled || !Array.isArray(data)) return;
        setCoupons(data);
      })
      .catch(() => {
        if (!cancelled) setCoupons([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const h = coupons.length > 0 ? BANNER_OFFSET_PX : 0;
    document.documentElement.style.setProperty("--coupon-banner-offset", `${h}px`);
    return () => {
      document.documentElement.style.removeProperty("--coupon-banner-offset");
    };
  }, [coupons.length]);

  if (coupons.length === 0) return null;

  const copyCode = (code) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
  };

  return (
    <div className="coupon-banner" role="region" aria-label="Active promo codes">
      <div className="coupon-banner-inner">
        <span className="coupon-banner-label">Limited time</span>
        {coupons.map((c, i) => (
          <span key={c.code} className="coupon-banner-segment">
            {i > 0 ? <span className="coupon-banner-dot" aria-hidden> · </span> : null}
            <span className="coupon-banner-text">
              {offerPhrase(c)} at checkout — use{" "}
              <button
                type="button"
                className="coupon-banner-code"
                onClick={() => copyCode(c.code)}
                title="Copy code"
              >
                {c.code}
              </button>
              {c.minSubtotalLkr != null && c.minSubtotalLkr > 0 ? (
                <span className="coupon-banner-min">
                  {" "}
                  (min. order LKR {Number(c.minSubtotalLkr).toLocaleString(undefined, { maximumFractionDigits: 0 })})
                </span>
              ) : null}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
