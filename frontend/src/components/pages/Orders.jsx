import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import "./Orders.css";
import { api, getStaffToken } from "../../config/api";

const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

function initials(c) {
  if (!c) return "?";
  const a = (c.firstName || "").trim();
  const b = (c.lastName || "").trim();
  const s = `${a.charAt(0)}${b.charAt(0)}`.toUpperCase();
  return s || "?";
}

function customerLabel(c) {
  if (!c) return "Unknown customer";
  const name = [c.firstName, c.lastName].filter(Boolean).join(" ");
  return name || c.email || "Customer";
}

function lineSummary(order) {
  const items = order.items || [];
  if (items.length === 0) return "—";
  const first = items[0]?.product?.productName || "Item";
  if (items.length === 1) return first;
  return `${first} +${items.length - 1} more`;
}

function categorySummary(order) {
  const items = order.items || [];
  if (items.length === 0) return "—";
  const cats = [...new Set(items.map((i) => i.product?.productCategory).filter(Boolean))];
  if (cats.length === 0) return "—";
  if (cats.length === 1) return cats[0];
  return "Multiple";
}

export default function Orders({ setActivePage }) {
  useEffect(() => {
    setActivePage("orders");
  }, [setActivePage]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [orders, setOrders] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const load = () => {
    setLoadError("");
    if (!getStaffToken()) {
      setLoadError("staff_auth");
      setOrders([]);
      return;
    }
    api("/order/admin/all", { auth: "staff" })
      .then((res) => setOrders(res.data || []))
      .catch((e) => {
        if (e.status === 401) setLoadError("staff_auth");
        else setLoadError(e.message || "Could not load orders");
      });
  };

  useEffect(() => {
    load();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const id = String(order._id || "").toLowerCase();
      const c = order.customer;
      const name = customerLabel(c).toLowerCase();
      const email = (c?.email || "").toLowerCase();
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || id.includes(q) || name.includes(q) || email.includes(q);
      const matchesStatus = statusFilter === "All" || order.orderStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const updateStatus = async (orderId, orderStatus) => {
    setUpdatingId(orderId);
    try {
      await api(`/order/admin/${orderId}`, { method: "PATCH", body: { orderStatus }, auth: "staff" });
      load();
    } catch (e) {
      alert(e.message || "Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="orders-page">
      <div className="page-header">
        <div>
          <h1>Orders</h1>
          <p>Customer takeaway orders (pay on pickup). Update status as you prepare and hand over orders.</p>
        </div>
      </div>

      {loadError === "staff_auth" && (
        <div className="orders-banner">
          <p>
            Staff sign-in required. <Link to="/admin/login">Sign in here</Link> to view and update orders.
          </p>
        </div>
      )}
      {loadError && loadError !== "staff_auth" && <p className="orders-banner error">{loadError}</p>}

      <div className="orders-controls">
        <div className="search-box">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search order id, customer name, email…"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>ORDER</th>
              <th>CUSTOMER</th>
              <th>ITEMS</th>
              <th>CATEGORY</th>
              <th>FULFILLMENT</th>
              <th>STATUS</th>
              <th>TOTAL (LKR)</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id}>
                <td className="order-id mono">{String(order._id).slice(-8).toUpperCase()}</td>
                <td>
                  <div className="customer-info">
                    <div className="avatar">{initials(order.customer)}</div>
                    <div>
                      <p className="customer-name">{customerLabel(order.customer)}</p>
                      <p className="customer-email">{order.customer?.email || "—"}</p>
                    </div>
                  </div>
                </td>
                <td className="category">{lineSummary(order)}</td>
                <td className="category">{categorySummary(order)}</td>
                <td className="category">{order.fulfillmentType === "takeaway" ? "Takeaway" : order.fulfillmentType}</td>
                <td>
                  <select
                    className="order-status-select"
                    value={order.orderStatus}
                    disabled={updatingId === order._id || !getStaffToken()}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <div className="order-payment-hint">
                    Payment: {order.paymentStatus}
                    {order.discountAmount > 0 && (
                      <span className="order-discount-tag"> · Discount LKR {Number(order.discountAmount).toLocaleString()}</span>
                    )}
                  </div>
                </td>
                <td className="amount">{Number(order.totalAmount).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span>
          SHOWING {filteredOrders.length} OF {orders.length} ORDERS
        </span>
      </div>
    </div>
  );
}
