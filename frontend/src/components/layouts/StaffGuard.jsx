import { Navigate } from "react-router-dom";
import { getStaffToken, canAccess, getStaffRole } from "../../config/api";
import "./StaffAccessDenied.css";

/**
 * Wrap an admin page route to:
 * 1. Redirect to /admin/login if not signed in
 * 2. If signed in but role lacks permission: show message (page content hidden, sidebar stays)
 */
export default function StaffGuard({ pageId, children }) {
  if (!getStaffToken()) {
    return <Navigate to="/admin/login" replace />;
  }

  if (pageId && !canAccess(pageId)) {
    return (
      <div className="staff-access-denied">
        <div className="staff-access-denied-icon" aria-hidden>
          🔒
        </div>
        <h2>You don&apos;t have access</h2>
        <p>
          Your account role doesn&apos;t include permission to use this section. If you need access,
          ask an administrator to update your role.
        </p>
        <p className="staff-access-denied-hint">
          Current role: <strong>{getStaffRole() || "—"}</strong>
        </p>
      </div>
    );
  }

  return children;
}
