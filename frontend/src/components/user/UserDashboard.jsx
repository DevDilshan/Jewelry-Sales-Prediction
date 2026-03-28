import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getCustomerInfo, getCustomerToken } from "../../config/api";
import { normalizeOrderStatus } from "../../utils/orderStatus";
import "./UserDashboard.css";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loadError, setLoadError] = useState("");

  const customer = getCustomerInfo();
  const displayName = customer?.firstname || customer?.email || "there";

  useEffect(() => {
    if (!getCustomerToken()) {
      setLoadError("signin");
      setOrders([]);
      return;
    }
    api("/order/my", { auth: "customer" })
      .then((res) => setOrders(res.data || []))
      .catch(() => setLoadError("Could not load orders."));
  }, []);

  const recent = orders.slice(0, 5);
  const totalOrders = orders.length;

  return (
    <div className="user-dashboard">
      <div className="ud-header">
        <div>
          <h1>Welcome back, {displayName}!</h1>
          <p>Here is an overview of your account and recent orders.</p>
          {loadError === "signin" && (
            <p className="ud-note">
              <button type="button" className="ud-linkish" onClick={() => navigate("/login?return=/dashboard")}>
                Sign in
              </button>{" "}
              to see your orders.
            </p>
          )}
          {loadError && loadError !== "signin" && <p className="ud-note error">{loadError}</p>}
        </div>
      </div>


      <div className="ud-grid">
        <div className="ud-section ud-section-full">
          <div className="ud-section-header">
            <h2>Recent Orders</h2>
            <button type="button" className="ud-view-all" onClick={() => navigate("/dashboard/orders")}>
              View All →
            </button>
          </div>
          <table className="ud-table">
            <thead>
              <tr>
                <th>ORDER</th>
                <th>ITEMS</th>
                <th>DATE</th>
                <th>STATUS</th>
                <th>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={5} className="ud-text-light" style={{ padding: "24px" }}>
                    {getCustomerToken() ? "No orders yet. Browse the shop to place a takeaway order." : "—"}
                  </td>
                </tr>
              ) : (
                recent.map((order) => {
                  const first = order.items?.[0]?.product?.productName || "Items";
                  const extra = (order.items?.length || 0) > 1 ? ` +${order.items.length - 1}` : "";
                  const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—";
                  return (
                    <tr key={order._id}>
                      <td className="ud-order-id">{String(order._id).slice(-8).toUpperCase()}</td>
                      <td>
                        {first}
                        {extra}
                      </td>
                      <td className="ud-text-light">{date}</td>
                      <td>
                        <span className={`ud-status ${normalizeOrderStatus(order.orderStatus).toLowerCase()}`}>
                          {normalizeOrderStatus(order.orderStatus).toUpperCase()}
                        </span>
                      </td>
                      <td className="ud-amount">LKR {Number(order.totalAmount).toLocaleString()}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
