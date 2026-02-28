import { useEffect, useState, useRef } from 'react'
import './Admin.css'

export default function Admin({ setActivePage }) {
  useEffect(() => {
    setActivePage('admin')
  }, [setActivePage])

  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [removeConfirm, setRemoveConfirm] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [actionMenu, setActionMenu] = useState(null) // id of open menu
  const menuRef = useRef(null)

  const [staffMembers, setStaffMembers] = useState([
    { id: 1, initials: 'NS', name: 'Nayomi Silva', username: 'nayomi_silva2020', email: 'nayomi.s@gmail.com', role: 'ADMIN' },
    { id: 2, initials: 'RP', name: 'Rohan Perera', username: '', email: 'rohan@gmail.com', role: 'PRODUCT MANAGER' },
    { id: 3, initials: 'NR', name: 'Nimal Ranasinghe', username: 'nimal.ran', email: 'nimal.r@gmail.com', role: 'SALES' },
    { id: 4, initials: 'CD', name: 'Chamara Dilshan', username: 'chamara5002', email: 'chamara@gmail.com', role: 'VIEWER' },
  ])

  const [newStaff, setNewStaff] = useState({ name: '', username:'', email: '', role: 'VIEWER' })
  const [editData, setEditData] = useState({ name: '', email: '', role: 'VIEWER' })

  // Close action menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActionMenu(null)
      }
    }
    if (actionMenu !== null) {
      document.addEventListener('mousedown', handleClick)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [actionMenu])

  const filteredStaff = staffMembers.filter(staff =>
    staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddStaff = (e) => {
    e.preventDefault()
    const initials = newStaff.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    const member = { id: staffMembers.length + 1, initials, name: newStaff.name, email: newStaff.email, role: newStaff.role }
    setStaffMembers([member, ...staffMembers])
    setNewStaff({ name: '', email: '', role: 'VIEWER' })
    setShowModal(false)
  }

  const openEdit = (staff) => {
    setSelectedStaff(staff)
    setEditData({ name: staff.name, email: staff.email, role: staff.role })
    setActionMenu(null)
    setEditModal(true)
  }

  const handleEdit = (e) => {
    e.preventDefault()
    const initials = editData.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    setStaffMembers(staffMembers.map(s =>
      s.id === selectedStaff.id ? { ...s, ...editData, initials } : s
    ))
    setEditModal(false)
    setSelectedStaff(null)
  }

  const openRemove = (staff) => {
    setSelectedStaff(staff)
    setActionMenu(null)
    setRemoveConfirm(true)
  }

  const handleRemove = () => {
    setStaffMembers(staffMembers.filter(s => s.id !== selectedStaff.id))
    setRemoveConfirm(false)
    setSelectedStaff(null)
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Admin & Staff Management</h1>
          <p>Manage your team and platform permissions.</p>
        </div>
        <button className="add-staff-btn" onClick={() => setShowModal(true)}>+ ADD STAFF MEMBER</button>
      </div>

      <div className="staff-controls">
        <div className="search-box">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search staff members..."
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
              <th>ID</th>
              <th>NAME</th>
              <th>EMAIL</th>
              <th>ROLE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map(staff => (
              <tr key={staff.id}>
                <td className='id'>{staff.id}</td>
                <td>
                  <div className="staff-info">
                    <div className="avatar">{staff.initials}</div>
                    <p className="staff-name">{staff.name}</p>
                  </div>
                </td>
                <td className="email">{staff.email}</td>
                <td><span className="role-badge">{staff.role}</span></td>
                <td>
                  <div className="action-wrapper" ref={actionMenu === staff.id ? menuRef : null}>
                    <button
                      className="action-icon"
                      onClick={() => setActionMenu(actionMenu === staff.id ? null : staff.id)}
                    >⋮</button>
                    {actionMenu === staff.id && (
                      <div className="action-dropdown">
                        <button className="action-dropdown-item" onClick={() => openEdit(staff)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          Edit
                        </button>
                        <button className="action-dropdown-item danger" onClick={() => openRemove(staff)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
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

      {/* Add Staff Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Staff Member</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddStaff}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" required value={newStaff.name} onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} placeholder="e.g. Jane Doe" />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input type="text" required value={newStaff.username} onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })} placeholder="e.g. jane2025" />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" required value={newStaff.email} onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })} placeholder="e.g. jane@gmail.com" />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={newStaff.role} onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}>
                  <option value="ADMIN">Admin</option>
                  <option value="PRODUCT MANAGER">Product Manager</option>
                  <option value="SALES">Sales</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Staff Member</h2>
              <button className="modal-close" onClick={() => setEditModal(false)}>✕</button>
            </div>
            <form onSubmit={handleEdit}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" required value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} placeholder="e.g. Jane Doe" />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" required value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} placeholder="e.g. jane.d@aurelia.lk" />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={editData.role} onChange={(e) => setEditData({ ...editData, role: e.target.value })}>
                  <option value="ADMIN">Admin</option>
                  <option value="PRODUCT MANAGER">Product Manager</option>
                  <option value="SALES">Sales</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setEditModal(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {removeConfirm && selectedStaff && (
        <div className="modal-overlay" onClick={() => setRemoveConfirm(false)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Remove Staff Member</h2>
              <button className="modal-close" onClick={() => setRemoveConfirm(false)}>✕</button>
            </div>
            <div className="confirm-body">
              <div className="confirm-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e53e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <p>Are you sure you want to remove <strong>{selectedStaff.name}</strong> from the team? This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setRemoveConfirm(false)}>Cancel</button>
              <button type="button" className="btn-danger" onClick={handleRemove}>Yes, Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}