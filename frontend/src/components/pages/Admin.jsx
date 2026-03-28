import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import "./Admin.css";
import { api, getStaffToken } from "../../config/api";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "productmanager", label: "Product Manager" },
  { value: "sales", label: "Sales" },
  { value: "viewer", label: "Viewer" },
];

function roleLabel(role) {
  return ROLE_OPTIONS.find((r) => r.value === role)?.label || role;
}

function initialsFrom(username, email) {
  const u = (username || "").trim();
  if (u.length >= 2) return u.slice(0, 2).toUpperCase();
  const e = (email || "").split("@")[0] || "";
  return e.slice(0, 2).toUpperCase() || "?";
}

export default function Admin({ setActivePage }) {
  useEffect(() => {
    setActivePage("admin");
  }, [setActivePage]);

  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);
  const menuRef = useRef(null);

  const [staffMembers, setStaffMembers] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [passwordReveal, setPasswordReveal] = useState(null);

  const [newStaff, setNewStaff] = useState({ username: "", email: "", role: "viewer" });
  const [editData, setEditData] = useState({ username: "", email: "", role: "viewer" });

  const loadStaff = () => {
    setLoadError("");
    if (!getStaffToken()) {
      setLoadError("auth");
      setStaffMembers([]);
      return;
    }
    api("/staff", { auth: "staff" })
      .then((rows) => setStaffMembers(Array.isArray(rows) ? rows : []))
      .catch((e) => {
        if (e.status === 401 || e.status === 403) setLoadError("forbidden");
        else setLoadError(e.message || "Could not load staff");
      });
  };

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActionMenu(null);
      }
    };
    if (actionMenu !== null) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [actionMenu]);

  const filteredStaff = staffMembers.filter(
    (staff) =>
      (staff.username || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (staff.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!getStaffToken()) return;
    setSaving(true);
    try {
      const data = await api("/staff/register", {
        method: "POST",
        body: {
          username: newStaff.username.trim(),
          email: newStaff.email.trim(),
          role: newStaff.role,
        },
        auth: "staff",
      });
      setNewStaff({ username: "", email: "", role: "viewer" });
      setShowModal(false);
      setPasswordReveal({
        username: data.user?.username,
        temporaryPassword: data.temporaryPassword,
      });
      loadStaff();
    } catch (err) {
      alert(err.message || "Could not add staff");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (staff) => {
    setSelectedStaff(staff);
    setEditData({
      username: staff.username || "",
      email: staff.email || "",
      role: staff.role || "viewer",
    });
    setActionMenu(null);
    setEditModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedStaff?._id || !getStaffToken()) return;
    setSaving(true);
    try {
      await api(`/staff/${selectedStaff._id}`, {
        method: "PUT",
        body: {
          username: editData.username.trim(),
          email: editData.email.trim(),
          role: editData.role,
        },
        auth: "staff",
      });
      setEditModal(false);
      setSelectedStaff(null);
      loadStaff();
    } catch (err) {
      alert(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const openRemove = (staff) => {
    setSelectedStaff(staff);
    setActionMenu(null);
    setRemoveConfirm(true);
  };

  const handleRemove = async () => {
    if (!selectedStaff?._id || !getStaffToken()) return;
    try {
      await api(`/staff/${selectedStaff._id}`, { method: "DELETE", auth: "staff" });
      setRemoveConfirm(false);
      setSelectedStaff(null);
      loadStaff();
    } catch (err) {
      alert(err.message || "Remove failed");
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Admin & Staff Management</h1>
          <p>Add team members with a default password they can change after signing in.</p>
        </div>
        <button
          type="button"
          className="add-staff-btn"
          disabled={loadError === "forbidden" || loadError === "auth"}
          onClick={() => setShowModal(true)}
        >
          + ADD STAFF MEMBER
        </button>
      </div>

      {loadError === "auth" && (
        <p className="admin-banner">
          <Link to="/admin/login">Sign in</Link> as staff to manage users.
        </p>
      )}
      {loadError === "forbidden" && (
        <p className="admin-banner error">Only administrators can view this page.</p>
      )}
      {loadError && loadError !== "auth" && loadError !== "forbidden" && (
        <p className="admin-banner error">{loadError}</p>
      )}

      <div className="staff-controls">
        <div className="search-box">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by username or email..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="staff-table-container">
        <table className="staff-table">
          <thead>
            <tr>
              <th>USERNAME</th>
              <th>EMAIL</th>
              <th>ROLE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map((staff) => (
              <tr key={staff._id}>
                <td>
                  <div className="staff-info">
                    <div className="avatar">{initialsFrom(staff.username, staff.email)}</div>
                    <p className="staff-name">{staff.username}</p>
                  </div>
                </td>
                <td className="email">{staff.email}</td>
                <td>
                  <span className="role-badge">{roleLabel(staff.role)}</span>
                </td>
                <td>
                  <div className="action-wrapper" ref={actionMenu === staff._id ? menuRef : null}>
                    <button
                      type="button"
                      className="action-icon"
                      onClick={() => setActionMenu(actionMenu === staff._id ? null : staff._id)}
                    >
                      ⋮
                    </button>
                    {actionMenu === staff._id && (
                      <div className="action-dropdown">
                        <button type="button" className="action-dropdown-item" onClick={() => openEdit(staff)}>
                          Edit
                        </button>
                        <button type="button" className="action-dropdown-item danger" onClick={() => openRemove(staff)}>
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

      {showModal && (
        <div className="modal-overlay" onClick={() => !saving && setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Staff Member</h2>
              <button type="button" className="modal-close" onClick={() => !saving && setShowModal(false)}>
                ✕
              </button>
            </div>
            <p className="admin-modal-hint">
              A <strong>temporary default password</strong> is generated automatically. You will see it once after saving — share it with the new user so they can sign in and change it under My Profile.
            </p>
            <form onSubmit={handleAddStaff}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  required
                  value={newStaff.username}
                  onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                  placeholder="e.g. jane_doe"
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  placeholder="e.g. jane@beceff.com"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={newStaff.role} onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}>
                  {ROLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" disabled={saving} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={saving}>
                  {saving ? "Adding…" : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {passwordReveal && (
        <div className="modal-overlay" onClick={() => setPasswordReveal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Temporary password</h2>
              <button type="button" className="modal-close" onClick={() => setPasswordReveal(null)}>
                ✕
              </button>
            </div>
            <p className="admin-password-reveal-user">
              User: <strong>{passwordReveal.username}</strong>
            </p>
            <div className="admin-password-box">
              <code>{passwordReveal.temporaryPassword}</code>
              <button
                type="button"
                className="btn-submit"
                style={{ marginTop: 12 }}
                onClick={() => {
                  navigator.clipboard.writeText(passwordReveal.temporaryPassword);
                }}
              >
                Copy password
              </button>
            </div>
            <p className="admin-modal-hint">They should sign in at Staff sign in, then change this under My Profile.</p>
            <div className="modal-actions">
              <button type="button" className="btn-submit" onClick={() => setPasswordReveal(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {editModal && (
        <div className="modal-overlay" onClick={() => !saving && setEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Staff Member</h2>
              <button type="button" className="modal-close" onClick={() => !saving && setEditModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleEdit}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  required
                  value={editData.username}
                  onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={editData.role} onChange={(e) => setEditData({ ...editData, role: e.target.value })}>
                  {ROLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" disabled={saving} onClick={() => setEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={saving}>
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {removeConfirm && selectedStaff && (
        <div className="modal-overlay" onClick={() => setRemoveConfirm(false)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Remove Staff Member</h2>
              <button type="button" className="modal-close" onClick={() => setRemoveConfirm(false)}>
                ✕
              </button>
            </div>
            <div className="confirm-body">
              <p>
                Remove <strong>{selectedStaff.username}</strong>? They will no longer be able to sign in.
              </p>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setRemoveConfirm(false)}>
                Cancel
              </button>
              <button type="button" className="btn-danger" onClick={handleRemove}>
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
