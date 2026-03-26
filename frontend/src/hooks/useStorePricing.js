import { useEffect, useState } from "react";
import { API_BASE } from "../config/api";

export function useStorePricing() {
  const [storePricing, setStorePricing] = useState({ active: false });
  const [storePricingLoading, setStorePricingLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/discount/store-pricing`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setStorePricing(d?.active ? d : { active: false });
      })
      .catch(() => {
        if (!cancelled) setStorePricing({ active: false });
      })
      .finally(() => {
        if (!cancelled) setStorePricingLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { storePricing, storePricingLoading };
}
