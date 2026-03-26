import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import "./Discounts.css";
import { api, getStaffToken } from "../../config/api";

function statusForDiscount(d) {
  const now = new Date();
  if (d.endDate && new Date(d.endDate) < now) return "EXPIRED";
  if (d.startDate && new Date(d.startDate) > now) return "SCHEDULED";
  return "ACTIVE";
}

function formatWhatCustomersGet(d) {
  const amt = Number(d.discountAmount);
  const scope = d.promoScope === "site_wide" ? "site_wide" : "coupon";
  if (scope === "site_wide") {
    if (d.discountType === "percentage") {
      return `${amt}% off every product’s listed price in the shop`;
    }
    return `LKR ${amt.toLocaleString()} off each product’s listed price (minimum LKR 0)`;
  }
  if (d.discountType === "percentage") {
    return `${amt}% off the cart subtotal (with promo code)`;
  }
  return `LKR ${amt.toLocaleString()} off the cart subtotal (capped at subtotal; promo code)`;
}

function promoScopeLabel(d) {
  return d.promoScope === "site_wide" ? "Site-wide" : "Coupon";
}

function formatValidRange(d) {
  if (!d.startDate && !d.endDate) return "No date limits";
  const s = d.startDate ? new Date(d.startDate).toLocaleDateString() : "—";
  const e = d.endDate ? new Date(d.endDate).toLocaleDateString() : "—";
  return `${s} → ${e}`;
}

