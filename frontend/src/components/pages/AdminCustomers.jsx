import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./AdminCustomers.css";
import { api, getStaffToken } from "../../config/api";

function customerDisplayName(c) {
  const n = [c.firstName, c.lastName].filter(Boolean).join(" ").trim();
  return n || c.email || "Customer";
}

function initials(c) {
  const name = customerDisplayName(c);
  const parts = name.split(/\s+/).filter(Boolean);
  const a = (parts[0] || "?").charAt(0);
  const b = (parts[1] || parts[0] || "?").charAt(0);
  return (a + b).toUpperCase().slice(0, 2);
}

function formatWhen(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return "—";
  }
}

function truncate(s, max) {
  const t = (s || "").trim();
  if (!t) return "—";
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export default function AdminCustomers({ setActivePage }) {
  useEffect(() => {
    setActivePage("customers");
  }, [setActivePage]);

  const [rows, setRows] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [detail, setDetail] = useState(null);

  const load = () => {
    setLoadError("");
    if (!getStaffToken()) {
      setLoadError("auth");
      setRows([]);
      return;
    }
    api("/staff/customers", { auth: "staff" })
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch((e) => {
        if (e.status === 401 || e.status === 403) setLoadError("forbidden");
        else setLoadError(e.message || "Could not load customers");
      });
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((c) => {
      const blob = [
        customerDisplayName(c),
        c.email,
        c.phone,
        c.address,
        String(c._id || ""),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [rows, searchQuery]);

  return (
    <div className="customers-admin-page">
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p>Registered shop accounts — name, contact, and address as saved on their profile.</p>
        </div>
      </div>

      {loadError === "auth" && (
        <p className="customers-admin-banner">
          <Link to="/admin/login">Sign in</Link> as staff to view customers.
        </p>
      )}
      {loadError === "forbidden" && (
        <p className="customers-admin-banner error">You don&apos;t have permission to view this list.</p>
      )}
      {loadError && loadError !== "auth" && loadError !== "forbidden" && (
        <p className="customers-admin-banner error">{loadError}</p>
      )}

      <div className="customers-admin-controls">
        <div className="customers-admin-search">
          <svg className="customers-admin-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="customers-admin-search-input"
            placeholder="Search name, email, phone, address, id…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={loadError === "auth"}
          />
        </div>
        <span className="customers-admin-count">
          {filtered.length} of {rows.length} customer{rows.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="customers-admin-table-wrap">
        <table className="customers-admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Registered</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="customers-admin-empty">
                  {rows.length === 0 ? "No registered customers yet." : "No matches for your search."}
                </td>
              </tr>
            )}
            {filtered.map((c) => (
              <tr key={c._id} className="customers-admin-row" onClick={() => setDetail(c)}>
                <td>
                  <div className="customers-admin-user">
                    <div className="customers-admin-avatar">{initials(c)}</div>
                    <span className="customers-admin-name">{customerDisplayName(c)}</span>
                  </div>
                </td>
                <td className="customers-admin-muted">{c.email || "—"}</td>
                <td>{(c.phone || "").trim() || "—"}</td>
                <td className="customers-admin-address">{truncate(c.address, 48)}</td>
                <td className="customers-admin-muted">{formatWhen(c.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="customers-admin-overlay" role="presentation" onClick={() => setDetail(null)}>
          <div className="customers-admin-modal" role="dialog" aria-modal="true" aria-labelledby="cust-detail-title" onClick={(e) => e.stopPropagation()}>
            <div className="customers-admin-modal-head">
              <h2 id="cust-detail-title">Customer details</h2>
              <button type="button" className="customers-admin-modal-close" onClick={() => setDetail(null)} aria-label="Close">
                ✕
              </button>
            </div>
            <div className="customers-admin-modal-body">
              <div className="customers-admin-modal-hero">
                <div className="customers-admin-avatar customers-admin-avatar--lg">{initials(detail)}</div>
                <div>
                  <p className="customers-admin-modal-title">{customerDisplayName(detail)}</p>
                  <p className="customers-admin-modal-email">{detail.email || "—"}</p>
                </div>
              </div>
              <dl className="customers-admin-dl">
                <dt>First name</dt>
                <dd>{(detail.firstName || "").trim() || "—"}</dd>
                <dt>Last name</dt>
                <dd>{(detail.lastName || "").trim() || "—"}</dd>
                <dt>Phone</dt>
                <dd>{(detail.phone || "").trim() || "—"}</dd>
                <dt>Address</dt>
                <dd className="customers-admin-dd-multiline">{(detail.address || "").trim() || "—"}</dd>
                <dt>Account ID</dt>
                <dd className="customers-admin-mono">{String(detail._id || "—")}</dd>
                <dt>Registered</dt>
                <dd>{formatWhen(detail.createdAt)}</dd>
                <dt>Last updated</dt>
                <dd>{formatWhen(detail.updatedAt)}</dd>
              </dl>
            </div>
            <div className="customers-admin-modal-foot">
              <button type="button" className="customers-admin-btn-primary" onClick={() => setDetail(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
