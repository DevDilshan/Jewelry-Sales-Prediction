import { useEffect, useState } from "react";
import "./CustomDesignRequestsAdmin.css";
import { api, getStaffRole, uploadUrl } from "../../config/api";

const STATUSES = ["pending", "in_review", "quoted", "declined", "completed"];

const STATUS_LABELS = {
  pending: "Pending",
  in_review: "In review",
  quoted: "Quoted",
  declined: "Declined",
  completed: "Completed",
};

function customerLabel(row) {
  const c = row.customer;
  if (c && (c.firstName || c.lastName)) {
    return [c.firstName, c.lastName].filter(Boolean).join(" ");
  }
  return "—";
}

export default function CustomDesignRequestsAdmin({ setActivePage }) {
  useEffect(() => {
    setActivePage("custom-design-requests");
  }, [setActivePage]);

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ total: 0 });
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [editStatus, setEditStatus] = useState("pending");
  const [editNote, setEditNote] = useState("");
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveError, setSaveError] = useState("");

  const readOnly = getStaffRole() === "viewer";

  const load = () => {
    setLoading(true);
    setError("");
    const q = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : "";
    api(`/custom-design-requests/admin${q}`, { auth: "staff" })
      .then((res) => {
        setRows(Array.isArray(res.data) ? res.data : []);
        setMeta(res.meta || { total: 0 });
      })
      .catch(() => setError("Could not load requests."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const openDetail = (row) => {
    setSelected(row);
    setEditStatus(row.status || "pending");
    setEditNote(row.staffNote || "");
    setSaveError("");
  };

  const saveDetail = async () => {
    if (!selected || readOnly) return;
    setSaveBusy(true);
    setSaveError("");
    try {
      const res = await api(`/custom-design-requests/admin/${selected._id}`, {
        method: "PATCH",
        body: { status: editStatus, staffNote: editNote },
        auth: "staff",
      });
      const updated = res.data;
      setRows((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
      setSelected(updated);
    } catch (e) {
      setSaveError(e.message || "Could not save.");
    } finally {
      setSaveBusy(false);
    }
  };

  return (
    <div className="cda-page">
      <div className="cda-header">
        <h1>Custom design requests</h1>
        <p className="cda-lead">Customer-submitted sketches and descriptions. Update status and internal notes.</p>
      </div>

      <div className="cda-toolbar">
        <label className="cda-filter">
          Status
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        {readOnly && <span className="cda-readonly-badge">View only</span>}
      </div>

      {loading && <p className="cda-muted">Loading…</p>}
      {error && <p className="cda-error">{error}</p>}

      {!loading && !error && (
        <div className="cda-table-wrap">
          <table className="cda-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Title</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="cda-empty-cell">
                    No requests yet.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row._id}>
                    <td>{row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"}</td>
                    <td>{customerLabel(row)}</td>
                    <td>{row.title?.trim() || "—"}</td>
                    <td>
                      <span className={`cda-pill cda-pill--${row.status}`}>{STATUS_LABELS[row.status] || row.status}</span>
                    </td>
                    <td>
                      <button type="button" className="cda-view-btn" onClick={() => openDetail(row)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {meta.total > 0 && (
            <p className="cda-meta">
              Showing {rows.length} of {meta.total}
            </p>
          )}
        </div>
      )}

      {selected && (
        <div className="cda-modal-overlay" role="presentation" onClick={() => setSelected(null)}>
          <div className="cda-modal" role="dialog" aria-labelledby="cda-modal-title" onClick={(e) => e.stopPropagation()}>
            <div className="cda-modal-head">
              <h2 id="cda-modal-title">{selected.title?.trim() || "Custom design"}</h2>
              <button type="button" className="cda-modal-close" onClick={() => setSelected(null)} aria-label="Close">
                ✕
              </button>
            </div>
            <div className="cda-modal-body">
              <div className="cda-modal-sketch">
                {selected.sketchRelPath ? (
                  <a href={uploadUrl(selected.sketchRelPath)} target="_blank" rel="noopener noreferrer">
                    <img src={uploadUrl(selected.sketchRelPath)} alt="Sketch" />
                  </a>
                ) : (
                  <span>No image</span>
                )}
              </div>
              <div className="cda-modal-meta">
                <p>
                  <strong>Customer:</strong> {customerLabel(selected)}{" "}
                  {selected.customer?.email ? <span className="cda-email">({selected.customer.email})</span> : null}
                </p>
                {selected.customer?.phone ? (
                  <p>
                    <strong>Phone:</strong> {selected.customer.phone}
                  </p>
                ) : null}
                <p>
                  <strong>Submitted:</strong> {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : "—"}
                </p>
              </div>
              <div className="cda-modal-desc">
                <strong>Description</strong>
                <p>{selected.description}</p>
              </div>

              <div className="cda-modal-form">
                <label className="cda-field">
                  Status
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    disabled={readOnly}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="cda-field">
                  Staff note
                  <textarea
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    rows={4}
                    maxLength={4000}
                    disabled={readOnly}
                    placeholder="Internal notes (not shown to customer)"
                  />
                </label>
                {saveError && <p className="cda-save-error">{saveError}</p>}
                {!readOnly && (
                  <button type="button" className="cda-save-btn" onClick={saveDetail} disabled={saveBusy}>
                    {saveBusy ? "Saving…" : "Save changes"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
