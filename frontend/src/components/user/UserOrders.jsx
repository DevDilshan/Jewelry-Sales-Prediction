import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api, getCustomerToken } from "../../config/api";
import { normalizeOrderStatus } from "../../utils/orderStatus";
import "./UserOrders.css";

export default function UserOrders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!getCustomerToken()) {
            setError("signin");
            return;
        }
        api("/order/my", { auth: "customer" })
            .then((res) => setOrders(res.data || []))
            .catch(() => setError("Could not load orders."));
    }, []);

    const summary = useMemo(() => {
        const total = orders.length;
        const ready = orders.filter((o) => normalizeOrderStatus(o.orderStatus) === "Ready").length;
        const inProgress = orders.filter((o) => {
            const n = normalizeOrderStatus(o.orderStatus);
            return n === "Pending" || n === "Processing";
        }).length;
        const spent = orders.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);
        return { total, ready, inProgress, spent };
    }, [orders]);

    const getStatusClass = (status) => normalizeOrderStatus(status).toLowerCase();

    return (
        <div className="user-orders-page">
            <div className="uo-header">
                <div>
                    <h1>My Orders</h1>
                    <p>Takeaway orders — pay when you pick up at the boutique.</p>
                    {error === "signin" && (
                        <p className="uo-note">
                            <button type="button" className="uo-linkish" onClick={() => navigate("/login?return=/dashboard/orders")}>
                                Sign in
                            </button>{" "}
                            to view your orders.
                        </p>
                    )}
                    {error && error !== "signin" && <p className="uo-note error">{error}</p>}
                </div>
            </div>

            <div className="uo-summary">
                <div className="uo-summary-card">
                    <span className="uo-summary-num">{summary.total}</span>
                    <span className="uo-summary-label">Total Orders</span>
                </div>
                <div className="uo-summary-card">
                    <span className="uo-summary-num">{summary.ready}</span>
                    <span className="uo-summary-label">Ready</span>
                </div>
                <div className="uo-summary-card">
                    <span className="uo-summary-num">{summary.inProgress}</span>
                    <span className="uo-summary-label">In progress</span>
                </div>
                <div className="uo-summary-card">
                    <span className="uo-summary-num">LKR {summary.spent.toLocaleString()}</span>
                    <span className="uo-summary-label">Total spent</span>
                </div>
            </div>

            <div className="uo-table-container">
                <table className="uo-table">
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
                        {error === "signin" ? (
                            <tr>
                                <td colSpan={5} className="uo-empty-cell">
                                    Sign in to see your order history.
                                </td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="uo-empty-cell">
                                    {error ? (
                                        "Something went wrong loading orders."
                                    ) : (
                                        <>
                                            No orders yet.{" "}
                                            <button type="button" className="uo-linkish" onClick={() => navigate("/shop")}>
                                                Visit the shop
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => {
                                const first = order.items?.[0]?.product?.productName || "Items";
                                const extra = (order.items?.length || 0) > 1 ? ` +${order.items.length - 1} more` : "";
                                const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—";
                                return (
                                    <tr key={order._id}>
                                        <td className="uo-id">{String(order._id).slice(-8).toUpperCase()}</td>
                                        <td className="uo-item">
                                            {first}
                                            {extra}
                                            {order.discountAmount > 0 && (
                                                <span className="uo-discount"> · Discount LKR {Number(order.discountAmount).toLocaleString()}</span>
                                            )}
                                        </td>
                                        <td className="uo-date">{date}</td>
                                        <td>
                                            <span className={`uo-status ${getStatusClass(order.orderStatus)}`}>
                                                {normalizeOrderStatus(order.orderStatus).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="uo-amount">LKR {Number(order.totalAmount).toLocaleString()}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
