import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../common/StatCard";
import SalesChart from "../common/SalesChart";
import "./Dashboard.css";
import { api, getStaffToken } from "../../config/api";

function customerLabel(c) {
  if (!c) return "—";
  const name = [c.firstName, c.lastName].filter(Boolean).join(" ");
  return name || c.email || "Customer";
}

function categorySummary(order) {
  const items = order.items || [];
  const cats = [...new Set(items.map((i) => i.product?.productCategory).filter(Boolean))];
  if (cats.length === 0) return "—";
  if (cats.length === 1) return cats[0];
  return "Multiple";
}

function feedbackCustomerLabel(fb) {
  const c = fb.customer;
  if (c && (c.firstName || c.lastName)) {
    return [c.firstName, c.lastName].filter(Boolean).join(" ");
  }
  return fb.customerName || "Customer";
}

export default function Dashboard({ setActivePage }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0 });
  const [recent, setRecent] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState({ total: 0, pendingReply: 0 });
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [authNote, setAuthNote] = useState("");
  const [dashLoading, setDashLoading] = useState(false);

  useEffect(() => {
    setActivePage("dashboard");
  }, [setActivePage]);

  useEffect(() => {
    if (!getStaffToken()) {
      setAuthNote("Sign in as staff to load live stats and orders.");
      setDashLoading(false);
      return;
    }
    setAuthNote("");
    setDashLoading(true);
    Promise.all([
      api("/order/admin/stats", { auth: "staff" }),
      api("/order/admin/all?limit=5", { auth: "staff" }),
      api("/feedback/stats", { auth: "staff" }),
      api("/feedback?limit=5", { auth: "staff" }),
    ])
      .then(([statsRes, ordersRes, fbStats, fbList]) => {
        if (statsRes?.data) setStats(statsRes.data);
        setRecent(ordersRes?.data || []);
        setFeedbackStats({
          total: typeof fbStats?.total === "number" ? fbStats.total : 0,
          pendingReply: typeof fbStats?.pendingReply === "number" ? fbStats.pendingReply : 0,
        });
        setRecentFeedback(Array.isArray(fbList) ? fbList : []);
      })
      .catch(() => setAuthNote("Could not load dashboard data."))
      .finally(() => setDashLoading(false));
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Refined luxury management for Beceff.</p>
          {authNote && <p className="dashboard-auth-note">{authNote}</p>}
        </div>
        <div className="header-actions">
          <div className="search-box-dash">
            <svg className="search-icon-dash" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input type="text" placeholder="Search entries..." className="search-input-dash" readOnly />
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {dashLoading ? (
          <>
            <div className="dash-stat-skeleton" aria-hidden />
            <div className="dash-stat-skeleton" aria-hidden />
            <div className="dash-stat-skeleton" aria-hidden />
          </>
        ) : (
          <>
            <StatCard
              title="TOTAL REVENUE (LKR)"
              value={stats.totalRevenue.toLocaleString()}
              change="From completed order totals"
              changeType="positive"
            />
            <StatCard title="TOTAL ORDERS" value={String(stats.totalOrders)} change="All-time count" changeType="positive" />
            <StatCard
              title="CUSTOMER FEEDBACK"
              value={String(feedbackStats.total)}
              change={
                feedbackStats.pendingReply > 0
                  ? `${feedbackStats.pendingReply} awaiting staff reply`
                  : feedbackStats.total > 0
                    ? "All reviews have a reply"
                    : "Reviews appear after orders are ready"
              }
              changeType={feedbackStats.pendingReply > 0 ? "neutral" : "positive"}
            />
          </>
        )}
      </div>

      <div className="dashboard-grid">
        <div className="chart-section">
          <div className="section-header">
            <h2>Sales Trends</h2>
            <span className="currency">CURRENCY: LKR</span>
          </div>
          <SalesChart />
        </div>

        <div className="featured-section">
          <h2>Recent activity</h2>
          <p className="featured-hint">Latest customer orders from the shop.</p>
          <div className="featured-items">
            {dashLoading ? (
              <p className="featured-hint dash-loading-inline">Loading recent orders…</p>
            ) : recent.length === 0 ? (
              <p className="featured-empty">No orders yet.</p>
            ) : (
              recent.map((order) => (
                <div key={order._id} className="featured-item">
                  <div className="item-image">📦</div>
                  <div className="item-info">
                    <p className="item-name">{customerLabel(order.customer)}</p>
                    <p className="item-price">
                      {categorySummary(order)} · LKR {Number(order.totalAmount).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="dash-feedback-section">
        <div className="section-header">
          <h2>Latest feedback</h2>
          <a
            href="/admin/feedbacks"
            className="view-all-link"
            onClick={(e) => {
              e.preventDefault();
              setActivePage("feedbacks");
              navigate("/admin/feedbacks");
            }}
          >
            VIEW ALL FEEDBACK
          </a>
        </div>
        <p className="featured-hint">From customers whose orders are ready or completed.</p>
        <table className="orders-table dash-feedback-table">
          <thead>
            <tr>
              <th>CUSTOMER</th>
              <th>RATING</th>
              <th>REVIEW</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {dashLoading ? (
              <tr>
                <td colSpan={4} className="text-light" style={{ padding: "20px" }}>
                  Loading feedback…
                </td>
              </tr>
            ) : recentFeedback.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-light" style={{ padding: "20px" }}>
                  No feedback yet.
                </td>
              </tr>
            ) : (
              recentFeedback.map((fb) => {
                const hasReply = !!(fb.staffReply && String(fb.staffReply).trim());
                const full = `${fb.title ? `${fb.title} — ` : ""}${fb.feedback || ""}`;
                const truncated = full.length > 80;
                const preview = truncated ? `${full.slice(0, 80)}…` : full;
                return (
                  <tr key={fb._id}>
                    <td>
                      <div className="order-customer">
                        <div className="order-avatar">
                          {(feedbackCustomerLabel(fb) || "?").charAt(0).toUpperCase()}
                        </div>
                        <span>{feedbackCustomerLabel(fb)}</span>
                      </div>
                    </td>
                    <td className="text-light">{fb.rating != null ? `${fb.rating} ★` : "—"}</td>
                    <td className="dash-feedback-preview">{preview}</td>
                    <td>
                      <span className={`dash-fb-badge ${hasReply ? "replied" : "pending"}`}>
                        {hasReply ? "Replied" : "Pending"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="recent-orders-section">
        <div className="section-header">
          <h2>Recent Orders</h2>
          <a
            href="/admin/orders"
            className="view-all-link"
            onClick={(e) => {
              e.preventDefault();
              setActivePage("orders");
              navigate("/admin/orders");
            }}
          >
            VIEW ALL ORDERS
          </a>
        </div>
        <table className="orders-table">
          <thead>
            <tr>
              <th>ORDER</th>
              <th>CUSTOMER</th>
              <th>CATEGORY</th>
              <th>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {dashLoading ? (
              <tr>
                <td colSpan={4} className="text-light" style={{ padding: "20px" }}>
                  Loading orders…
                </td>
              </tr>
            ) : recent.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-light" style={{ padding: "20px" }}>
                  No orders to show.
                </td>
              </tr>
            ) : (
              recent.map((order) => (
                <tr key={order._id}>
                  <td className="order-id">{String(order._id).slice(-8).toUpperCase()}</td>
                  <td>
                    <div className="order-customer">
                      <div className="order-avatar">
                        {(order.customer?.firstName || "?").charAt(0).toUpperCase()}
                      </div>
                      <span>{customerLabel(order.customer)}</span>
                    </div>
                  </td>
                  <td className="text-light">{categorySummary(order)}</td>
                  <td className="amount-col">LKR {Number(order.totalAmount).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