function toDateInputValue(iso) {
  if (!iso) return "";
  const x = new Date(iso);
  if (Number.isNaN(x.getTime())) return "";
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const EMPTY_DISCOUNT_FORM = {
  discountName: "",
  promoScope: "coupon",
  discountCoupon: "",
  discountType: "percentage",
  discountAmount: "",
  startDate: "",
  endDate: "",
};

export default function Discounts({ setActivePage }) {
  useEffect(() => {
    setActivePage("discounts");
  }, [setActivePage]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [scopeFilter, setScopeFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [discounts, setDiscounts] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  const [newDiscount, setNewDiscount] = useState({ ...EMPTY_DISCOUNT_FORM });
  const [actionsMenuOpenId, setActionsMenuOpenId] = useState(null);

  useEffect(() => {
    if (!actionsMenuOpenId) return;
    const onDoc = (e) => {
      if (e.target.closest?.("[data-discount-actions]")) return;
      setActionsMenuOpenId(null);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setActionsMenuOpenId(null);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [actionsMenuOpenId]);

  const load = () => {
    setLoadError("");
    if (!getStaffToken()) {
      setLoadError("staff_auth");
      setDiscounts([]);
      return;
    }
    api("/discount", { auth: "staff" })
      .then((rows) => setDiscounts(Array.isArray(rows) ? rows : []))
      .catch((e) => {
        if (e.status === 401) setLoadError("staff_auth");
        else setLoadError(e.message || "Could not load discounts");
      });
  };

  useEffect(() => {
    load();
  }, []);

  const rows = useMemo(() => {
    return discounts.map((d) => ({ ...d, _status: statusForDiscount(d) }));
  }, [discounts]);

  const filteredDiscounts = rows.filter((discount) => {
    const name = (discount.discountName || "").toLowerCase();
    const code = (discount.discountCoupon || "").toLowerCase();
    const matchesSearch =
      name.includes(searchQuery.toLowerCase()) || code.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || discount._status === statusFilter;
    const typeLabel = discount.discountType === "percentage" ? "Percentage" : "Fixed amount";
    const matchesType = typeFilter === "All" || typeLabel === typeFilter;
    const sc = discount.promoScope === "site_wide" ? "site_wide" : "coupon";
    const matchesScope =
      scopeFilter === "All" ||
      (scopeFilter === "Coupon" && sc === "coupon") ||
      (scopeFilter === "Site-wide" && sc === "site_wide");
    return matchesSearch && matchesStatus && matchesType && matchesScope;
  });

  const getStatusColor = (status) => {
    if (status === "ACTIVE") return "active";
    if (status === "SCHEDULED") return "scheduled";
    if (status === "EXPIRED") return "expired";
    return "active";
  };

  const closeModal = () => {
    if (saving) return;
    setEditingId(null);
    setNewDiscount({ ...EMPTY_DISCOUNT_FORM });
    setShowModal(false);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setNewDiscount({ ...EMPTY_DISCOUNT_FORM });
    setShowModal(true);
  };

  const openEditModal = (d) => {
    const scope = d.promoScope === "site_wide" ? "site_wide" : "coupon";
    setEditingId(d._id);
    setNewDiscount({
      discountName: d.discountName || "",
      promoScope: scope,
      discountCoupon: scope === "site_wide" ? "" : (d.discountCoupon || ""),
      discountType: d.discountType === "fixed" ? "fixed" : "percentage",
      discountAmount: d.discountAmount != null && d.discountAmount !== "" ? String(d.discountAmount) : "",
      startDate: toDateInputValue(d.startDate),
      endDate: toDateInputValue(d.endDate),
    });
    setShowModal(true);
  };

  const handleSaveDiscount = async (e) => {
    e.preventDefault();
    if (!getStaffToken()) {
      setLoadError("staff_auth");
      return;
    }
    const amount = parseFloat(newDiscount.discountAmount);
    if (Number.isNaN(amount)) {
      alert("Enter a valid discount amount.");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const body = {
          discountName: newDiscount.discountName.trim(),
          promoScope: newDiscount.promoScope,
          discountType: newDiscount.discountType,
          discountAmount: amount,
          startDate: newDiscount.startDate ? new Date(newDiscount.startDate).toISOString() : null,
          endDate: newDiscount.endDate ? new Date(newDiscount.endDate).toISOString() : null,
        };
        if (newDiscount.promoScope === "coupon") {
          body.discountCoupon = newDiscount.discountCoupon.trim();
        }
        await api(`/discount/${editingId}`, { method: "PUT", body, auth: "staff" });
      } else {
        const body = {
          discountName: newDiscount.discountName.trim(),
          promoScope: newDiscount.promoScope,
          discountType: newDiscount.discountType,
          discountAmount: amount,
        };
        if (newDiscount.promoScope === "coupon") {
          body.discountCoupon = newDiscount.discountCoupon.trim();
        }
        if (newDiscount.startDate) body.startDate = new Date(newDiscount.startDate).toISOString();
        if (newDiscount.endDate) body.endDate = new Date(newDiscount.endDate).toISOString();

        await api("/discount/create", { method: "POST", body, auth: "staff" });
      }
      setEditingId(null);
      setNewDiscount({ ...EMPTY_DISCOUNT_FORM });
      setShowModal(false);
      load();
    } catch (err) {
      alert(err.message || (editingId ? "Could not update discount" : "Could not create discount"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this discount? Past orders are unchanged.")) return;
    try {
      await api(`/discount/${id}`, { method: "DELETE", auth: "staff" });
      load();
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  };

  return (
    <div className="discounts-page">
      <div className="page-header">
        <div>
          <h1>Discounts &amp; promo codes</h1>
          <p>
            <strong>Coupon</strong> discounts use a code at checkout (off the cart subtotal). <strong>Site-wide</strong>{" "}
            discounts lower every active product’s price in the shop for all visitors—no code. If several site-wide rules
            exist, the newest active one applies. <strong>Times applied</strong> counts coupon checkouts only.
          </p>
        </div>
        <button className="create-btn" type="button" onClick={openCreateModal} disabled={!getStaffToken()}>
          + New discount
        </button>
      </div>

      {loadError === "staff_auth" && (
        <div className="discounts-banner">
          <p>
            Staff session required to manage discounts.{" "}
            <Link to="/admin/login">Sign in here</Link>, then return to this page.
          </p>
        </div>
      )}
      {loadError && loadError !== "staff_auth" && <p className="discounts-banner error">{loadError}</p>}

      <div className="discounts-controls">
        <div className="search-box">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or code…"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">Status: All</option>
          <option value="ACTIVE">Active</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="EXPIRED">Expired</option>
        </select>

        <select className="filter-select" value={scopeFilter} onChange={(e) => setScopeFilter(e.target.value)}>
          <option value="All">Promo: All</option>
          <option value="Coupon">Coupon</option>
          <option value="Site-wide">Site-wide</option>
        </select>

        <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="All">Amount: All</option>
          <option value="Percentage">Percentage</option>
          <option value="Fixed amount">Fixed amount</option>
        </select>
      </div>

      <div className="discounts-table-container">
        <table className="discounts-table">
          <thead>
            <tr>
              <th>Name &amp; code</th>
              <th>Promo type</th>
              <th>Amount type</th>
              <th>What customers get</th>
              <th>Valid dates</th>
              <th>Status</th>
              <th>Times applied</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredDiscounts.map((discount) => (
              <tr key={discount._id} className={discount._status === "EXPIRED" ? "row-expired" : ""}>
                <td>
                  <div className="discount-info">
                    <p className="discount-name">{discount.discountName}</p>
                    <p className="discount-code">
                      {discount.promoScope === "site_wide" ? (
                        <>
                          <span className="discount-code-auto">System code</span> {discount.discountCoupon}
                        </>
                      ) : (
                        <>Code: {discount.discountCoupon}</>
                      )}
                    </p>
                  </div>
                </td>
                <td>
                  <span className={`scope-badge ${discount.promoScope === "site_wide" ? "scope-site" : "scope-coupon"}`}>
                    {promoScopeLabel(discount)}
                  </span>
                </td>
                <td>
                  <span className="type-label">
                    {discount.discountType === "percentage" ? "Percentage" : "Fixed LKR"}
                  </span>
                </td>
                <td className="value-cell discount-explain">{formatWhatCustomersGet(discount)}</td>
                <td>
                  <div className="duration-info">
                    <p className="duration-range">{formatValidRange(discount)}</p>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${getStatusColor(discount._status)}`}>{discount._status}</span>
                </td>
                <td className="applies-cell">{discount.timesApplied ?? 0}</td>
                <td className="discount-actions-cell">
                  <div className="discount-actions-wrap" data-discount-actions>
                    <button
                      type="button"
                      className="discount-actions-trigger"
                      aria-label="Discount actions"
                      aria-expanded={actionsMenuOpenId === discount._id}
                      aria-haspopup="menu"
                      disabled={!getStaffToken()}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActionsMenuOpenId((id) => (id === discount._id ? null : discount._id));
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <circle cx="12" cy="6" r="1.75" />
                        <circle cx="12" cy="12" r="1.75" />
                        <circle cx="12" cy="18" r="1.75" />
                      </svg>
                    </button>
                    {actionsMenuOpenId === discount._id && (
                      <div className="discount-actions-dropdown" role="menu">
                        <button
                          type="button"
                          className="discount-actions-item"
                          role="menuitem"
                          onClick={() => {
                            setActionsMenuOpenId(null);
                            openEditModal(discount);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="discount-actions-item discount-actions-item--danger"
                          role="menuitem"
                          onClick={() => {
                            setActionsMenuOpenId(null);
                            handleDelete(discount._id);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span>
          SHOWING {filteredDiscounts.length} OF {discounts.length} DISCOUNTS
        </span>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? "Edit discount" : "New discount"}</h2>
              <button type="button" className="modal-close" onClick={closeModal} disabled={saving}>
                ✕
              </button>
            </div>
            <div className="discount-modal-help">
              <strong>Coupon:</strong> customers enter a code at checkout; discount applies to cart subtotal after site-wide
              prices. <strong>Site-wide:</strong> all shop product prices update automatically (percentage or fixed LKR per
              item). Only one active site-wide rule is used (the newest).
            </div>
            <form onSubmit={handleSaveDiscount}>
              <div className="form-group">
                <label>Internal name (for staff)</label>
                <input
                  type="text"
                  required
                  value={newDiscount.discountName}
                  onChange={(e) => setNewDiscount({ ...newDiscount, discountName: e.target.value })}
                  placeholder="e.g. New Year 2025"
                />
              </div>
              <div className="form-group">
                <label>Promo type</label>
                <select
                  value={newDiscount.promoScope}
                  onChange={(e) =>
                    setNewDiscount({ ...newDiscount, promoScope: e.target.value, discountCoupon: "" })
                  }
                >
                  <option value="coupon">Coupon (code at checkout)</option>
                  <option value="site_wide">Site-wide (all product prices in shop)</option>
                </select>
              </div>
              {newDiscount.promoScope === "coupon" && (
                <div className="form-group">
                  <label>Promo code (what customers type)</label>
                  <input
                    type="text"
                    required
                    value={newDiscount.discountCoupon}
                    onChange={(e) => setNewDiscount({ ...newDiscount, discountCoupon: e.target.value })}
                    placeholder="e.g. NY2025"
                  />
                </div>
              )}
              <div className="form-group">
                <label>Amount type</label>
                <select
                  value={newDiscount.discountType}
                  onChange={(e) => setNewDiscount({ ...newDiscount, discountType: e.target.value })}
                >
                  <option value="percentage">
                    {newDiscount.promoScope === "site_wide" ? "Percentage off each price" : "Percentage off cart subtotal"}
                  </option>
                  <option value="fixed">
                    {newDiscount.promoScope === "site_wide" ? "Fixed LKR off each price" : "Fixed LKR off cart subtotal"}
                  </option>
                </select>
              </div>
              <div className="form-group">
                <label>
                  {newDiscount.discountType === "percentage"
                    ? "Percent (1–100)"
                    : "Amount (LKR)"}
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={newDiscount.discountType === "percentage" ? 100 : undefined}
                  step={newDiscount.discountType === "percentage" ? 1 : 0.01}
                  value={newDiscount.discountAmount}
                  onChange={(e) => setNewDiscount({ ...newDiscount, discountAmount: e.target.value })}
                  placeholder={newDiscount.discountType === "percentage" ? "e.g. 15" : "e.g. 5000"}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Valid from (optional)</label>
                  <input
                    type="date"
                    value={newDiscount.startDate}
                    onChange={(e) => setNewDiscount({ ...newDiscount, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Valid until (optional)</label>
                  <input
                    type="date"
                    value={newDiscount.endDate}
                    onChange={(e) => setNewDiscount({ ...newDiscount, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" disabled={saving} onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={saving}>
                  {saving ? "Saving…" : editingId ? "Save changes" : "Create discount"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
