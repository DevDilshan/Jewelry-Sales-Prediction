import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setStaffAuth, getStaffInfo, canAccess } from "../../config/api";
import "./Sidebar.css";

const ROLE_LABELS = {
  admin: "ADMIN",
  productmanager: "PRODUCT MANAGER",
  sales: "SALES",
  viewer: "VIEWER",
  designer: "DESIGNER",
};

const icons = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="7" height="7" rx="1.5" />
      <rect x="11" y="2" width="7" height="7" rx="1.5" />
      <rect x="2" y="11" width="7" height="7" rx="1.5" />
      <rect x="11" y="11" width="7" height="7" rx="1.5" />
    </svg>
  ),
  products: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="14" height="14" rx="2" />
      <path d="M3 8h14" />
      <path d="M8 3v5" />
    </svg>
  ),
  discounts: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 2.5L17.5 9.5a1 1 0 010 1.41l-6.59 6.59a1 1 0 01-1.41 0L2.5 10.5V4.5a2 2 0 012-2h6z" />
      <circle cx="7" cy="7" r="1.5" fill="currentColor" />
    </svg>
  ),
  feedbacks: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h12a2 2 0 012 2v7a2 2 0 01-2 2H7l-4 3V6a2 2 0 012-2z" />
    </svg>
  ),
  orders: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h1l2 9h8l2-6H6" />
      <circle cx="8" cy="16" r="1.5" />
      <circle cx="14" cy="16" r="1.5" />
    </svg>
  ),
  customers: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="6.5" r="2.5" />
      <path d="M2 16v-1a4 4 0 014-4h2" />
      <circle cx="14.5" cy="6" r="2" />
      <path d="M12 16v-0.5a3.5 3.5 0 013.5-3.5H16" />
    </svg>
  ),
  prediction: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 14l4-4 3 3 4-5 4 3" />
      <path d="M2 18h16" />
    </svg>
  ),
  staff: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 17v-1a3 3 0 00-3-3H8a3 3 0 00-3 3v1" />
      <circle cx="10" cy="7" r="3" />
    </svg>
  ),
  "sales-prediction": (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 14l4-4 3 3 4-5 4 3" />
      <path d="M2 18h16" />
    </svg>
  ),
  "custom-design-requests": (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17.5V14l8-8 4 4-8 8H3z" />
      <path d="M13 6l2-2 3 3-2 2" />
    </svg>
  ),
  "designer-portfolio": (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2l2 4 4.5.5-3.2 3.4.8 4.6L10 14l-4.1 2.5.8-4.6L3.5 6.5 8 6l2-4z" />
    </svg>
  ),
};

const ALL_MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard", path: "/admin" },
  { id: "products", label: "Products", path: "/admin/products" },
  { id: "discounts", label: "Discounts", path: "/admin/discounts" },
  { id: "feedbacks", label: "Feedbacks", path: "/admin/feedbacks" },
  { id: "orders", label: "Orders", path: "/admin/orders" },
  { id: "customers", label: "Customers", path: "/admin/customers" },
  { id: "sales-prediction", label: "Sales Prediction", path: "/admin/sales-prediction" },
  { id: "custom-design-requests", label: "Custom designs", path: "/admin/custom-design-requests" },
  { id: "designer-portfolio", label: "Portfolios", path: "/admin/designer-portfolio" },
  { id: "staff", label: "Staff", path: "/admin/staff" },
];

function staffDisplayName(info) {
  if (!info) return "Staff";
  const n = [info.firstName, info.lastName].filter(Boolean).join(" ").trim();
  if (n) return n;
  return info.username || "Staff";
}

function staffAvatarInitials(info) {
  if (!info) return "?";
  const fn = (info.firstName || "").trim();
  const ln = (info.lastName || "").trim();
  if (fn && ln) return `${fn[0]}${ln[0]}`.toUpperCase();
  if (fn.length >= 2) return fn.slice(0, 2).toUpperCase();
  if (fn.length === 1) return fn[0].toUpperCase();
  const u = (info.username || "").trim();
  return u.length >= 2 ? u.slice(0, 2).toUpperCase() : (u.charAt(0) || "?").toUpperCase();
}

export default function Sidebar({ activePage, setActivePage }) {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const staffInfo = getStaffInfo();
  const displayName = staffDisplayName(staffInfo);
  const displayRole = ROLE_LABELS[staffInfo?.role] || (staffInfo?.role || "").toUpperCase() || "—";

  const handleNavigate = (item) => {
    setActivePage(item.id);
    navigate(item.path);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="logo-text">Beceff</span>
      </div>

      <nav className="sidebar-nav">
        {ALL_MENU_ITEMS.filter((item) => canAccess(item.id)).map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? "active" : ""}`}
            onClick={() => handleNavigate(item)}
          >
            <span className="nav-icon">{icons[item.id] || icons.dashboard}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-section">
          {staffInfo?.profileImage ? (
            <div className="user-avatar-img">
              <img src={staffInfo.profileImage} alt="" />
            </div>
          ) : (
            <div className="user-avatar-text">{staffAvatarInitials(staffInfo)}</div>
          )}
          <div className="user-info">
            <p className="user-name">{displayName}</p>
            <p className="user-role">{displayRole}</p>
          </div>
          <button className="user-menu-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
            ⋮
          </button>
        </div>
        {showUserMenu && (
          <div className="user-menu">
            <button
              onClick={() => {
                setActivePage("profile");
                navigate("/admin/profile");
                setShowUserMenu(false);
              }}
            >
              My Profile
            </button>
            <button onClick={() => navigate("/")}>Visit Website</button>
            <button
              onClick={() => {
                setStaffAuth(null, null);
                setShowUserMenu(false);
                navigate("/admin/login");
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
